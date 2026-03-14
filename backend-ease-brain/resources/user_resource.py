import os
from flask import request
from flask_restful import Resource, reqparse
from models import User
from extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from .serializers import serialize_user

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
    def post(self, user_id):
        user = User.query.get(user_id)
        if not user:
            return {"message": "User not found"}, 404

        if "avatar" not in request.files:
            return {"message": "No file uploaded"}, 400

        avatar = request.files["avatar"]
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
    def get(self, user_id=None):
        try:
            if user_id:
                user = User.query.filter_by(id=user_id, is_active=True).first()
                if not user:
                    return {"error": "User not found"}, 404
                return serialize_user(user), 200

            email = request.args.get("email")
            if email:
                user = User.query.filter_by(email=email, is_active=True).first()
                if not user:
                    return {"error": "User with that email not found"}, 404
                return serialize_user(user), 200

            # Pagination
            page = request.args.get("page", default=1, type=int)
            per_page = request.args.get("per_page", default=10, type=int)
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
        args = user_parser.parse_args()

        if User.query.filter_by(email=args["email"]).first():
            return {"error": "User with this email already exists"}, 400

        user = User(
            email=args["email"],
            password_hash=args["password_hash"],
            first_name=args.get("first_name"),
            last_name=args.get("last_name"),
        )
        db.session.add(user)
        db.session.commit()
        return serialize_user(user), 201

    def put(self, user_id):
        user = User.query.filter_by(id=user_id, is_active=True).first()
        if not user:
            return {"error": "User not found"}, 404

        args = user_update_parser.parse_args()

        if args.get("email"):
            user.email = args["email"]
        if args.get("password_hash"):
            user.password_hash = args["password_hash"]
        if args.get("first_name"):
            user.first_name = args["first_name"]
        if args.get("last_name"):
            user.last_name = args["last_name"]

        db.session.commit()
        return serialize_user(user), 200

    def delete(self, user_id):
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
