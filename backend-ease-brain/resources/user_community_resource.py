from flask_restful import Resource, reqparse
from models import UserCommunity
from extensions import db
from flask import request


class UserCommunityResource(Resource):
    parser = reqparse.RequestParser()
    parser.add_argument("user_id", type=int, required=True, help="User ID is required")
    parser.add_argument(
        "community_id", type=int, required=True, help="Community ID is required"
    )

    def get(self, user_community_id=None):
        if user_community_id:
            record = UserCommunity.query.get_or_404(user_community_id)
            return {
                "id": record.id,
                "user_id": record.user_id,
                "community_id": record.community_id,
            }, 200

        # Optional filtering via query parameters
        user_id = request.args.get("user_id", type=int)
        community_id = request.args.get("community_id", type=int)

        query = UserCommunity.query
        if user_id:
            query = query.filter_by(user_id=user_id)
        if community_id:
            query = query.filter_by(community_id=community_id)

        records = query.all()

        return [
            {"id": uc.id, "user_id": uc.user_id, "community_id": uc.community_id}
            for uc in records
        ], 200

    def post(self):
        data = self.parser.parse_args()

        # Optional: check if already added
        exists = UserCommunity.query.filter_by(
            user_id=data["user_id"], community_id=data["community_id"]
        ).first()

        if exists:
            return {"message": "User is already in this community."}, 400

        new_uc = UserCommunity(
            user_id=data["user_id"], community_id=data["community_id"]
        )
        db.session.add(new_uc)
        db.session.commit()

        return {
            "id": new_uc.id,
            "user_id": new_uc.user_id,
            "community_id": new_uc.community_id,
        }, 201

    def put(self, user_community_id):
        uc = UserCommunity.query.get_or_404(user_community_id)
        data = self.parser.parse_args()

        uc.user_id = data["user_id"]
        uc.community_id = data["community_id"]

        db.session.commit()

        return {
            "id": uc.id,
            "user_id": uc.user_id,
            "community_id": uc.community_id,
        }, 200

    def delete(self, user_community_id):
        uc = UserCommunity.query.get_or_404(user_community_id)
        db.session.delete(uc)
        db.session.commit()
        return {"message": f"UserCommunity record {user_community_id} deleted."}, 204
