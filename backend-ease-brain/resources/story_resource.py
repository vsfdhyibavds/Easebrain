from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Story, StoryComment
from datetime import datetime
import logging

story_bp = Blueprint("stories", __name__, url_prefix="/stories")
logger = logging.getLogger(__name__)


@story_bp.route("/", methods=["GET"])
def get_stories():
    """Get all approved stories (public view)"""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)
        category = request.args.get("category", type=str)

        query = Story.query.filter_by(is_approved=True).order_by(
            Story.published_at.desc()
        )

        if category:
            query = query.filter_by(category=category)

        paginated = query.paginate(page=page, per_page=per_page)

        return jsonify(
            {
                "stories": [story.to_dict() for story in paginated.items],
                "total": paginated.total,
                "pages": paginated.pages,
                "current_page": page,
            }
        ), 200
    except Exception as e:
        logger.error(f"Error fetching stories: {str(e)}")
        return jsonify({"error": "Failed to fetch stories"}), 500


@story_bp.route("/<int:story_id>", methods=["GET"])
def get_story(story_id):
    """Get a single story with comments"""
    try:
        story = Story.query.get_or_404(story_id)

        if not story.is_approved:
            return jsonify({"error": "Story not available"}), 404

        # Increment view count
        story.view_count += 1
        db.session.commit()

        story_data = story.to_dict()
        story_data["comments"] = [c.to_dict() for c in story.comments]
        story_data["author_name"] = (
            f"{story.author.first_name} {story.author.last_name}".strip()
        )

        return jsonify(story_data), 200
    except Exception as e:
        logger.error(f"Error fetching story {story_id}: {str(e)}")
        return jsonify({"error": "Failed to fetch story"}), 500


@story_bp.route("/", methods=["POST"])
@jwt_required()
def create_story():
    """Create a new story (patient submission)"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        # Validate required fields
        if not data.get("title") or not data.get("content"):
            return jsonify({"error": "Title and content are required"}), 400

        story = Story(
            title=data.get("title"),
            content=data.get("content"),
            category=data.get("category", "General"),
            tags=data.get("tags"),
            featured_image_url=data.get("featured_image_url"),
            author_id=user_id,
        )

        db.session.add(story)
        db.session.commit()

        logger.info(f"Story {story.id} created by user {user_id}")

        return jsonify(
            {"message": "Story submitted for review", "story": story.to_dict()}
        ), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating story: {str(e)}")
        return jsonify({"error": "Failed to create story"}), 500


@story_bp.route("/<int:story_id>", methods=["PUT"])
@jwt_required()
def update_story(story_id):
    """Update a story (author or admin only)"""
    try:
        user_id = get_jwt_identity()
        story = Story.query.get_or_404(story_id)

        # Authorization check
        if story.author_id != user_id:
            return jsonify({"error": "Unauthorized"}), 403

        data = request.get_json()

        story.title = data.get("title", story.title)
        story.content = data.get("content", story.content)
        story.category = data.get("category", story.category)
        story.tags = data.get("tags", story.tags)
        story.featured_image_url = data.get(
            "featured_image_url", story.featured_image_url
        )
        story.updated_at = datetime.utcnow()

        db.session.commit()

        return jsonify({"message": "Story updated", "story": story.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating story {story_id}: {str(e)}")
        return jsonify({"error": "Failed to update story"}), 500


@story_bp.route("/<int:story_id>/approve", methods=["POST"])
@jwt_required()
def approve_story(story_id):
    """Approve a story (admin/moderator only)"""
    try:
        user_id = get_jwt_identity()
        story = Story.query.get_or_404(story_id)

        # TODO: Check if user is admin/moderator

        story.is_approved = True
        story.approved_by = user_id
        story.approved_at = datetime.utcnow()
        story.published_at = datetime.utcnow()

        db.session.commit()

        logger.info(f"Story {story_id} approved by user {user_id}")

        return jsonify({"message": "Story approved", "story": story.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error approving story {story_id}: {str(e)}")
        return jsonify({"error": "Failed to approve story"}), 500


@story_bp.route("/<int:story_id>/like", methods=["POST"])
def like_story(story_id):
    """Like a story"""
    try:
        story = Story.query.get_or_404(story_id)
        story.likes += 1
        db.session.commit()
        return jsonify({"likes": story.likes}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error liking story {story_id}: {str(e)}")
        return jsonify({"error": "Failed to like story"}), 500


@story_bp.route("/<int:story_id>/share", methods=["POST"])
def share_story(story_id):
    """Increment share count for a story"""
    try:
        story = Story.query.get_or_404(story_id)
        story.shares += 1
        db.session.commit()
        return jsonify({"shares": story.shares}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error sharing story {story_id}: {str(e)}")
        return jsonify({"error": "Failed to share story"}), 500


@story_bp.route("/<int:story_id>/comments", methods=["POST"])
@jwt_required()
def add_comment(story_id):
    """Add a comment to a story"""
    try:
        user_id = get_jwt_identity()
        Story.query.get_or_404(story_id)
        data = request.get_json()

        if not data.get("content"):
            return jsonify({"error": "Content is required"}), 400

        comment = StoryComment(
            story_id=story_id, author_id=user_id, content=data.get("content")
        )

        db.session.add(comment)
        db.session.commit()

        return jsonify({"message": "Comment added", "comment": comment.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error adding comment to story {story_id}: {str(e)}")
        return jsonify({"error": "Failed to add comment"}), 500


@story_bp.route("/comments/<int:comment_id>/like", methods=["POST"])
def like_comment(comment_id):
    """Like a story comment"""
    try:
        comment = StoryComment.query.get_or_404(comment_id)
        comment.likes += 1
        db.session.commit()
        return jsonify({"likes": comment.likes}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error liking comment {comment_id}: {str(e)}")
        return jsonify({"error": "Failed to like comment"}), 500


@story_bp.route("/categories", methods=["GET"])
def get_categories():
    """Get available story categories"""
    categories = [
        "Recovery",
        "Coping",
        "Breakthrough",
        "Daily Life",
        "Family Support",
        "General",
    ]
    return jsonify({"categories": categories}), 200
