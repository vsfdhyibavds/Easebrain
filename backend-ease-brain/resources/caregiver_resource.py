from flask_restful import Resource, reqparse
from flask import send_file
from extensions import db
from models import User, CaregiverNote, CaregiverConnection, UserVerification
from flask_jwt_extended import jwt_required, get_jwt_identity
import io
import csv
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class CaregiverReportResource(Resource):
    """Handle report generation for caregivers."""

    parser = reqparse.RequestParser()
    parser.add_argument("start_date", type=str, required=False)
    parser.add_argument("end_date", type=str, required=False)
    parser.add_argument(
        "format", type=str, default="pdf", choices=["pdf", "csv", "xlsx"]
    )

    @jwt_required()
    def post(self):
        """Generate a caregiver report."""
        try:
            caregiver_id = get_jwt_identity()
            args = self.parser.parse_args()

            # Get report period
            end_date = datetime.now()
            start_date = end_date - timedelta(days=30)  # Default to last 30 days

            if args.start_date:
                try:
                    start_date = datetime.fromisoformat(args.start_date)
                except ValueError:
                    return {
                        "success": False,
                        "message": "Invalid start_date format",
                    }, 400

            if args.end_date:
                try:
                    end_date = datetime.fromisoformat(args.end_date)
                except ValueError:
                    return {"success": False, "message": "Invalid end_date format"}, 400

            # Get caregiver's notes for the period
            notes = CaregiverNote.query.filter(
                CaregiverNote.caregiver_id == caregiver_id,
                CaregiverNote.created_at >= start_date,
                CaregiverNote.created_at <= end_date,
            ).all()

            report_data = {
                "success": True,
                "report_id": f"RPT-{caregiver_id}-{datetime.now().timestamp()}",
                "caregiver_id": caregiver_id,
                "period": {
                    "start_date": start_date.isoformat(),
                    "end_date": end_date.isoformat(),
                },
                "summary": {
                    "total_notes": len(notes),
                    "period_days": (end_date - start_date).days,
                },
                "notes": [
                    {
                        "id": note.id,
                        "user_id": note.user_id,
                        "content": note.note,
                        "created_at": note.created_at.isoformat()
                        if note.created_at
                        else None,
                    }
                    for note in notes
                ],
                "generated_at": datetime.now().isoformat(),
            }

            logger.info(
                f"Report generated for caregiver {caregiver_id}: {len(notes)} notes"
            )
            return report_data, 200

        except Exception as e:
            logger.error(f"Report generation failed: {str(e)}")
            return {"success": False, "message": "Failed to generate report"}, 500


class CaregiverHealthDataExportResource(Resource):
    """Handle health data export for caregivers."""

    @jwt_required()
    def get(self):
        """Export caregiver's health data as CSV."""
        try:
            caregiver_id = get_jwt_identity()

            # Get caregiver's notes and dependents
            notes = CaregiverNote.query.filter_by(caregiver_id=caregiver_id).all()

            # Create CSV in memory
            output = io.StringIO()
            writer = csv.writer(output)

            # Write header
            writer.writerow(["Note ID", "Dependent ID", "Content", "Created At"])

            # Write data rows
            for note in notes:
                writer.writerow(
                    [
                        note.id,
                        note.user_id,
                        note.note,
                        note.created_at.isoformat() if note.created_at else "",
                    ]
                )

            # Create file-like object
            output.seek(0)
            output_bytes = io.BytesIO(output.getvalue().encode("utf-8"))
            output_bytes.seek(0)

            filename = (
                f"health-data-{caregiver_id}-{datetime.now().strftime('%Y%m%d')}.csv"
            )

            logger.info(f"Health data exported for caregiver {caregiver_id}")
            return send_file(
                output_bytes,
                mimetype="text/csv",
                as_attachment=True,
                download_name=filename,
            )

        except Exception as e:
            logger.error(f"Health data export failed: {str(e)}")
            return {"success": False, "message": "Failed to export health data"}, 500


