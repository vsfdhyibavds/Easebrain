from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import (
    Community,
    CommunityPost,
    CommunityReply,
    CommunityReport,
    User,
)
from sqlalchemy import or_
import logging

community_bp = Blueprint("community", __name__)
logger = logging.getLogger(__name__)


@community_bp.route("/", methods=["GET"])
def get_communities():
    """Get all communities with subject_area filtering"""
    try:
        subject_area = request.args.get("subject_area", type=str)
        search = request.args.get("search", type=str)
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)

        query = Community.query

        # Filter by subject area
        if subject_area:
            query = query.filter_by(subject_area=subject_area)

        # Search by name or description
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Community.name.ilike(search_term),
                    Community.description.ilike(search_term),
                )
            )

        # Paginate
        paginated = query.paginate(page=page, per_page=min(per_page, 50))

        communities = []
        for c in paginated.items:
            communities.append(
                {
                    "id": c.id,
                    "name": c.name,
                    "description": c.description,
                    "icon": c.icon,
                    "color": c.color,
                    "subject_area": c.subject_area,
                    "is_peer_support": c.is_peer_support,
                    "requires_moderation": c.requires_moderation,
                    "allows_anonymous_posting": c.allows_anonymous_posting,
                    "crisis_hotline_phone": c.crisis_hotline_phone,
                    "crisis_hotline_url": c.crisis_hotline_url,
                    "post_count": len(c.posts),
                    "moderator_count": len(c.moderators),
                    "created_at": c.created_at.isoformat() if c.created_at else None,
                }
            )

        return (
            jsonify(
                {
                    "communities": communities,
                    "pagination": {
                        "page": paginated.page,
                        "per_page": paginated.per_page,
                        "total": paginated.total,
                        "pages": paginated.pages,
                    },
                }
            ),
            200,
        )
    except Exception as e:
        logger.error(f"Error fetching communities: {str(e)}")
        return jsonify({"error": "Failed to fetch communities"}), 500


@community_bp.route("/<int:community_id>/moderator-status", methods=["GET"])
@jwt_required()
def get_moderator_status(community_id):
    """Check if current user is a moderator of this community"""
    try:
        user_id = get_jwt_identity()
        community = Community.query.get_or_404(community_id)

        # Check if user is a moderator
        is_moderator = (
            db.session.query(Community)
            .filter(
                Community.id == community_id,
                Community.moderators.any(User.id == user_id),
            )
            .first()
            is not None
        )

        return jsonify(
            {
                "communityId": community_id,
                "isModerator": is_moderator,
                "communityName": community.name,
            }
        ), 200
    except Exception as e:
        logger.error(f"Error checking moderator status: {str(e)}")
        return jsonify({"error": "Failed to check moderator status"}), 500


@community_bp.route("/community/<int:community_id>/posts", methods=["GET"])
def get_community_posts(community_id):
    """Get posts in a specific community"""
    try:
        community = Community.query.get_or_404(community_id)
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)
        sort_by = request.args.get("sort", "recent")  # recent, helpful, likes

        query = CommunityPost.query.filter_by(
            community_id=community_id, is_approved=True
        )

        if sort_by == "helpful":
            query = query.order_by(CommunityPost.helpful_count.desc())
        elif sort_by == "likes":
            query = query.order_by(CommunityPost.likes.desc())
        else:
            query = query.order_by(CommunityPost.created_at.desc())

        paginated = query.paginate(page=page, per_page=per_page)

        posts = []
        for post in paginated.items:
            posts.append(
                {
                    "id": post.id,
                    "title": post.title,
                    "content": post.content,
                    "post_type": post.post_type,
                    "author_name": f"{post.author.first_name} {post.author.last_name}".strip(),
                    "created_at": post.created_at.isoformat(),
                    "likes": post.likes,
                    "replies": post.reply_count,
                    "helpful": post.helpful_count,
                }
            )

        return jsonify(
            {
                "community": {
                    "id": community.id,
                    "name": community.name,
                    "description": community.description,
                },
                "posts": posts,
                "total": paginated.total,
                "pages": paginated.pages,
                "current_page": page,
            }
        ), 200
    except Exception as e:
        logger.error(f"Error fetching community posts: {str(e)}")
        return jsonify({"error": "Failed to fetch posts"}), 500


