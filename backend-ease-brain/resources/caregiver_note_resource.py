from flask_restful import Resource, reqparse
from models import CaregiverNote
from extensions import db
from flask import request
from .serializers import serialize_model


class CaregiverNoteResource(Resource):
    parser = reqparse.RequestParser()
    parser.add_argument(
        "caregiver_id", type=int, required=True, help="Caregiver ID is required"
    )
    parser.add_argument("user_id", type=int, required=True, help="User ID is required")
    parser.add_argument(
        "note", type=str, required=True, help="Note content is required"
    )

    def get(self, note_id=None):
        if note_id:
            note = CaregiverNote.query.get_or_404(note_id)
            return serialize_model(
                note, ["id", "caregiver_id", "user_id", "note", "created_at"]
            ), 200

        # Optional filtering by user or caregiver
        caregiver_id = request.args.get("caregiver_id")
        user_id = request.args.get("user_id")

        query = CaregiverNote.query

        if caregiver_id:
            query = query.filter_by(caregiver_id=caregiver_id)
        if user_id:
            query = query.filter_by(user_id=user_id)

        notes = query.all()
        return [
            serialize_model(n, ["id", "caregiver_id", "user_id", "note", "created_at"])
            for n in notes
        ], 200

    def post(self):
        data = self.parser.parse_args()
        new_note = CaregiverNote(
            caregiver_id=data["caregiver_id"],
            user_id=data["user_id"],
            note=data["note"],
        )
        db.session.add(new_note)
        db.session.commit()
        return serialize_model(
            new_note, ["id", "caregiver_id", "user_id", "note", "created_at"]
        ), 201

    def put(self, note_id):
        note = CaregiverNote.query.get_or_404(note_id)
        data = self.parser.parse_args()

        note.caregiver_id = data["caregiver_id"]
        note.user_id = data["user_id"]
        note.note = data["note"]
        db.session.commit()

        return serialize_model(
            note, ["id", "caregiver_id", "user_id", "note", "created_at"]
        ), 200

    def delete(self, note_id):
        note = CaregiverNote.query.get_or_404(note_id)
        db.session.delete(note)
        db.session.commit()
        return {"message": f"Note {note_id} deleted successfully."}, 204
