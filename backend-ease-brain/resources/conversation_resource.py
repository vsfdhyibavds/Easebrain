from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Conversation, Message, User, Reaction
from extensions import db
from sqlalchemy import or_
from sqlalchemy.orm import selectinload
from datetime import datetime, timedelta


# In-memory typing indicator store: {conversation_id: {user_id: timestamp}}
_typing_status = {}


def get_user_display_name(user):
    """Get display name from user object."""
    if not user:
        return "Unknown"
    if user.first_name or user.last_name:
        parts = [user.first_name, user.last_name]
        return " ".join(p for p in parts if p).strip() or user.username or "Unknown"
    return user.username or "Unknown"


def serialize_message_with_reactions(msg, user_id):
    """Serialize message with reactions grouped by emoji (optimized)."""
    # Group reactions by emoji - reactions and users already loaded via selectinload
    reaction_summary = {}
    for reaction in msg.reactions:
        if reaction.emoji not in reaction_summary:
            reaction_summary[reaction.emoji] = {
                "id": reaction.id,
                "count": 0,
                "users": [],
                "current_user_reacted": False,
            }
        reaction_summary[reaction.emoji]["count"] += 1
        # User already loaded via eager loading, no additional query
        reaction_summary[reaction.emoji]["users"].append(
            {
                "id": reaction.user.id,
                "name": get_user_display_name(reaction.user),
            }
        )
        if reaction.user.id == user_id:
            reaction_summary[reaction.emoji]["current_user_reacted"] = True
            reaction_summary[reaction.emoji]["id"] = reaction.id

    return {
        "id": msg.id,
        "sender": msg.sender_id,
        "content": msg.content,
        "timestamp": msg.created_at.isoformat(),
        "edited_at": msg.edited_at.isoformat() if msg.edited_at else None,
        "isOwn": msg.sender_id == user_id,
        "is_read": msg.is_read,
        "message_status": msg.message_status,
        "reactions": reaction_summary,
        "is_pinned": msg.is_pinned,
    }