@community_bp.route("/community/<int:community_id>/posts", methods=["POST"])
@jwt_required()
def create_community_post(community_id):
    """Create a post in a community with trigger warning support"""
    try:
        user_id = get_jwt_identity()
        community = Community.query.get_or_404(community_id)
        data = request.get_json()

        if not data.get("title") or not data.get("content"):
            return jsonify({"error": "Title and content are required"}), 400

        post = CommunityPost(
            community_id=community_id,
            author_id=user_id,
            title=data.get("title"),
            content=data.get("content"),
            post_type=data.get(
                "post_type", "discussion"
            ),  # discussion, question, tip, support
            has_trigger_warning=data.get("has_trigger_warning", False),
            trigger_warning_text=data.get("trigger_warning_text"),
            is_anonymous=data.get("is_anonymous", False),
            moderation_status="pending"
            if community.requires_moderation
            else "approved",
            is_approved=not community.requires_moderation,
        )

        db.session.add(post)
        db.session.commit()

        logger.info(f"Community post {post.id} created by user {user_id}")

        return (
            jsonify(
                {
                    "message": "Post submitted for review"
                    if community.requires_moderation
                    else "Post published",
                    "post": {
                        "id": post.id,
                        "title": post.title,
                        "post_type": post.post_type,
                        "moderation_status": post.moderation_status,
                        "has_trigger_warning": post.has_trigger_warning,
                    },
                }
            ),
            201,
        )
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating post: {str(e)}")
        return jsonify({"error": "Failed to create post"}), 500


@community_bp.route("/posts/<int:post_id>", methods=["GET"])
def get_community_post(post_id):
    """Get a single community post with replies"""
    try:
        post = CommunityPost.query.get_or_404(post_id)

        if not post.is_approved:
            return jsonify({"error": "Post not available"}), 404

        replies = []
        for reply in post.replies:
            replies.append(
                {
                    "id": reply.id,
                    "author_name": f"{reply.author.first_name} {reply.author.last_name}".strip(),
                    "content": reply.content,
                    "likes": reply.likes,
                    "created_at": reply.created_at.isoformat(),
                }
            )

        return jsonify(
            {
                "id": post.id,
                "title": post.title,
                "content": post.content,
                "post_type": post.post_type,
                "author_name": f"{post.author.first_name} {post.author.last_name}".strip(),
                "community_name": post.community.name,
                "created_at": post.created_at.isoformat(),
                "likes": post.likes,
                "helpful": post.helpful_count,
                "replies": replies,
            }
        ), 200
    except Exception as e:
        logger.error(f"Error fetching post {post_id}: {str(e)}")
        return jsonify({"error": "Failed to fetch post"}), 500


@community_bp.route("/posts/<int:post_id>/reply", methods=["POST"])
@jwt_required()
def add_community_reply(post_id):
    """Add a reply to a community post"""
    try:
        user_id = get_jwt_identity()
        post = CommunityPost.query.get_or_404(post_id)
        data = request.get_json()

        if not data.get("content"):
            return jsonify({"error": "Content is required"}), 400

        reply = CommunityReply(
            post_id=post_id, author_id=user_id, content=data.get("content")
        )

        post.reply_count += 1
        db.session.add(reply)
        db.session.commit()

        return jsonify(
            {
                "message": "Reply added",
                "reply": {
                    "id": reply.id,
                    "content": reply.content,
                    "author_name": f"{reply.author.first_name} {reply.author.last_name}".strip(),
                },
            }
        ), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error adding reply to post {post_id}: {str(e)}")
        return jsonify({"error": "Failed to add reply"}), 500


