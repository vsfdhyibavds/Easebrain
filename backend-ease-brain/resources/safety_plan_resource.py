from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import SafetyPlan, SafetyPlanAccess, SafetyPlanUpdate, CaregiverConnection
from datetime import datetime
import json
import logging

safety_plan_bp = Blueprint("safety_plans", __name__, url_prefix="/safety-plans")
logger = logging.getLogger(__name__)


@safety_plan_bp.route("/", methods=["GET"])
@jwt_required()
def get_my_safety_plans():
    """Get all safety plans for the current user"""
    try:
        user_id = get_jwt_identity()
        plans = (
            SafetyPlan.query.filter_by(user_id=user_id)
            .order_by(SafetyPlan.last_updated.desc())
            .all()
        )

        result = []
        for plan in plans:
            result.append(
                {
                    "id": plan.id,
                    "title": plan.title,
                    "description": plan.description,
                    "last_updated": plan.last_updated.isoformat(),
                    "shared_with_caregivers": plan.shared_with_caregivers,
                    "caregiver_count": len(plan.caregiver_accesses),
                }
            )

        return jsonify({"safety_plans": result}), 200
    except Exception as e:
        logger.error(f"Error fetching safety plans: {str(e)}")
        return jsonify({"error": "Failed to fetch safety plans"}), 500


@safety_plan_bp.route("/<int:plan_id>", methods=["GET"])
@jwt_required()
def get_safety_plan(plan_id):
    """Get a specific safety plan"""
    try:
        user_id = get_jwt_identity()
        plan = SafetyPlan.query.get_or_404(plan_id)

        # Check access (owner or caregiver with permission)
        access = SafetyPlanAccess.query.filter_by(
            safety_plan_id=plan_id, caregiver_id=user_id
        ).first()

        if plan.user_id != user_id and not access:
            return jsonify({"error": "Unauthorized"}), 403

        # Mark as viewed if caregiver
        if access and access.can_view:
            access.last_viewed_at = datetime.utcnow()
            db.session.commit()

        plan_data = {
            "id": plan.id,
            "title": plan.title,
            "description": plan.description,
            "warning_signs": json.loads(plan.warning_signs)
            if plan.warning_signs
            else [],
            "internal_coping": json.loads(plan.internal_coping)
            if plan.internal_coping
            else [],
            "people_to_talk_to": json.loads(plan.people_to_talk_to)
            if plan.people_to_talk_to
            else [],
            "professional_contacts": json.loads(plan.professional_contacts)
            if plan.professional_contacts
            else [],
            "crisis_hotlines": json.loads(plan.crisis_hotlines)
            if plan.crisis_hotlines
            else [],
            "means_restriction": plan.means_restriction,
            "after_crisis_plan": plan.after_crisis_plan,
            "last_updated": plan.last_updated.isoformat(),
            "created_at": plan.created_at.isoformat(),
        }

        return jsonify(plan_data), 200
    except Exception as e:
        logger.error(f"Error fetching safety plan {plan_id}: {str(e)}")
        return jsonify({"error": "Failed to fetch safety plan"}), 500