class ConversationResource(Resource):
    """Handle conversation operations."""

    @jwt_required()
    def get(self, conversation_id=None):
        """Get conversation(s) for the authenticated user."""
        user_id = get_jwt_identity()

        if conversation_id:
            # Get specific conversation
            conversation = Conversation.query.filter(
                (Conversation.id == conversation_id)
                & (
                    (Conversation.user1_id == user_id)
                    | (Conversation.user2_id == user_id)
                )
            ).first_or_404()

            # Get the other user
            other_user_id = (
                conversation.user2_id
                if conversation.user1_id == user_id
                else conversation.user1_id
            )
            other_user = User.query.get(other_user_id)

            # Get last message
            last_message = (
                Message.query.filter_by(conversation_id=conversation_id)
                .order_by(Message.created_at.desc())
                .first()
            )

            return {
                "id": conversation.id,
                "user_id": user_id,
                "other_user": {
                    "id": other_user.id,
                    "name": get_user_display_name(other_user),
                    "email": other_user.email,
                    "avatar": other_user.email[0].upper() if other_user else "?",
                },
                "last_message": last_message.content
                if last_message
                else "No messages yet",
                "last_message_time": last_message.created_at.isoformat()
                if last_message
                else None,
                "updated_at": conversation.updated_at.isoformat(),
                "archived": conversation.user1_archived
                if conversation.user1_id == user_id
                else conversation.user2_archived,
                "muted": conversation.user1_muted
                if conversation.user1_id == user_id
                else conversation.user2_muted,
                "last_seen": (
                    conversation.user1_last_seen
                    if conversation.user1_id == user_id
                    else conversation.user2_last_seen
                ).isoformat(),
            }, 200

        # Get all conversations for this user with optimized queries
        conversations = (
            Conversation.query.filter(
                or_(Conversation.user1_id == user_id, Conversation.user2_id == user_id)
            )
            .order_by(Conversation.updated_at.desc())
            .all()
        )

        # Fetch all related users in one query (optimization for N+1)
        other_user_ids = [
            conv.user2_id if conv.user1_id == user_id else conv.user1_id
            for conv in conversations
        ]
        users_map = {
            u.id: u
            for u in User.query.filter(User.id.in_(other_user_ids)).all()
            if other_user_ids
        }

        # Fetch last messages for all conversations efficiently
        from sqlalchemy import func

        subquery = (
            db.session.query(
                Message.conversation_id,
                func.max(Message.id).label("max_id"),
            )
            .filter(Message.conversation_id.in_([c.id for c in conversations]))
            .group_by(Message.conversation_id)
            .subquery()
        )

        last_messages = {}
        if subquery.c.max_id:
            for msg in Message.query.filter(
                Message.id.in_(
                    db.session.query(subquery.c.max_id).filter(
                        subquery.c.max_id.isnot(None)
                    )
                )
            ).all():
                last_messages[msg.conversation_id] = msg

        # Count unread messages for all conversations in one query
        unread_counts = {}
        unread_results = (
            db.session.query(
                Message.conversation_id, func.count(Message.id).label("count")
            )
            .filter(
                Message.conversation_id.in_([c.id for c in conversations]),
                Message.receiver_id == user_id,
                ~Message.is_read,
            )
            .group_by(Message.conversation_id)
            .all()
        )
        for conv_id, count in unread_results:
            unread_counts[conv_id] = count

        result = []
        for conv in conversations:
            other_user_id = conv.user2_id if conv.user1_id == user_id else conv.user1_id
            other_user = users_map.get(other_user_id)
            last_message = last_messages.get(conv.id)
            unread_count = unread_counts.get(conv.id, 0)

            result.append(
                {
                    "id": conv.id,
                    "name": get_user_display_name(other_user),
                    "email": other_user.email if other_user else "",
                    "avatar": (other_user.email[0].upper() if other_user else "?"),
                    "lastMessage": last_message.content
                    if last_message
                    else "No messages yet",
                    "timestamp": last_message.created_at.isoformat()
                    if last_message
                    else conv.updated_at.isoformat(),
                    "unread": unread_count,
                    "color": "bg-pink-100",  # Can be dynamic based on user preference
                }
            )

        return result, 200

    @jwt_required()
    def post(self):
        """Create or get existing conversation with a user."""
        user_id = get_jwt_identity()
        data = request.get_json()

        other_user_email = data.get("email")
        if not other_user_email:
            return {"message": "Email is required"}, 400

        # Find the other user
        other_user = User.query.filter_by(email=other_user_email).first()
        if not other_user:
            return {"message": "User not found"}, 404

        if other_user.id == user_id:
            return {"message": "Cannot create conversation with yourself"}, 400

        # Check if conversation already exists
        conversation = Conversation.query.filter(
            or_(
                (Conversation.user1_id == user_id)
                & (Conversation.user2_id == other_user.id),
                (Conversation.user1_id == other_user.id)
                & (Conversation.user2_id == user_id),
            )
        ).first()

        if not conversation:
            # Create new conversation
            conversation = Conversation(user1_id=user_id, user2_id=other_user.id)
            db.session.add(conversation)
            db.session.commit()

        return {
            "id": conversation.id,
            "name": get_user_display_name(other_user),
            "email": other_user.email,
            "avatar": (other_user.email[0].upper() if other_user else "?"),
            "lastMessage": "No messages yet",
            "timestamp": "now",
            "unread": 0,
            "color": "bg-purple-100",
        }, 201

    @jwt_required()
    def delete(self, conversation_id):
        """Delete a conversation. Only users in the conversation can delete it."""
        user_id = get_jwt_identity()

        # Verify user is part of this conversation
        conversation = Conversation.query.filter(
            (Conversation.id == conversation_id)
            & ((Conversation.user1_id == user_id) | (Conversation.user2_id == user_id))
        ).first_or_404()

        # Delete all messages in the conversation first
        Message.query.filter_by(conversation_id=conversation_id).delete()

        # Delete the conversation
        db.session.delete(conversation)
        db.session.commit()

        return {"message": f"Conversation {conversation_id} deleted."}, 204


