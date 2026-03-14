from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import (
    Community,
    CommunityPost,
    CommunityReport,
    User,
    UserCommunity,
)
from datetime import datetime
import logging

moderation_bp = Blueprint("moderation", __name__, url_prefix="/moderation")
logger = logging.getLogger(__name__)


# Helper function to check if user is moderator
def is_community_moderator(user_id, community_id):
    """Check if user is a moderator for the community"""
    user = User.query.get(user_id)
    if not user:
        return False
    community = Community.query.get(community_id)
    if not community:
        return False
    return user in community.moderators


# ==================== PENDING POSTS ====================
@moderation_bp.route("/<int:community_id>/posts/pending", methods=["GET"])
@jwt_required()
def get_pending_posts(community_id):
    """Get posts pending moderation approval"""
    try:
        user_id = get_jwt_identity()

        # Check if user is moderator
        if not is_community_moderator(user_id, community_id):
            return jsonify({"error": "Unauthorized"}), 403

        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)
        sort_by = request.args.get("sort", "oldest")  # oldest, newest

        query = CommunityPost.query.filter_by(
            community_id=community_id, moderation_status="pending"
        )

        if sort_by == "newest":
            query = query.order_by(CommunityPost.created_at.desc())
        else:
            query = query.order_by(CommunityPost.created_at.asc())

        paginated = query.paginate(page=page, per_page=min(per_page, 50))

        posts = []
        for post in paginated.items:
            posts.append(
                {
                    "id": post.id,
                    "title": post.title,
                    "content": post.content,
                    "post_type": post.post_type,
                    "author_name": post.author.username if post.author else "Unknown",
                    "is_anonymous": post.is_anonymous,
                    "has_trigger_warning": post.has_trigger_warning,
                    "trigger_warning_text": post.trigger_warning_text,
                    "created_at": post.created_at.isoformat()
                    if post.created_at
                    else None,
                    "moderation_status": post.moderation_status,
                }
            )

        return jsonify(
            {
                "posts": posts,
                "pagination": {
                    "page": paginated.page,
                    "per_page": paginated.per_page,
                    "total": paginated.total,
                    "pages": paginated.pages,
                },
            }
        ), 200
    except Exception as e:
        logger.error(f"Error fetching pending posts: {str(e)}")
        return jsonify({"error": "Failed to fetch pending posts"}), 500


# ==================== FLAGGED POSTS ====================
@moderation_bp.route("/<int:community_id>/posts/flagged", methods=["GET"])
@jwt_required()
def get_flagged_posts(community_id):
    """Get posts flagged by community members"""
    try:
        user_id = get_jwt_identity()

        # Check if user is moderator
        if not is_community_moderator(user_id, community_id):
            return jsonify({"error": "Unauthorized"}), 403

        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)
        sort_by = request.args.get("sort", "most-reported")

        query = CommunityPost.query.filter(
            CommunityPost.community_id == community_id, CommunityPost.flagged_count > 0
        )

        if sort_by == "most-reported":
            query = query.order_by(CommunityPost.flagged_count.desc())
        elif sort_by == "oldest":
            query = query.order_by(CommunityPost.created_at.asc())
        else:
            query = query.order_by(CommunityPost.created_at.desc())

        paginated = query.paginate(page=page, per_page=min(per_page, 50))

        posts = []
        for post in paginated.items:
            # Get reports for this post
            reports = CommunityReport.query.filter_by(post_id=post.id).all()
            report_reasons = {}
            for report in reports:
                report_reasons[report.reason] = report_reasons.get(report.reason, 0) + 1

            posts.append(
                {
                    "id": post.id,
                    "title": post.title,
                    "content": post.content,
                    "post_type": post.post_type,
                    "author_name": post.author.username if post.author else "Unknown",
                    "is_anonymous": post.is_anonymous,
                    "has_trigger_warning": post.has_trigger_warning,
                    "trigger_warning_text": post.trigger_warning_text,
                    "created_at": post.created_at.isoformat()
                    if post.created_at
                    else None,
                    "report_count": post.flagged_count,
                    "primary_report_reason": max(report_reasons, key=report_reasons.get)
                    if report_reasons
                    else None,
                    "report_reasons": report_reasons,
                    "moderation_status": post.moderation_status,
                }
            )

        return jsonify(
            {
                "posts": posts,
                "pagination": {
                    "page": paginated.page,
                    "per_page": paginated.per_page,
                    "total": paginated.total,
                    "pages": paginated.pages,
                },
            }
        ), 200
    except Exception as e:
        logger.error(f"Error fetching flagged posts: {str(e)}")
        return jsonify({"error": "Failed to fetch flagged posts"}), 500


