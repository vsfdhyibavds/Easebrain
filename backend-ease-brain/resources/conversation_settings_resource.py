from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Conversation
from extensions import db
from datetime import datetime


class ConversationSettingsResource(Resource):
    """Handle conversation settings (pin, archive, mute)."""

    @jwt_required()
    def post(self, conversation_id):
        """Update conversation settings for the current user."""
        user_id = get_jwt_identity()

        # Verify user is part of this conversation
        conversation = Conversation.query.filter(
            (Conversation.id == conversation_id)
            & ((Conversation.user1_id == user_id) | (Conversation.user2_id == user_id))
        ).first_or_404()

        data = request.get_json()

        # Determine which user this is
        is_user1 = conversation.user1_id == user_id

        # Update archived status
        if "archived" in data:
            if is_user1:
                conversation.user1_archived = data["archived"]
            else:
                conversation.user2_archived = data["archived"]

        # Update muted status
        if "muted" in data:
            if is_user1:
                conversation.user1_muted = data["muted"]
            else:
                conversation.user2_muted = data["muted"]

        # Update last_seen timestamp
        if "mark_seen" in data and data["mark_seen"]:
            if is_user1:
                conversation.user1_last_seen = datetime.utcnow()
            else:
                conversation.user2_last_seen = datetime.utcnow()

        db.session.commit()

        return {
            "id": conversation.id,
            "archived": conversation.user1_archived
            if is_user1
            else conversation.user2_archived,
            "muted": conversation.user1_muted if is_user1 else conversation.user2_muted,
            "last_seen": (
                conversation.user1_last_seen
                if is_user1
                else conversation.user2_last_seen
            ).isoformat(),
        }, 200