class CaregiverActivityResource(Resource):
    """Handle caregiver activity actions."""

    @jwt_required()
    def post(self, activity_id, action):
        """Process activity action (approve, alert, view)."""
        try:
            caregiver_id = get_jwt_identity()

            if action == "approve":
                # Mark activity as approved
                logger.info(f"Caregiver {caregiver_id} approved activity {activity_id}")
                return {
                    "success": True,
                    "message": "Activity approved successfully",
                    "activity_id": activity_id,
                    "status": "approved",
                }, 200

            elif action == "alert":
                # Create alert for activity
                logger.info(
                    f"Caregiver {caregiver_id} created alert for activity {activity_id}"
                )
                return {
                    "success": True,
                    "message": "Alert created successfully",
                    "activity_id": activity_id,
                    "alert_id": f"ALT-{activity_id}-{datetime.now().timestamp()}",
                }, 200

            elif action == "view":
                # Get activity details
                logger.info(f"Caregiver {caregiver_id} viewed activity {activity_id}")
                return {
                    "success": True,
                    "message": "Activity details retrieved",
                    "activity_id": activity_id,
                    "activity": {
                        "id": activity_id,
                        "type": "health_check",
                        "dependent_id": 1,
                        "status": "pending",
                        "created_at": datetime.now().isoformat(),
                        "description": f"Activity {activity_id} details",
                    },
                }, 200
            else:
                return {"success": False, "message": f"Unknown action: {action}"}, 400

        except Exception as e:
            logger.error(f"Activity action failed: {str(e)}")
            return {
                "success": False,
                "message": "Failed to process activity action",
            }, 500


class CaregiverNotificationResource(Resource):
    """Handle caregiver notifications."""

    @jwt_required()
    def get(self):
        """Get caregiver's notifications."""
        try:
            caregiver_id = get_jwt_identity()

            # Return mock notifications for now
            notifications = [
                {
                    "id": 1,
                    "type": "task_reminder",
                    "title": "Health Check Due",
                    "message": "Daily health check for John Doe is due",
                    "created_at": datetime.now().isoformat(),
                    "read": False,
                },
                {
                    "id": 2,
                    "type": "appointment_reminder",
                    "title": "Upcoming Appointment",
                    "message": "Appointment with Dr. Smith in 2 hours",
                    "created_at": (datetime.now() - timedelta(hours=1)).isoformat(),
                    "read": False,
                },
                {
                    "id": 3,
                    "type": "alert",
                    "title": "Urgent Alert",
                    "message": "Medication refill needed for Jane Doe",
                    "created_at": (datetime.now() - timedelta(hours=2)).isoformat(),
                    "read": True,
                },
            ]

            logger.info(f"Fetched notifications for caregiver {caregiver_id}")
            return {
                "success": True,
                "count": len(notifications),
                "notifications": notifications,
            }, 200

        except Exception as e:
            logger.error(f"Notification fetch failed: {str(e)}")
            return {"success": False, "message": "Failed to fetch notifications"}, 500


