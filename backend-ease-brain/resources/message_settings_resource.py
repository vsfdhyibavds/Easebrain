from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Message, Conversation
from extensions import db


class MessageSettingsResource(Resource):
    """Handle message settings (pin/unpin)."""

    @jwt_required()
    def post(self, conversation_id, message_id):
        """Pin or unpin a message."""
        user_id = get_jwt_identity()

        # Verify user is part of this conversation
        Conversation.query.filter(
            (Conversation.id == conversation_id)
            & ((Conversation.user1_id == user_id) | (Conversation.user2_id == user_id))
        ).first_or_404()

        # Verify message exists
        message = Message.query.filter_by(
            id=message_id, conversation_id=conversation_id
        ).first_or_404()

        data = request.get_json()
        is_pinned = data.get("is_pinned", False)

        message.is_pinned = is_pinned
        db.session.commit()

        return {
            "id": message.id,
            "is_pinned": message.is_pinned,
        }, 200

    @jwt_required()
    def get(self, conversation_id):
        """Get all pinned messages in a conversation."""
        user_id = get_jwt_identity()

        # Verify user is part of this conversation
        Conversation.query.filter(
            (Conversation.id == conversation_id)
            & ((Conversation.user1_id == user_id) | (Conversation.user2_id == user_id))
        ).first_or_404()

        # Get pinned messages
        pinned_messages = (
            Message.query.filter_by(conversation_id=conversation_id, is_pinned=True)
            .order_by(Message.created_at.desc())
            .all()
        )

        return [
            {
                "id": msg.id,
                "content": msg.content,
                "sender_id": msg.sender_id,
                "created_at": msg.created_at.isoformat(),
            }
            for msg in pinned_messages
        ], 200
