import os
from flask import request
from flask_restful import Resource, reqparse
from models import User
from extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from .serializers import serialize_user
from utils.auth_helpers import require_admin, user_is_admin

# Parser for creating/updating a user
user_parser = reqparse.RequestParser()
user_parser.add_argument("email", type=str, required=True, help="Email is required.")
user_parser.add_argument(
    "password_hash", type=str, required=True, help="Password hash is required."
)
user_parser.add_argument("first_name", type=str)
user_parser.add_argument("last_name", type=str)

# Parser for updating user partially
user_update_parser = reqparse.RequestParser()
user_update_parser.add_argument("email", type=str)
user_update_parser.add_argument("password_hash", type=str)
user_update_parser.add_argument("first_name", type=str)
user_update_parser.add_argument("last_name", type=str)

# Parser for password reset
password_reset_parser = reqparse.RequestParser()
password_reset_parser.add_argument(
    "email", type=str, required=True, help="Email is required."
)


class AvatarUploadResource(Resource):
    @jwt_required()
    def post(self, user_id):
        current_user_id = get_jwt_identity()
        is_admin = user_is_admin(current_user_id)

        # Users can only upload their own avatar, admins can upload for anyone
        if user_id != current_user_id and not is_admin:
            return {"message": "Forbidden: You can only upload your own avatar"}, 403

        user = User.query.get(user_id)
        if not user:
            return {"message": "User not found"}, 404

        if "avatar" not in request.files:
            return {"message": "No file uploaded"}, 400

        avatar = request.files["avatar"]
        # Sanitize filename - prevent directory traversal
        if "/" in avatar.filename or "\\" in avatar.filename:
            return {"message": "Invalid filename"}, 400

        # Validate file size (max 5MB)
        avatar.seek(0, 2)  # Seek to end
        file_size = avatar.tell()
        avatar.seek(0)  # Reset to beginning

        if file_size > 5 * 1024 * 1024:
            return {"message": "File too large (max 5MB)"}, 400

        filename = f"user_{user_id}_avatar.png"
        avatar_dir = os.path.join(os.getcwd(), "static", "avatars")
        os.makedirs(avatar_dir, exist_ok=True)
        filepath = os.path.join(avatar_dir, filename)
        avatar.save(filepath)

        user.avatar_url = f"/static/avatars/{filename}"
        db.session.commit()
        return {"avatarUrl": user.avatar_url}, 200


class PasswordResetResource(Resource):
    def post(self):
        args = password_reset_parser.parse_args()
        email = args["email"]

        user = User.query.filter_by(email=email).first()
        if not user:
            return {"message": "User not found"}, 404

        # Send password reset logic here
        return {"message": "Password reset link sent"}, 200


class UserResource(Resource):
    @jwt_required()
    def get(self, user_id=None):
        try:
            current_user_id = get_jwt_identity()
            is_admin = user_is_admin(current_user_id)

            if user_id:
                # Users can only view their own profile, or admins can view anyone
                if user_id != current_user_id and not is_admin:
                    return {
                        "error": "Forbidden: You can only view your own profile"
                    }, 403

                user = User.query.filter_by(id=user_id, is_active=True).first()
                if not user:
                    return {"error": "User not found"}, 404
                return serialize_user(user), 200

            # Email lookup restricted to admins only
            email = request.args.get("email")
            if email:
                if not is_admin:
                    return {
                        "error": "Forbidden: Email lookup restricted to admins"
                    }, 403
                user = User.query.filter_by(email=email, is_active=True).first()
                if not user:
                    return {"error": "User with that email not found"}, 404
                return serialize_user(user), 200

            # List users - restricted to admins only
            if not is_admin:
                return {"error": "Forbidden: User listing restricted to admins"}, 403

            # Pagination
            page = request.args.get("page", default=1, type=int)
            per_page = request.args.get("per_page", default=10, type=int)
            per_page = min(per_page, 100)  # Cap at 100 to prevent abuse
            pagination = User.query.filter_by(is_active=True).paginate(
                page=page, per_page=per_page, error_out=False
            )
            users = pagination.items
            if not users:
                return {"error": "No users in your database."}, 404

            return {
                "users": [serialize_user(u) for u in users],
                "total": pagination.total,
                "page": pagination.page,
                "pages": pagination.pages,
                "per_page": pagination.per_page,
            }, 200
        except Exception as e:
            return {"error": str(e)}, 500

    def post(self):
        # User creation should go through the SignupResource endpoint
        # This is a security measure to prevent direct user creation bypassing verification
        return {"error": "User creation must be done through the /signup endpoint"}, 405

    @jwt_required()
    def put(self, user_id):
        current_user_id = get_jwt_identity()
        is_admin = user_is_admin(current_user_id)

        # Users can only update their own profile, admins can update anyone
        if user_id != current_user_id and not is_admin:
            return {"error": "Forbidden: You can only update your own profile"}, 403

        user = User.query.filter_by(id=user_id, is_active=True).first()
        if not user:
            return {"error": "User not found"}, 404

        args = user_update_parser.parse_args()

        if args.get("email"):
            # Prevent email changes (should be done through dedicated endpoint)
            if not is_admin:
                return {"error": "Email changes require admin assistance"}, 403
            user.email = args["email"]

        if args.get("first_name"):
            user.first_name = args["first_name"]
        if args.get("last_name"):
            user.last_name = args["last_name"]

        # Prevent direct password_hash changes (should use password reset endpoint)
        if args.get("password_hash"):
            return {"error": "Use the password reset endpoint to change passwords"}, 400

        db.session.commit()
        return serialize_user(user), 200

    @jwt_required()
    def delete(self, user_id):
        current_user_id = get_jwt_identity()
        is_admin = user_is_admin(current_user_id)

        # Users can only deactivate their own account, admins can deactivate anyone
        if user_id != current_user_id and not is_admin:
            return {"error": "Forbidden: You can only deactivate your own account"}, 403

        user = User.query.filter_by(id=user_id, is_active=True).first()
        if not user:
            return {"error": "User not found or deactivated"}, 404
        try:
            user.is_active = False
            db.session.commit()
            return {"message": f"User {user.email} has been deactivated."}, 200
        except Exception as e:
            return {"error": str(e)}, 500


class CurrentUserResource(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return {"error": "User not found"}, 404

        return serialize_user(user), 200