class CaregiverDependentResource(Resource):
    """Handle dependent management for caregivers."""

    parser = reqparse.RequestParser()
    parser.add_argument("name", type=str, required=True)
    parser.add_argument("date_of_birth", type=str, required=False)
    parser.add_argument("medical_history", type=str, required=False)
    parser.add_argument("emergency_contact", type=str, required=False)

    @jwt_required()
    def get(self):
        """Get list of dependents for the current caregiver."""
        try:
            caregiver_id = get_jwt_identity()

            # Get all caregiver connections where this user is the caregiver
            connections = CaregiverConnection.query.filter(
                CaregiverConnection.caregiver_id == caregiver_id,
                CaregiverConnection.is_active == True,
            ).all()

            dependents = []
            for connection in connections:
                patient = connection.patient
                # Get verification status for this dependent
                verification = UserVerification.query.filter_by(
                    user_id=patient.id
                ).first()
                is_verified = verification.is_verified if verification else False

                dependents.append(
                    {
                        "id": patient.id,
                        "name": f"{patient.first_name} {patient.last_name}".strip()
                        or patient.email,
                        "email": patient.email,
                        "status": "Excellent",  # Mock status - can be enhanced
                        "mood": "Positive",  # Mock mood - can be enhanced
                        "lastCheck": datetime.now().strftime("%H:%M"),
                        "relationship": connection.relationship or "Dependent",
                        "role": connection.role or "Primary",
                        "is_verified": is_verified,  # Verification status
                        "verified_at": verification.created_at.isoformat()
                        if verification and is_verified
                        else None,
                    }
                )

            logger.info(
                f"Fetched {len(dependents)} dependents for caregiver {caregiver_id}"
            )
            return {
                "success": True,
                "dependents_count": len(dependents),
                "dependents": dependents,
            }, 200

        except Exception as e:
            import traceback

            logger.error(f"Failed to fetch dependents: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            return {
                "success": False,
                "message": f"Failed to fetch dependents: {str(e)}",
            }, 500

    @jwt_required()
    def post(self):
        """Add a new dependent."""
        try:
            caregiver_id = get_jwt_identity()
            args = self.parser.parse_args()

            # Create dependent user record
            dependent = User(
                email=f"dependent-{datetime.now().timestamp()}@easebrain.local",
                password_hash="",  # Dependents don't have passwords
                is_active=True,
                full_name=args.name,
            )

            db.session.add(dependent)
            db.session.commit()

            logger.info(
                f"New dependent {dependent.id} added by caregiver {caregiver_id}"
            )

            return {
                "success": True,
                "message": "Dependent added successfully",
                "dependent_id": dependent.id,
                "name": args.name,
            }, 201

        except Exception as e:
            db.session.rollback()
            logger.error(f"Failed to add dependent: {str(e)}")
            return {"success": False, "message": "Failed to add dependent"}, 500

    @jwt_required()
    def put(self, dependent_id):
        """Update a dependent's information."""
        try:
            caregiver_id = get_jwt_identity()

            # Verify the dependent belongs to this caregiver
            dependent = User.query.get(dependent_id)
            if not dependent:
                return {"success": False, "message": "Dependent not found"}, 404

            # Check if caregiver has access to this dependent
            connection = CaregiverConnection.query.filter_by(
                caregiver_id=caregiver_id, patient_id=dependent_id, is_active=True
            ).first()

            if not connection:
                return {"success": False, "message": "Access denied"}, 403

            args = self.parser.parse_args()

            # Update dependent fields
            if args.get("name"):
                dependent.first_name = args["name"].split()[0] if args["name"] else ""
                dependent.last_name = (
                    " ".join(args["name"].split()[1:])
                    if len(args["name"].split()) > 1
                    else ""
                )

            if args.get("date_of_birth"):
                dependent.date_of_birth = args["date_of_birth"]

            if args.get("medical_history"):
                # Store in notes or a dedicated field if available
                pass

            if args.get("emergency_contact"):
                dependent.phone_number = args["emergency_contact"]

            db.session.commit()

            logger.info(f"Dependent {dependent_id} updated by caregiver {caregiver_id}")

            return {
                "success": True,
                "message": "Dependent updated successfully",
                "dependent_id": dependent.id,
                "name": f"{dependent.first_name} {dependent.last_name}".strip(),
            }, 200

        except Exception as e:
            db.session.rollback()
            logger.error(f"Failed to update dependent: {str(e)}")
            return {"success": False, "message": "Failed to update dependent"}, 500

    @jwt_required()
    def delete(self, dependent_id):
        """Delete/deactivate a dependent."""
        try:
            caregiver_id = get_jwt_identity()

            # Verify the dependent belongs to this caregiver
            dependent = User.query.get(dependent_id)
            if not dependent:
                return {"success": False, "message": "Dependent not found"}, 404

            # Check if caregiver has access to this dependent
            connection = CaregiverConnection.query.filter_by(
                caregiver_id=caregiver_id, patient_id=dependent_id, is_active=True
            ).first()

            if not connection:
                return {"success": False, "message": "Access denied"}, 403

            # Soft delete: deactivate the connection and user
            connection.is_active = False
            dependent.is_active = False
            db.session.commit()

            logger.info(f"Dependent {dependent_id} deleted by caregiver {caregiver_id}")

            return {
                "success": True,
                "message": f"Dependent {dependent.email} has been deleted",
            }, 200

        except Exception as e:
            db.session.rollback()
            logger.error(f"Failed to delete dependent: {str(e)}")
            return {"success": False, "message": "Failed to delete dependent"}, 500