@community_bp.route("/posts/<int:post_id>/like", methods=["POST"])
def like_community_post(post_id):
    """Like a community post"""
    try:
        post = CommunityPost.query.get_or_404(post_id)
        post.likes += 1
        db.session.commit()
        return jsonify({"likes": post.likes}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error liking post {post_id}: {str(e)}")
        return jsonify({"error": "Failed to like post"}), 500


@community_bp.route("/posts/<int:post_id>/helpful", methods=["POST"])
def mark_helpful(post_id):
    """Mark a post as helpful (for support/question posts)"""
    try:
        post = CommunityPost.query.get_or_404(post_id)
        post.helpful_count += 1
        db.session.commit()
        return jsonify({"helpful": post.helpful_count}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error marking post as helpful {post_id}: {str(e)}")
        return jsonify({"error": "Failed to mark as helpful"}), 500


@community_bp.route("/posts/<int:post_id>/report", methods=["POST"])
@jwt_required()
def report_community_post(post_id):
    """Report a post for moderation review"""
    try:
        user_id = get_jwt_identity()
        post = CommunityPost.query.get_or_404(post_id)
        data = request.get_json()

        reason = data.get("reason")
        description = data.get("description")

        if not reason:
            return jsonify({"error": "Reason is required"}), 400

        # Create report
        report = CommunityReport(
            community_id=post.community_id,
            post_id=post_id,
            reporter_id=user_id,
            reason=reason,
            description=description,
            status="pending",
        )

        # Increment flagged count
        post.flagged_count += 1
        if post.flagged_count >= 3:
            post.is_flagged_for_review = True

        db.session.add(report)
        db.session.commit()

        logger.info(f"Post {post_id} reported by user {user_id} for reason: {reason}")

        return (
            jsonify(
                {
                    "message": "Post reported successfully",
                    "report": {
                        "id": report.id,
                        "status": report.status,
                        "created_at": report.created_at.isoformat()
                        if hasattr(report, "created_at")
                        else None,
                    },
                }
            ),
            201,
        )
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error reporting post {post_id}: {str(e)}")
        return jsonify({"error": "Failed to report post"}), 500


@community_bp.route("/posts/<int:post_id>/approve", methods=["POST"])
@jwt_required()
def approve_community_post(post_id):
    """Approve or reject a post (moderator only)"""
    try:
        user_id = get_jwt_identity()
        post = CommunityPost.query.get_or_404(post_id)
        data = request.get_json()

        # Check if user is moderator for this community
        is_moderator = db.session.query(
            db.session.query(Community)
            .filter(Community.id == post.community_id)
            .filter(Community.moderators.any(User.id == user_id))
            .exists()
        ).scalar()

        if not is_moderator:
            return jsonify({"error": "Only moderators can approve posts"}), 403

        action = data.get("action")  # 'approve' or 'reject'
        reason = data.get("reason")

        if action == "approve":
            post.moderation_status = "approved"
            post.is_approved = True
            post.approved_by = user_id
            post.moderation_reason = None
            logger.info(f"Post {post_id} approved by user {user_id}")
        elif action == "reject":
            post.moderation_status = "removed"
            post.is_approved = False
            post.moderation_reason = reason
            logger.info(f"Post {post_id} rejected by user {user_id}. Reason: {reason}")
        else:
            return jsonify({"error": "Invalid action. Use 'approve' or 'reject'"}), 400

        db.session.commit()

        return (
            jsonify(
                {
                    "message": f"Post {action}d successfully",
                    "post": {"id": post.id, "status": post.moderation_status},
                }
            ),
            200,
        )
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error approving post {post_id}: {str(e)}")
        return jsonify({"error": "Failed to approve post"}), 500


@community_bp.route("/posts/pending", methods=["GET"])
@jwt_required()
def get_pending_posts():
    """Get pending posts for moderation (moderator only)"""
    try:
        user_id = get_jwt_identity()
        community_id = request.args.get("community_id", type=int)

        # Get communities where user is a moderator
        moderator_communities = (
            db.session.query(Community.id)
            .filter(Community.moderators.any(User.id == user_id))
            .all()
        )

        if not moderator_communities:
            return jsonify({"error": "You are not a moderator of any community"}), 403

        moderator_community_ids = [c[0] for c in moderator_communities]

        # Filter by specific community if provided
        if community_id:
            if community_id not in moderator_community_ids:
                return jsonify(
                    {"error": "You are not a moderator of this community"}
                ), 403
            moderator_community_ids = [community_id]

        pending = (
            CommunityPost.query.filter(
                CommunityPost.community_id.in_(moderator_community_ids),
                CommunityPost.moderation_status == "pending",
            )
            .order_by(CommunityPost.created_at.desc())
            .all()
        )

        return (
            jsonify(
                {
                    "pending_posts": [
                        {
                            "id": p.id,
                            "title": p.title,
                            "content": p.content,
                            "post_type": p.post_type,
                            "author_id": p.author_id,
                            "author_name": f"{p.author.first_name} {p.author.last_name}".strip()
                            if not p.is_anonymous
                            else "Anonymous",
                            "community_id": p.community_id,
                            "community_name": p.community.name,
                            "has_trigger_warning": p.has_trigger_warning,
                            "trigger_warning_text": p.trigger_warning_text,
                            "is_anonymous": p.is_anonymous,
                            "created_at": p.created_at.isoformat(),
                        }
                        for p in pending
                    ]
                }
            ),
            200,
        )
    except Exception as e:
        logger.error(f"Error fetching pending posts: {str(e)}")
        return jsonify({"error": "Failed to fetch pending posts"}), 500


@community_bp.route("/<int:community_id>/stats", methods=["GET"])
def get_community_stats(community_id):
    """Get community statistics"""
    try:
        community = Community.query.get_or_404(community_id)

        post_count = CommunityPost.query.filter_by(
            community_id=community_id, moderation_status="approved"
        ).count()
        pending_count = CommunityPost.query.filter_by(
            community_id=community_id, moderation_status="pending"
        ).count()
        flagged_count = CommunityPost.query.filter_by(
            community_id=community_id, is_flagged_for_review=True
        ).count()
        report_count = CommunityReport.query.filter_by(
            community_id=community_id, status="pending"
        ).count()

        return (
            jsonify(
                {
                    "community_id": community_id,
                    "community_name": community.name,
                    "post_count": post_count,
                    "pending_count": pending_count,
                    "flagged_count": flagged_count,
                    "report_count": report_count,
                    "moderator_count": len(community.moderators),
                }
            ),
            200,
        )
    except Exception as e:
        logger.error(f"Error fetching stats for community {community_id}: {str(e)}")
        return jsonify({"error": "Failed to fetch stats"}), 500


@community_bp.route("/<int:community_id>/flagged", methods=["GET"])
@jwt_required()
def get_flagged_posts(community_id):
    """Get flagged posts in community (moderator only)"""
    try:
        user_id = get_jwt_identity()

        # Check if user is moderator
        is_moderator = db.session.query(
            db.session.query(Community)
            .filter(Community.id == community_id)
            .filter(Community.moderators.any(User.id == user_id))
            .exists()
        ).scalar()

        if not is_moderator:
            return jsonify({"error": "Only moderators can view flagged posts"}), 403

        flagged = (
            CommunityPost.query.filter_by(
                community_id=community_id, is_flagged_for_review=True
            )
            .order_by(CommunityPost.flagged_count.desc())
            .all()
        )

        return (
            jsonify(
                {
                    "flagged_posts": [
                        {
                            "id": p.id,
                            "title": p.title,
                            "content": p.content,
                            "author_id": p.author_id,
                            "author_name": f"{p.author.first_name} {p.author.last_name}".strip()
                            if not p.is_anonymous
                            else "Anonymous",
                            "flagged_count": p.flagged_count,
                            "moderation_status": p.moderation_status,
                            "moderation_reason": p.moderation_reason,
                            "created_at": p.created_at.isoformat(),
                            "reports": [
                                {
                                    "id": r.id,
                                    "reason": r.reason,
                                    "description": r.description,
                                    "reporter_id": r.reporter_id,
                                    "status": r.status,
                                }
                                for r in CommunityReport.query.filter_by(
                                    post_id=p.id
                                ).all()
                            ],
                        }
                        for p in flagged
                    ]
                }
            ),
            200,
        )
    except Exception as e:
        logger.error(
            f"Error fetching flagged posts for community {community_id}: {str(e)}"
        )
        return jsonify({"error": "Failed to fetch flagged posts"}), 500