# ==================== APPROVE POST ====================
@moderation_bp.route("/posts/<int:post_id>/approve", methods=["POST"])
@jwt_required()
def approve_post(post_id):
    """Approve a pending post"""
    try:
        user_id = get_jwt_identity()
        post = CommunityPost.query.get_or_404(post_id)

        # Check if user is moderator of this community
        if not is_community_moderator(user_id, post.community_id):
            return jsonify({"error": "Unauthorized"}), 403

        post.moderation_status = "approved"
        post.is_approved = True
        post.approved_by = user_id

        db.session.commit()

        return jsonify(
            {
                "success": True,
                "message": "Post approved",
                "post_id": post.id,
                "moderation_status": post.moderation_status,
            }
        ), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error approving post: {str(e)}")
        return jsonify({"error": "Failed to approve post"}), 500


# ==================== REJECT POST ====================
@moderation_bp.route("/posts/<int:post_id>/reject", methods=["POST"])
@jwt_required()
def reject_post(post_id):
    """Reject a pending post"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        reason = data.get("reason", "")

        post = CommunityPost.query.get_or_404(post_id)

        # Check if user is moderator of this community
        if not is_community_moderator(user_id, post.community_id):
            return jsonify({"error": "Unauthorized"}), 403

        post.moderation_status = "removed"
        post.is_approved = False
        post.approved_by = user_id
        post.moderation_reason = reason

        db.session.commit()

        return jsonify(
            {
                "success": True,
                "message": "Post rejected",
                "post_id": post.id,
                "moderation_status": post.moderation_status,
            }
        ), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error rejecting post: {str(e)}")
        return jsonify({"error": "Failed to reject post"}), 500


# ==================== COMMUNITY MEMBERS ====================
@moderation_bp.route("/<int:community_id>/members", methods=["GET"])
@jwt_required()
def get_community_members(community_id):
    """Get all members of a community"""
    try:
        user_id = get_jwt_identity()

        # Check if user is moderator
        if not is_community_moderator(user_id, community_id):
            return jsonify({"error": "Unauthorized"}), 403

        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)

        # Get all users in the community
        query = UserCommunity.query.filter_by(community_id=community_id)
        paginated = query.paginate(page=page, per_page=min(per_page, 50))

        members = []
        for uc in paginated.items:
            user = uc.user
            community = Community.query.get(community_id)
            is_moderator = user in community.moderators

            members.append(
                {
                    "id": user.id,
                    "user_name": user.username,
                    "user_email": user.email,
                    "role": "moderator" if is_moderator else "member",
                    "status": "active" if user.is_active else "inactive",
                    "joined_at": uc.joined_at.isoformat() if uc.joined_at else None,
                    "post_count": CommunityPost.query.filter_by(
                        author_id=user.id, community_id=community_id
                    ).count(),
                }
            )

        return jsonify(
            {
                "members": members,
                "pagination": {
                    "page": paginated.page,
                    "per_page": paginated.per_page,
                    "total": paginated.total,
                    "pages": paginated.pages,
                },
            }
        ), 200
    except Exception as e:
        logger.error(f"Error fetching community members: {str(e)}")
        return jsonify({"error": "Failed to fetch community members"}), 500


# ==================== USER SUSPENSION ====================
@moderation_bp.route("/users/<int:target_user_id>/suspend", methods=["POST"])
@jwt_required()
def suspend_user(target_user_id):
    """Suspend a user from a community"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        community_id = data.get("community_id")
        reason = data.get("reason", "")

        # Check if moderator
        if not is_community_moderator(user_id, community_id):
            return jsonify({"error": "Unauthorized"}), 403

        user_community = UserCommunity.query.filter_by(
            user_id=target_user_id, community_id=community_id
        ).first()

        if not user_community:
            return jsonify({"error": "User not in community"}), 404

        user_community.status = "suspended"
        user_community.suspended_at = datetime.utcnow()
        user_community.suspension_reason = reason

        db.session.commit()

        return jsonify(
            {
                "success": True,
                "message": "User suspended",
                "user_id": target_user_id,
                "status": "suspended",
            }
        ), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error suspending user: {str(e)}")
        return jsonify({"error": "Failed to suspend user"}), 500