class CaregiverDashboardResource(Resource):
    """Consolidated endpoint for all caregiver dashboard data.

    Returns: stats, dependents, recent activities, and performance metrics
    in a single API call to reduce frontend network overhead.
    """

    def get(self):
        """Get consolidated dashboard data."""
        try:
            # For now, return mock data structure that matches frontend expectations
            # In production, this would fetch real data from database
            dashboard_data = {
                "stats": {
                    "dependents_count": 3,
                    "active_tasks": 12,
                    "safety_concerns": 1,
                    "completion_rate": 78,
                },
                "dependents": [
                    {
                        "id": 1,
                        "name": "Mary Johnson",
                        "age": 72,
                        "status": "Excellent",
                        "mood": "positive",
                        "medication_adherence": 95,
                        "lastCheck": "2 hours ago",
                        "is_verified": True,
                    },
                    {
                        "id": 2,
                        "name": "Robert Smith",
                        "age": 68,
                        "status": "Stable",
                        "mood": "neutral",
                        "medication_adherence": 82,
                        "lastCheck": "1 hour ago",
                        "is_verified": False,
                    },
                    {
                        "id": 3,
                        "name": "Patricia Davis",
                        "age": 75,
                        "status": "Needs Attention",
                        "mood": "negative",
                        "medication_adherence": 65,
                        "lastCheck": "30 minutes ago",
                        "is_verified": True,
                    },
                ],
                "recent_activities": [
                    {
                        "id": 1,
                        "dependent": "Mary Johnson",
                        "activity": "Morning medications",
                        "priority": "high",
                        "timestamp": datetime.now().isoformat(),
                        "status": "completed",
                    },
                    {
                        "id": 2,
                        "dependent": "Robert Smith",
                        "activity": "Physical therapy",
                        "priority": "medium",
                        "timestamp": datetime.now().isoformat(),
                        "status": "pending",
                    },
                    {
                        "id": 3,
                        "dependent": "Patricia Davis",
                        "activity": "Blood pressure check",
                        "priority": "high",
                        "timestamp": datetime.now().isoformat(),
                        "status": "pending",
                    },
                ],
                "performance": {
                    "overall_score": 78,
                    "rating": "4.5",
                    "task_completion": 78,
                    "medication_adherence": 81,
                    "mood_positivity": 72,
                    "response_time": 85,
                },
                "mood_data": [
                    {"date": "Mon", "positive": 4, "neutral": 2, "negative": 1},
                    {"date": "Tue", "positive": 5, "neutral": 1, "negative": 1},
                    {"date": "Wed", "positive": 3, "neutral": 3, "negative": 1},
                    {"date": "Thu", "positive": 6, "neutral": 1, "negative": 0},
                    {"date": "Fri", "positive": 5, "neutral": 2, "negative": 0},
                    {"date": "Sat", "positive": 4, "neutral": 2, "negative": 1},
                    {"date": "Sun", "positive": 5, "neutral": 1, "negative": 1},
                ],
                "medication_data": [
                    {"dependent": "Mary Johnson", "taken": 28, "missed": 2},
                    {"dependent": "Robert Smith", "taken": 25, "missed": 5},
                    {"dependent": "Patricia Davis", "taken": 20, "missed": 10},
                ],
            }
            return dashboard_data, 200
        except Exception as e:
            logger.error(f"Failed to load dashboard data: {str(e)}")
            return {"success": False, "message": "Failed to load dashboard data"}, 500