@safety_plan_bp.route("/", methods=["POST"])
@jwt_required()
def create_safety_plan():
    """Create a new safety plan"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        plan = SafetyPlan(
            user_id=user_id,
            title=data.get("title", "My Safety Plan"),
            description=data.get("description"),
            warning_signs=json.dumps(data.get("warning_signs", [])),
            internal_coping=json.dumps(data.get("internal_coping", [])),
            people_to_talk_to=json.dumps(data.get("people_to_talk_to", [])),
            professional_contacts=json.dumps(data.get("professional_contacts", [])),
            crisis_hotlines=json.dumps(data.get("crisis_hotlines", [])),
            means_restriction=data.get("means_restriction"),
            after_crisis_plan=data.get("after_crisis_plan"),
        )

        db.session.add(plan)
        db.session.commit()

        logger.info(f"Safety plan {plan.id} created by user {user_id}")

        return jsonify({"message": "Safety plan created", "plan_id": plan.id}), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating safety plan: {str(e)}")
        return jsonify({"error": "Failed to create safety plan"}), 500


@safety_plan_bp.route("/<int:plan_id>", methods=["PUT"])
@jwt_required()
def update_safety_plan(plan_id):
    """Update a safety plan"""
    try:
        user_id = get_jwt_identity()
        plan = SafetyPlan.query.get_or_404(plan_id)

        if plan.user_id != user_id:
            return jsonify({"error": "Unauthorized"}), 403

        data = request.get_json()

        # Track updates
        sections_updated = []

        if "title" in data:
            plan.title = data["title"]
            sections_updated.append("title")

        if "description" in data:
            plan.description = data["description"]
            sections_updated.append("description")

        if "warning_signs" in data:
            plan.warning_signs = json.dumps(data["warning_signs"])
            sections_updated.append("warning_signs")

        if "internal_coping" in data:
            plan.internal_coping = json.dumps(data["internal_coping"])
            sections_updated.append("internal_coping")

        if "people_to_talk_to" in data:
            plan.people_to_talk_to = json.dumps(data["people_to_talk_to"])
            sections_updated.append("people_to_talk_to")

        if "professional_contacts" in data:
            plan.professional_contacts = json.dumps(data["professional_contacts"])
            sections_updated.append("professional_contacts")

        if "crisis_hotlines" in data:
            plan.crisis_hotlines = json.dumps(data["crisis_hotlines"])
            sections_updated.append("crisis_hotlines")

        if "means_restriction" in data:
            plan.means_restriction = data["means_restriction"]
            sections_updated.append("means_restriction")

        if "after_crisis_plan" in data:
            plan.after_crisis_plan = data["after_crisis_plan"]
            sections_updated.append("after_crisis_plan")

        plan.last_updated = datetime.utcnow()

        # Create update record for each section changed
        for section in sections_updated:
            update = SafetyPlanUpdate(
                safety_plan_id=plan_id,
                updated_by=user_id,
                section_updated=section,
                change_note=data.get("change_note"),
            )
            db.session.add(update)

        db.session.commit()

        logger.info(f"Safety plan {plan_id} updated by user {user_id}")

        return jsonify({"message": "Safety plan updated"}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating safety plan {plan_id}: {str(e)}")
        return jsonify({"error": "Failed to update safety plan"}), 500


@safety_plan_bp.route("/<int:plan_id>/share", methods=["POST"])
@jwt_required()
def share_safety_plan(plan_id):
    """Share safety plan with caregivers"""
    try:
        user_id = get_jwt_identity()
        plan = SafetyPlan.query.get_or_404(plan_id)

        if plan.user_id != user_id:
            return jsonify({"error": "Unauthorized"}), 403

        data = request.get_json()
        caregiver_ids = data.get("caregiver_ids", [])
        can_edit = data.get("can_edit", False)

        shared_count = 0
        for caregiver_id in caregiver_ids:
            # Verify caregiver connection exists
            connection = CaregiverConnection.query.filter_by(
                patient_id=user_id, caregiver_id=caregiver_id, is_active=True
            ).first()

            if not connection:
                continue

            # Check if access already exists
            existing = SafetyPlanAccess.query.filter_by(
                safety_plan_id=plan_id, caregiver_id=caregiver_id
            ).first()

            if existing:
                existing.can_edit = can_edit
            else:
                access = SafetyPlanAccess(
                    safety_plan_id=plan_id,
                    caregiver_id=caregiver_id,
                    can_view=True,
                    can_edit=can_edit,
                )
                db.session.add(access)

            shared_count += 1

        plan.shared_with_caregivers = shared_count > 0
        db.session.commit()

        logger.info(f"Safety plan {plan_id} shared with {shared_count} caregivers")

        return jsonify(
            {
                "message": f"Safety plan shared with {shared_count} caregiver(s)",
                "shared_count": shared_count,
            }
        ), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error sharing safety plan: {str(e)}")
        return jsonify({"error": "Failed to share safety plan"}), 500


@safety_plan_bp.route("/<int:plan_id>/access", methods=["GET"])
@jwt_required()
def get_plan_access(plan_id):
    """Get list of caregivers with access to this plan"""
    try:
        user_id = get_jwt_identity()
        plan = SafetyPlan.query.get_or_404(plan_id)

        if plan.user_id != user_id:
            return jsonify({"error": "Unauthorized"}), 403

        accesses = SafetyPlanAccess.query.filter_by(safety_plan_id=plan_id).all()

        result = []
        for access in accesses:
            result.append(
                {
                    "access_id": access.id,
                    "caregiver_id": access.caregiver_id,
                    "caregiver_name": f"{access.caregiver.first_name} {access.caregiver.last_name}".strip(),
                    "can_view": access.can_view,
                    "can_edit": access.can_edit,
                    "granted_at": access.granted_at.isoformat(),
                    "last_viewed_at": access.last_viewed_at.isoformat()
                    if access.last_viewed_at
                    else None,
                }
            )

        return jsonify({"accesses": result}), 200
    except Exception as e:
        logger.error(f"Error fetching plan access: {str(e)}")
        return jsonify({"error": "Failed to fetch plan access"}), 500


@safety_plan_bp.route("/<int:plan_id>/revoke/<int:caregiver_id>", methods=["DELETE"])
@jwt_required()
def revoke_access(plan_id, caregiver_id):
    """Revoke caregiver access to safety plan"""
    try:
        user_id = get_jwt_identity()
        plan = SafetyPlan.query.get_or_404(plan_id)

        if plan.user_id != user_id:
            return jsonify({"error": "Unauthorized"}), 403

        access = SafetyPlanAccess.query.filter_by(
            safety_plan_id=plan_id, caregiver_id=caregiver_id
        ).first()

        if not access:
            return jsonify({"error": "Access not found"}), 404

        db.session.delete(access)

        # Update shared status
        remaining = SafetyPlanAccess.query.filter_by(safety_plan_id=plan_id).count()
        plan.shared_with_caregivers = remaining > 0

        db.session.commit()

        logger.info(f"Access revoked: caregiver {caregiver_id} from plan {plan_id}")

        return jsonify({"message": "Access revoked"}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error revoking access: {str(e)}")
        return jsonify({"error": "Failed to revoke access"}), 500


@safety_plan_bp.route("/<int:plan_id>/history", methods=["GET"])
@jwt_required()
def get_plan_history(plan_id):
    """Get update history for a safety plan"""
    try:
        user_id = get_jwt_identity()
        plan = SafetyPlan.query.get_or_404(plan_id)

        # Check access (owner or caregiver)
        if plan.user_id != user_id:
            access = SafetyPlanAccess.query.filter_by(
                safety_plan_id=plan_id, caregiver_id=user_id
            ).first()
            if not access:
                return jsonify({"error": "Unauthorized"}), 403

        updates = (
            SafetyPlanUpdate.query.filter_by(safety_plan_id=plan_id)
            .order_by(SafetyPlanUpdate.updated_at.desc())
            .all()
        )

        result = []
        for update in updates:
            result.append(
                {
                    "id": update.id,
                    "section": update.section_updated,
                    "updated_by": f"{update.updater.first_name} {update.updater.last_name}".strip(),
                    "change_note": update.change_note,
                    "updated_at": update.updated_at.isoformat(),
                }
            )

        return jsonify({"history": result}), 200
    except Exception as e:
        logger.error(f"Error fetching plan history: {str(e)}")
        return jsonify({"error": "Failed to fetch history"}), 500


@safety_plan_bp.route("/caregiver/accessible", methods=["GET"])
@jwt_required()
def get_accessible_plans():
    """Get all safety plans shared with the current caregiver"""
    try:
        caregiver_id = get_jwt_identity()

        accesses = SafetyPlanAccess.query.filter_by(caregiver_id=caregiver_id).all()

        result = []
        for access in accesses:
            plan = access.safety_plan
            result.append(
                {
                    "id": plan.id,
                    "title": plan.title,
                    "patient_name": f"{plan.user.first_name} {plan.user.last_name}".strip(),
                    "patient_id": plan.user_id,
                    "last_updated": plan.last_updated.isoformat(),
                    "can_edit": access.can_edit,
                    "last_viewed_at": access.last_viewed_at.isoformat()
                    if access.last_viewed_at
                    else None,
                }
            )

        return jsonify({"accessible_plans": result}), 200
    except Exception as e:
        logger.error(f"Error fetching accessible plans: {str(e)}")
        return jsonify({"error": "Failed to fetch accessible plans"}), 500
