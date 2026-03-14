from flask_restful import Resource, reqparse
from models import UserRole
from extensions import db
from .serializers import serialize_user, serialize_model


class UserRoleResource(Resource):
    parser = reqparse.RequestParser()

    parser.add_argument("user_id", type=int, required=True)
    parser.add_argument("role_id", type=int, required=True)
    parser.add_argument("is_active", type=bool, required=False, default=True)

    def get(self, user_role_id=None):
        if user_role_id:
            user_role = UserRole.query.get_or_404(user_role_id)
            return {
                "id": user_role.id,
                "user_id": user_role.user_id,
                "role_id": user_role.role_id,
                "assigned_at": user_role.assigned_at,
                "is_active": user_role.is_active,
                "user": serialize_user(user_role.user),
                "role": serialize_model(
                    user_role.role, ["id", "name", "role_type", "is_caregiver"]
                ),
            }, 200

        # Optional: Filter only active role assignments
        user_roles = UserRole.query.filter_by(is_active=True).all()
        result = []
        for ur in user_roles:
            result.append(
                {
                    "id": ur.id,
                    "user_id": ur.user_id,
                    "role_id": ur.role_id,
                    "assigned_at": ur.assigned_at,
                    "is_active": ur.is_active,
                    "user": serialize_user(ur.user),
                    "role": serialize_model(
                        ur.role, ["id", "name", "role_type", "is_caregiver"]
                    ),
                }
            )
        return result, 200

    def post(self):
        data = self.parser.parse_args()

        # Prevent duplicate active assignments
        existing = UserRole.query.filter_by(
            user_id=data["user_id"], role_id=data["role_id"], is_active=True
        ).first()
        if existing:
            return {"message": "Active role already assigned to this user."}, 400

        new_assignment = UserRole(**data)
        db.session.add(new_assignment)
        db.session.commit()

        return {
            "message": "UserRole created successfully",
            "data": {
                "id": new_assignment.id,
                "user_id": new_assignment.user_id,
                "role_id": new_assignment.role_id,
                "assigned_at": new_assignment.assigned_at,
                "is_active": new_assignment.is_active,
            },
        }, 201

    def put(self, user_role_id):
        user_role = UserRole.query.get_or_404(user_role_id)
        data = self.parser.parse_args()

        user_role.user_id = data["user_id"]
        user_role.role_id = data["role_id"]
        user_role.is_active = data["is_active"]

        db.session.commit()
        return {"message": "UserRole updated successfully"}, 200

    def delete(self, user_role_id):
        user_role = UserRole.query.get_or_404(user_role_id)

        if not user_role.is_active:
            return {"message": "UserRole already inactive."}, 400

        user_role.is_active = False
        db.session.commit()
        return {"message": "UserRole deactivated."}, 200