class ConversationMessagesResource(Resource):
    """Handle messages within a conversation."""

    @jwt_required()
    def get(self, conversation_id):
        """Get all messages in a conversation with pagination."""
        user_id = get_jwt_identity()

        # Verify user is part of this conversation
        Conversation.query.filter(
            (Conversation.id == conversation_id)
            & ((Conversation.user1_id == user_id) | (Conversation.user2_id == user_id))
        ).first_or_404()

        # Pagination parameters
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 50, type=int)

        # Limit per_page to prevent abuse
        per_page = min(per_page, 100)

        # Get messages with eager loading for reactions and their users
        messages_paginated = (
            Message.query.filter_by(conversation_id=conversation_id)
            .options(selectinload(Message.reactions).selectinload(Reaction.user))
            .order_by(Message.created_at.asc())
            .paginate(page=page, per_page=per_page)
        )

        messages = messages_paginated.items

        # Update message status to 'delivered' when fetched by receiver
        for msg in messages:
            if msg.receiver_id == user_id and msg.message_status == "sent":
                msg.message_status = "delivered"
        db.session.commit()

        return {
            "messages": [
                serialize_message_with_reactions(msg, user_id) for msg in messages
            ],
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": messages_paginated.total,
                "pages": messages_paginated.pages,
            },
        }, 200

    @jwt_required()
    def post(self, conversation_id):
        """Send a message in a conversation."""
        user_id = get_jwt_identity()

        # Verify user is part of this conversation
        conversation = Conversation.query.filter(
            (Conversation.id == conversation_id)
            & ((Conversation.user1_id == user_id) | (Conversation.user2_id == user_id))
        ).first_or_404()

        data = request.get_json()
        content = data.get("content", "").strip()

        if not content:
            return {"message": "Message content is required"}, 400

        # Determine receiver
        receiver_id = (
            conversation.user2_id
            if conversation.user1_id == user_id
            else conversation.user1_id
        )

        # Create message
        message = Message(
            conversation_id=conversation_id,
            sender_id=user_id,
            receiver_id=receiver_id,
            content=content,
            is_read=False,
        )
        db.session.add(message)
        conversation.updated_at = db.func.now()
        db.session.commit()

        return serialize_message_with_reactions(message, user_id), 201

    @jwt_required()
    def delete(self, conversation_id, message_id):
        """Delete a message from a conversation. Only the sender may delete their message."""
        user_id = get_jwt_identity()

        # Ensure conversation exists and user is participant
        Conversation.query.filter(
            (Conversation.id == conversation_id)
            & ((Conversation.user1_id == user_id) | (Conversation.user2_id == user_id))
        ).first_or_404()

        # Find message
        message = Message.query.filter_by(
            id=message_id, conversation_id=conversation_id
        ).first_or_404()

        # Only sender can delete
        if message.sender_id != user_id:
            return {"message": "Forbidden"}, 403

        db.session.delete(message)
        db.session.commit()

        return {"message": f"Message {message_id} deleted."}, 204

    @jwt_required()
    def put(self, conversation_id, message_id):
        """Edit a message. Only the sender may edit their message."""
        user_id = get_jwt_identity()

        # Ensure conversation exists and user is participant
        Conversation.query.filter(
            (Conversation.id == conversation_id)
            & ((Conversation.user1_id == user_id) | (Conversation.user2_id == user_id))
        ).first_or_404()

        # Find message
        message = Message.query.filter_by(
            id=message_id, conversation_id=conversation_id
        ).first_or_404()

        # Only sender can edit
        if message.sender_id != user_id:
            return {"message": "Forbidden"}, 403

        data = request.get_json()
        new_content = data.get("content", "").strip()

        if not new_content:
            return {"message": "Message content is required"}, 400

        message.content = new_content
        message.edited_at = db.func.now()
        db.session.commit()

        return serialize_message_with_reactions(message, user_id), 200

    @jwt_required()
    def patch(self, conversation_id, message_id):
        """Mark a message as read. Only the receiver can mark as read."""
        user_id = get_jwt_identity()

        # Ensure conversation exists and user is participant
        Conversation.query.filter(
            (Conversation.id == conversation_id)
            & ((Conversation.user1_id == user_id) | (Conversation.user2_id == user_id))
        ).first_or_404()

        # Find message
        message = Message.query.filter_by(
            id=message_id, conversation_id=conversation_id
        ).first_or_404()

        # Only receiver can mark as read
        if message.receiver_id != user_id:
            return {"message": "Forbidden"}, 403

        message.is_read = True
        message.message_status = "read"
        db.session.commit()

        return serialize_message_with_reactions(message, user_id), 200