# ==================== USER BAN ====================
@moderation_bp.route("/users/<int:target_user_id>/ban", methods=["POST"])
@jwt_required()
def ban_user(target_user_id):
    """Ban a user from a community"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        community_id = data.get("community_id")
        reason = data.get("reason", "")

        # Check if moderator
        if not is_community_moderator(user_id, community_id):
            return jsonify({"error": "Unauthorized"}), 403

        user_community = UserCommunity.query.filter_by(
            user_id=target_user_id, community_id=community_id
        ).first()

        if not user_community:
            return jsonify({"error": "User not in community"}), 404

        user_community.status = "banned"
        user_community.banned_at = datetime.utcnow()
        user_community.ban_reason = reason

        db.session.commit()

        return jsonify(
            {
                "success": True,
                "message": "User banned",
                "user_id": target_user_id,
                "status": "banned",
            }
        ), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error banning user: {str(e)}")
        return jsonify({"error": "Failed to ban user"}), 500


# ==================== USER RESTORE ====================
@moderation_bp.route("/users/<int:target_user_id>/restore", methods=["POST"])
@jwt_required()
def restore_user(target_user_id):
    """Restore access for a suspended/banned user"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        community_id = data.get("community_id")

        # Check if moderator
        if not is_community_moderator(user_id, community_id):
            return jsonify({"error": "Unauthorized"}), 403

        user_community = UserCommunity.query.filter_by(
            user_id=target_user_id, community_id=community_id
        ).first()

        if not user_community:
            return jsonify({"error": "User not in community"}), 404

        user_community.status = "active"
        user_community.suspended_at = None
        user_community.banned_at = None
        user_community.suspension_reason = None
        user_community.ban_reason = None

        db.session.commit()

        return jsonify(
            {
                "success": True,
                "message": "User access restored",
                "user_id": target_user_id,
                "status": "active",
            }
        ), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error restoring user: {str(e)}")
        return jsonify({"error": "Failed to restore user"}), 500


