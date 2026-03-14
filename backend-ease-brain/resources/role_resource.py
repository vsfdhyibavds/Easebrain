from flask_restful import Resource, reqparse
from models import Role
from extensions import db


class RoleResource(Resource):
    parser = reqparse.RequestParser()
    parser.add_argument("name", type=str, required=True)
    parser.add_argument("role_type", type=str, required=True)
    parser.add_argument("is_caregiver", type=bool, required=False, default=False)

    def get(self, role_id=None):
        if role_id:
            role = Role.query.get_or_404(role_id)
            return {
                "id": role.id,
                "name": role.name,
                "role_type": role.role_type,
                "is_caregiver": role.is_caregiver,
            }, 200

        roles = Role.query.all()
        return [
            {
                "id": r.id,
                "name": r.name,
                "role_type": r.role_type,
                "is_caregiver": r.is_caregiver,
            }
            for r in roles
        ], 200

    def post(self):
        data = self.parser.parse_args()
        if Role.query.filter_by(name=data["name"]).first():
            return {"message": "Role already exists"}, 400

        role = Role(**data)
        db.session.add(role)
        db.session.commit()
        return {
            "id": role.id,
            "name": role.name,
            "role_type": role.role_type,
            "is_caregiver": role.is_caregiver,
        }, 201

    def put(self, role_id):
        role = Role.query.get_or_404(role_id)
        data = self.parser.parse_args()

        for key, value in data.items():
            setattr(role, key, value)

        db.session.commit()
        return {
            "id": role.id,
            "name": role.name,
            "role_type": role.role_type,
            "is_caregiver": role.is_caregiver,
        }, 200

    def delete(self, role_id):
        role = Role.query.get_or_404(role_id)
        db.session.delete(role)
        db.session.commit()
        return {"message": "Role deleted successfully"}, 204
