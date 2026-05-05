from flask_restful import Resource, reqparse
from models import Message, Conversation, User
from extensions import db
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .serializers import serialize_model
from utils.danger_detector import get_detector
from utils.llm_danger_detector import get_llm_detector
from utils.task_queue import get_task_queue
import logging
import uuid

logger = logging.getLogger(__name__)


class MessageResource(Resource):
    parser = reqparse.RequestParser()
    parser.add_argument(
        "conversation_id", type=int, required=True, help="Conversation ID is required."
    )
    parser.add_argument(
        "sender_id", type=int, required=True, help="Sender ID is required."
    )
    parser.add_argument(
        "receiver_id", type=int, required=True, help="Receiver ID is required."
    )
    parser.add_argument(
        "content", type=str, required=True, help="Message content is required."
    )
    parser.add_argument("is_read", type=bool, required=False)

    @jwt_required()
    def get(self, message_id=None):
        current_user_id = get_jwt_identity()
        if not current_user_id:
            return {"error": "Unauthorized"}, 401
        
        if message_id:
            msg = Message.query.get_or_404(message_id)
            
            # SECURITY: Verify user is part of this message's conversation
            conversation = Conversation.query.get(msg.conversation_id)
            if not conversation or (conversation.user1_id != current_user_id and conversation.user2_id != current_user_id):
                return {"error": "Forbidden: You cannot access this message"}, 403
            
            return serialize_model(
                msg,
                [
                    "id",
                    "conversation_id",
                    "sender_id",
                    "receiver_id",
                    "content",
                    "is_read",
                    "created_at",
                ],
            ), 200

        # Optional filters
        conversation_id = request.args.get("conversation_id", type=int)
        sender_id = request.args.get("sender_id", type=int)
        receiver_id = request.args.get("receiver_id", type=int)

        query = Message.query

        # SECURITY: If filtering by conversation, verify user is part of it
        if conversation_id:
            conversation = Conversation.query.get(conversation_id)
            if not conversation or (conversation.user1_id != current_user_id and conversation.user2_id != current_user_id):
                return {"error": "Forbidden: You cannot access messages in this conversation"}, 403
            query = query.filter_by(conversation_id=conversation_id)
        
        if sender_id:
            query = query.filter_by(sender_id=sender_id)
        if receiver_id:
            query = query.filter_by(receiver_id=receiver_id)

        messages = query.order_by(Message.created_at.asc()).all()

        return [
            serialize_model(
                m,
                [
                    "id",
                    "conversation_id",
                    "sender_id",
                    "receiver_id",
                    "content",
                    "is_read",
                    "created_at",
                ],
            )
            for m in messages
        ], 200

    @jwt_required()
    def post(self):
        current_user_id = get_jwt_identity()
        data = self.parser.parse_args()
        
        # SECURITY: Verify sender is the authenticated user
        if data["sender_id"] != current_user_id:
            return {"error": "Forbidden: You cannot send messages as another user"}, 403
        
        # SECURITY: Verify user is part of the conversation
        conversation = Conversation.query.get(data["conversation_id"])
        if not conversation or (conversation.user1_id != current_user_id and conversation.user2_id != current_user_id):
            return {"error": "Forbidden: You are not part of this conversation"}, 403
        
        # SECURITY: Verify receiver is the other participant in the conversation
        expected_receiver = conversation.user2_id if conversation.user1_id == current_user_id else conversation.user1_id
        if data["receiver_id"] != expected_receiver:
            return {"error": "Forbidden: Invalid receiver for this conversation"}, 403

        # Run rule-based danger detection on message content
        detector = get_detector(verbose=False)
        detection_result = detector.analyze(
            text=data["content"],
            metadata={
                "type": "direct_message",
                "conversation_id": data["conversation_id"],
            },
        )

        # Log detection for monitoring
        if detection_result.severity_score > 0:
            logger.warning(
                f"Danger detection triggered for message: "
                f"score={detection_result.severity_score:.2f}, "
                f"level={detection_result.severity_level.value}, "
                f"categories={detection_result.categories}"
            )

        message = Message(
            conversation_id=data["conversation_id"],
            sender_id=data["sender_id"],
            receiver_id=data["receiver_id"],
            content=data["content"],
        )

        # If critical danger detected, flag message status immediately
        if detection_result.severity_level.value == "critical":
            message.message_status = "flagged_danger"
            logger.error(
                f"CRITICAL danger detected in message from user {data['sender_id']}: "
                f"{detection_result.categories}"
            )
        elif detection_result.severity_level.value == "high":
            message.message_status = "pending_review"
        else:
            # For medium/low, submit async LLM enhancement if enabled
            message.message_status = "sent"

        db.session.add(message)
        db.session.commit()

        # Prepare response with rule-based detection
        response = serialize_model(
            message,
            [
                "id",
                "conversation_id",
                "sender_id",
                "receiver_id",
                "content",
                "is_read",
                "created_at",
                "message_status",
            ],
        )
        response["danger_detection"] = {
            "severity_score": detection_result.severity_score,
            "severity_level": detection_result.severity_level.value,
            "categories": detection_result.categories,
            "suggested_action": detection_result.suggested_action,
            "llm_enhanced": False,
        }

        # If LLM detection enabled and not already flagged, submit async task
        llm_detector = get_llm_detector()
        if llm_detector.enabled and detection_result.severity_level.value != "critical":
            task_id = f"llm_detect_{message.id}_{uuid.uuid4().hex[:8]}"
            task_queue = get_task_queue()

            # Submit async LLM enhancement
            async def enhance_and_update():
                """Async function to enhance detection and update message status"""
                try:
                    llm_result = await llm_detector.enhance_detection(
                        text=data["content"],
                        rule_based_result=detection_result,
                        context={
                            "message_id": message.id,
                            "sender_id": data["sender_id"],
                        },
                    )

                    # Update message status based on LLM result
                    msg = Message.query.get(message.id)
                    if msg:
                        if llm_result.severity_level.value == "critical":
                            msg.message_status = "flagged_danger"
                            logger.error(
                                f"LLM: CRITICAL danger detected in message {message.id}: "
                                f"{llm_result.categories}"
                            )
                        elif llm_result.severity_level.value == "high":
                            msg.message_status = "pending_review"
                            logger.warning(
                                f"LLM: HIGH danger in message {message.id}: "
                                f"score={llm_result.severity_score:.2f}"
                            )
                        db.session.commit()

                except Exception as e:
                    logger.error(f"LLM enhancement task failed: {str(e)}")

            task_queue.submit_task(task_id, enhance_and_update)
            response["danger_detection"]["llm_task_id"] = task_id
            response["danger_detection"]["note"] = "Async LLM enhancement in progress"

        return response, 201

    @jwt_required()
    def put(self, message_id):
        current_user_id = get_jwt_identity()
        message = Message.query.get_or_404(message_id)
        
        # SECURITY: Only sender or receiver can update a message
        if message.sender_id != current_user_id and message.receiver_id != current_user_id:
            return {"error": "Forbidden: You cannot update this message"}, 403
        
        # SECURITY: Only sender can edit content; receiver can only mark as read
        data = request.get_json()
        
        if "content" in data:
            if message.sender_id != current_user_id:
                return {"error": "Forbidden: Only sender can edit message content"}, 403
            message.content = data["content"]
        
        if "is_read" in data:
            if message.receiver_id != current_user_id:
                return {"error": "Forbidden: Only receiver can mark messages as read"}, 403
            message.is_read = data["is_read"]

        db.session.commit()

        return serialize_model(
            message,
            [
                "id",
                "conversation_id",
                "sender_id",
                "receiver_id",
                "content",
                "is_read",
                "created_at",
            ],
        ), 200

    @jwt_required()
    def delete(self, message_id):
        current_user_id = get_jwt_identity()
        message = Message.query.get_or_404(message_id)
        
        # SECURITY: Only sender can delete a message
        if message.sender_id != current_user_id:
            return {"error": "Forbidden: Only sender can delete this message"}, 403
        
        db.session.delete(message)
        db.session.commit()
        return {"message": f"Message {message_id} deleted."}, 204
