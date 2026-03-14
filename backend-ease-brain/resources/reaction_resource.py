from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Message, Conversation, Reaction
from extensions import db


class ReactionResource(Resource):
    """Handle message reactions."""

    @jwt_required()
    def post(self, conversation_id, message_id):
        """Add a reaction to a message."""
        user_id = get_jwt_identity()

        # Verify user is part of this conversation
        Conversation.query.filter(
            (Conversation.id == conversation_id)
            & ((Conversation.user1_id == user_id) | (Conversation.user2_id == user_id))
        ).first_or_404()

        # Verify message exists (required for conversation validation)
        Message.query.filter_by(
            id=message_id, conversation_id=conversation_id
        ).first_or_404()

        data = request.get_json()
        emoji = data.get("emoji", "").strip()

        if not emoji or len(emoji) > 10:
            return {"message": "Invalid emoji"}, 400

        # Check if reaction already exists
        existing = Reaction.query.filter_by(
            message_id=message_id, user_id=user_id, emoji=emoji
        ).first()

        if existing:
            return {"message": "Reaction already exists"}, 409

        # Create reaction
        reaction = Reaction(message_id=message_id, user_id=user_id, emoji=emoji)
        db.session.add(reaction)
        db.session.commit()

        return {
            "id": reaction.id,
            "emoji": reaction.emoji,
            "user_id": reaction.user_id,
            "created_at": reaction.created_at.isoformat(),
        }, 201

    @jwt_required()
    def delete(self, conversation_id, message_id, reaction_id):
        """Remove a reaction from a message."""
        user_id = get_jwt_identity()

        # Verify user is part of this conversation
        Conversation.query.filter(
            (Conversation.id == conversation_id)
            & ((Conversation.user1_id == user_id) | (Conversation.user2_id == user_id))
        ).first_or_404()

        # Find and verify reaction
        reaction = Reaction.query.get_or_404(reaction_id)

        if reaction.message_id != message_id:
            return {"message": "Reaction not found"}, 404

        # Only the user who added the reaction can remove it
        if reaction.user_id != user_id:
            return {"message": "Forbidden"}, 403

        db.session.delete(reaction)
        db.session.commit()

        return {"message": "Reaction removed"}, 204

    @jwt_required()
    def get(self, conversation_id, message_id):
        """Get all reactions for a message."""
        user_id = get_jwt_identity()

        # Verify user is part of this conversation
        Conversation.query.filter(
            (Conversation.id == conversation_id)
            & ((Conversation.user1_id == user_id) | (Conversation.user2_id == user_id))
        ).first_or_404()

        # Verify message exists
        Message.query.filter_by(
            id=message_id, conversation_id=conversation_id
        ).first_or_404()

        # Get reaction summary (emoji, count, list of users)
        reactions = Reaction.query.filter_by(message_id=message_id).all()

        # Group by emoji
        emoji_groups = {}
        for reaction in reactions:
            if reaction.emoji not in emoji_groups:
                emoji_groups[reaction.emoji] = []
            emoji_groups[reaction.emoji].append(
                {
                    "user_id": reaction.user,
                    "user_name": reaction.user.username
                    or reaction.user.first_name
                    or "Unknown",
                }
            )

        result = []
        for emoji, users in emoji_groups.items():
            result.append(
                {
                    "emoji": emoji,
                    "count": len(users),
                    "users": users,
                    "has_current_user": any(u["user_id"].id == user_id for u in users),
                }
            )

        return {"reactions": result}, 200