class TypingIndicatorResource(Resource):
    """Handle typing indicator status for conversations."""

    @jwt_required()
    def post(self, conversation_id):
        """Mark user as typing in a conversation."""
        user_id = get_jwt_identity()

        # Verify user is part of conversation
        Conversation.query.filter(
            (Conversation.id == conversation_id)
            & ((Conversation.user1_id == user_id) | (Conversation.user2_id == user_id))
        ).first_or_404()

        # Update typing status with current timestamp (3 second expiry)
        if conversation_id not in _typing_status:
            _typing_status[conversation_id] = {}

        _typing_status[conversation_id][user_id] = datetime.utcnow() + timedelta(
            seconds=3
        )

        return {"message": "Typing status updated"}, 200

    @jwt_required()
    def get(self, conversation_id):
        """Get list of users currently typing in a conversation."""
        user_id = get_jwt_identity()

        # Verify user is part of conversation
        Conversation.query.filter(
            (Conversation.id == conversation_id)
            & ((Conversation.user1_id == user_id) | (Conversation.user2_id == user_id))
        ).first_or_404()

        now = datetime.utcnow()
        typing_users = []

        if conversation_id in _typing_status:
            # Remove expired entries and collect active users
            expired = []
            for uid, expiry_time in _typing_status[conversation_id].items():
                if now < expiry_time and uid != user_id:  # Don't include self
                    user = User.query.get(uid)
                    if user:
                        typing_users.append(
                            {
                                "id": user.id,
                                "name": get_user_display_name(user),
                            }
                        )
                elif now >= expiry_time:
                    expired.append(uid)

            # Clean up expired entries
            for uid in expired:
                del _typing_status[conversation_id][uid]

            # Clean up empty conversation dict
            if not _typing_status[conversation_id]:
                del _typing_status[conversation_id]

        return {"typing_users": typing_users}, 200


class StartConversationResource(Resource):
    """Handle starting a new conversation with a dependent."""

    @jwt_required()
    def post(self):
        """Start a new conversation with a dependent by dependent_id."""
        user_id = get_jwt_identity()
        data = request.get_json()

        dependent_id = data.get("dependent_id")
        if not dependent_id:
            return {"message": "dependent_id is required"}, 400

        # Verify the dependent exists
        dependent = User.query.get(dependent_id)
        if not dependent:
            return {"message": "Dependent not found"}, 404

        # Check if conversation already exists
        existing_conversation = Conversation.query.filter(
            or_(
                (Conversation.user1_id == user_id)
                & (Conversation.user2_id == dependent_id),
                (Conversation.user1_id == dependent_id)
                & (Conversation.user2_id == user_id),
            )
        ).first()

        if existing_conversation:
            return {"id": existing_conversation.id}, 200

        # Create new conversation
        conversation = Conversation(user1_id=user_id, user2_id=dependent_id)
        db.session.add(conversation)
        db.session.commit()

        return {"id": conversation.id}, 201