# ==================== MODERATION LOGS ====================
@moderation_bp.route("/<int:community_id>/logs", methods=["GET"])
@jwt_required()
def get_moderation_logs(community_id):
    """Get moderation action logs for a community"""
    try:
        user_id = get_jwt_identity()

        # Check if user is moderator
        if not is_community_moderator(user_id, community_id):
            return jsonify({"error": "Unauthorized"}), 403

        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)
        filter_action = request.args.get("action", "all")

        # Get all approved/rejected posts and user actions in this community
        logs = []

        # Post moderation actions
        posts = CommunityPost.query.filter(
            CommunityPost.community_id == community_id,
            CommunityPost.moderation_status.in_(["approved", "removed"]),
        ).order_by(CommunityPost.updated_at.desc())

        for post in posts:
            if (
                filter_action == "all"
                or (filter_action == "approve" and post.moderation_status == "approved")
                or (filter_action == "reject" and post.moderation_status == "removed")
            ):
                action = "approve" if post.moderation_status == "approved" else "reject"
                logs.append(
                    {
                        "id": f"post_{post.id}",
                        "timestamp": post.updated_at.isoformat()
                        if post.updated_at
                        else None,
                        "moderator_name": post.approver.username
                        if post.approver
                        else "System",
                        "action": action,
                        "target_type": "post",
                        "target_title": post.title,
                        "reason": post.moderation_reason or "No reason provided",
                    }
                )

        # User suspension/ban actions
        user_communities = UserCommunity.query.filter(
            UserCommunity.community_id == community_id,
            UserCommunity.status.in_(["suspended", "banned"]),
        ).order_by(UserCommunity.suspended_at.desc(), UserCommunity.banned_at.desc())

        for uc in user_communities:
            if uc.status == "suspended":
                action = "suspend"
                timestamp = uc.suspended_at
                reason = uc.suspension_reason
            else:
                action = "ban"
                timestamp = uc.banned_at
                reason = uc.ban_reason

            if filter_action == "all" or filter_action == action:
                logs.append(
                    {
                        "id": f"user_{uc.user_id}",
                        "timestamp": timestamp.isoformat() if timestamp else None,
                        "moderator_name": "Admin",  # Would need to track moderator who took action
                        "action": action,
                        "target_type": "user",
                        "target_title": uc.user.username,
                        "reason": reason or "No reason provided",
                    }
                )

        # Sort by timestamp
        logs.sort(key=lambda x: x["timestamp"], reverse=True)

        # Paginate
        start = (page - 1) * per_page
        end = start + per_page
        paginated_logs = logs[start:end]

        return jsonify(
            {
                "logs": paginated_logs,
                "pagination": {
                    "page": page,
                    "per_page": per_page,
                    "total": len(logs),
                    "pages": (len(logs) + per_page - 1) // per_page,
                },
            }
        ), 200
    except Exception as e:
        logger.error(f"Error fetching moderation logs: {str(e)}")
        return jsonify({"error": "Failed to fetch moderation logs"}), 500


# ==================== COMMUNITY SETTINGS ====================
@moderation_bp.route("/<int:community_id>/settings", methods=["GET", "POST"])
@jwt_required()
def community_settings(community_id):
    """Get or update community moderation settings"""
    try:
        user_id = get_jwt_identity()

        # Check if user is moderator
        if not is_community_moderator(user_id, community_id):
            return jsonify({"error": "Unauthorized"}), 403

        community = Community.query.get_or_404(community_id)

        if request.method == "GET":
            return jsonify(
                {
                    "community_id": community.id,
                    "requires_moderation": community.requires_moderation,
                    "allows_anonymous_posting": community.allows_anonymous_posting,
                    "community_guidelines": community.community_guidelines,
                    "crisis_hotline_phone": community.crisis_hotline_phone,
                    "crisis_hotline_url": community.crisis_hotline_url,
                }
            ), 200

        # POST - Update settings
        data = request.get_json()

        if "requires_moderation" in data:
            community.requires_moderation = data["requires_moderation"]
        if "allows_anonymous_posting" in data:
            community.allows_anonymous_posting = data["allows_anonymous_posting"]
        if "community_guidelines" in data:
            community.community_guidelines = data["community_guidelines"]
        if "crisis_hotline_phone" in data:
            community.crisis_hotline_phone = data["crisis_hotline_phone"]
        if "crisis_hotline_url" in data:
            community.crisis_hotline_url = data["crisis_hotline_url"]

        db.session.commit()

        return jsonify(
            {
                "success": True,
                "message": "Settings updated",
                "community_id": community.id,
            }
        ), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating community settings: {str(e)}")
        return jsonify({"error": "Failed to update settings"}), 500
