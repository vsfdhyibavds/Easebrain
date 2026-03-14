from flask_restful import Resource, reqparse
from werkzeug.security import check_password_hash, generate_password_hash
from flask_jwt_extended import create_access_token
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Organization, User
from extensions import db
from sqlalchemy.exc import IntegrityError
from resources.serializers import serialize_model


class OrganizationLoginResource(Resource):
    parser = reqparse.RequestParser()
    parser.add_argument("email", type=str, required=True)
    parser.add_argument("password", type=str, required=True)

    def post(self):
        data = self.parser.parse_args()
        org = Organization.query.filter_by(email=data["email"]).first()

        if not org or not check_password_hash(org.password_hash, data["password"]):
            return {"message": "Invalid credentials"}, 401

        access_token = create_access_token(identity={"org_id": org.id})
        org_payload = serialize_model(org, ["id", "name", "email", "created_at"])
        return {"access_token": access_token, "organization": org_payload}, 200


class OrganizationRegisterResource(Resource):
    parser = reqparse.RequestParser()
    parser.add_argument("name", type=str, required=True)
    parser.add_argument("email", type=str, required=True)
    parser.add_argument("password", type=str, required=True)

    def post(self):
        data = self.parser.parse_args()

        org = Organization(
            name=data["name"],
            email=data["email"],
            password_hash=generate_password_hash(data["password"]),
        )

        db.session.add(org)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return {
                "message": "Organization with that email or name already exists."
            }, 409

        org_payload = serialize_model(org, ["id", "name", "email", "created_at"])
        return org_payload, 201


class OrganizationDashboardResource(Resource):
    @jwt_required()
    def get(self):
        identity = get_jwt_identity()
        org_id = identity.get("org_id")

        if not org_id:
            return {"message": "Not authorized as an organization"}, 403

        org = Organization.query.get_or_404(org_id)

        users = User.query.filter_by(organization_id=org.id).all()

        # Optional: get roles for each user
        data = []
        for user in users:
            roles = [
                {
                    "role_id": ur.role.id,
                    "name": ur.role.name,
                    "type": ur.role.role_type,
                    "is_caregiver": ur.role.is_caregiver,
                }
                for ur in user.user_roles
            ]
            data.append({"user_id": user.id, "email": user.email, "roles": roles})
        org_payload = serialize_model(org, ["id", "name", "email", "created_at"])
        return {"organization": org_payload, "users": data}, 200
