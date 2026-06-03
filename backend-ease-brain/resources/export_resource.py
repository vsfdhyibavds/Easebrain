"""
Data Export Resource for Admin Dashboard
Provides endpoints to export system data in various formats (CSV, JSON, Excel)
"""

from flask_restful import Resource, reqparse
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import User, UserRole, Role, Reminder, CaregiverConnection
from utils.auth_helpers import require_admin
import logging
import json
import io
import csv
from datetime import datetime

logger = logging.getLogger(__name__)


class AdminDataExportResource(Resource):
    """Export all system data for admin dashboards"""

    parser = reqparse.RequestParser()
    parser.add_argument(
        "format",
        type=str,
        default="json",
        choices=["json", "csv"],
        help="Export format",
    )
    parser.add_argument(
        "include",
        type=str,
        default="users,dependents,tasks",
        help="Comma-separated list of data types to include",
    )

    @require_admin
    def get(self):
        """Export system data in the specified format"""
        try:
            args = self.parser.parse_args()
            format_type = args["format"]
            include_list = [item.strip() for item in args["include"].split(",")]

            # Collect data based on requested types
            export_data = {
                "exportDate": datetime.utcnow().isoformat(),
                "exportedAt": datetime.utcnow().isoformat(),
            }

            if "users" in include_list:
                export_data["users"] = _get_users_data()

            if "dependents" in include_list:
                export_data["dependents"] = _get_dependents_data()

            if "tasks" in include_list:
                export_data["tasks"] = _get_tasks_data()

            if "caregivers" in include_list:
                export_data["caregivers"] = _get_caregivers_data()

            if "reminders" in include_list:
                export_data["reminders"] = _get_reminders_data()

            # Add summary statistics
            export_data["summary"] = {
                "totalUsers": len(export_data.get("users", [])),
                "totalDependents": len(export_data.get("dependents", [])),
                "totalTasks": len(export_data.get("tasks", [])),
                "totalCaregivers": len(export_data.get("caregivers", [])),
                "totalReminders": len(export_data.get("reminders", [])),
            }

            if format_type == "json":
                return export_data, 200, {"Content-Type": "application/json"}
            elif format_type == "csv":
                csv_content = _convert_to_csv(export_data)
                return (
                    csv_content,
                    200,
                    {
                        "Content-Type": "text/csv",
                        "Content-Disposition": f"attachment; filename=easebrain-export-{datetime.utcnow().date()}.csv",
                    },
                )

        except Exception as e:
            logger.error(f"Error exporting data: {str(e)}", exc_info=True)
            return {"error": "Failed to export data", "details": str(e)}, 500


class UserDataExportResource(Resource):
    """Export individual user's personal data (GDPR-compliant)"""

    @require_admin
    def get(self, user_id):
        """Export all data for a specific user"""
        try:
            user = User.query.get_or_404(user_id)

            export_data = {
                "exportDate": datetime.utcnow().isoformat(),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "firstName": user.first_name,
                    "lastName": user.last_name,
                    "phoneNumber": user.phone_number,
                    "location": user.location,
                    "dateOfBirth": user.date_of_birth,
                    "isActive": user.is_active,
                    "createdAt": user.created_at.isoformat()
                    if hasattr(user, "created_at") and user.created_at
                    else None,
                },
                "roles": [
                    {"id": ur.role.id, "name": ur.role.name, "type": ur.role.role_type}
                    for ur in user.user_roles
                    if ur.is_active
                ],
                "caregiverConnections": _get_user_caregiver_connections(user_id),
                "dependentConnections": _get_user_dependent_connections(user_id),
            }

            return export_data, 200, {"Content-Type": "application/json"}

        except Exception as e:
            logger.error(
                f"Error exporting user {user_id} data: {str(e)}", exc_info=True
            )
            return {"error": "Failed to export user data"}, 500


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================


def _get_users_data():
    """Get all users with basic info"""
    try:
        users = User.query.all()
        return [
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "firstName": user.first_name,
                "lastName": user.last_name,
                "isActive": user.is_active,
                "roles": [ur.role.name for ur in user.user_roles if ur.is_active],
            }
            for user in users
        ]
    except Exception as e:
        logger.error(f"Error getting users data: {str(e)}")
        return []


def _get_dependents_data():
    """Get all dependent/patient relationships"""
    try:
        connections = CaregiverConnection.query.filter_by(is_active=True).all()
        dependents = []
        for conn in connections:
            dependents.append(
                {
                    "id": conn.id,
                    "patientId": conn.patient_id,
                    "patientName": f"{conn.patient.first_name} {conn.patient.last_name}".strip(),
                    "caregiverId": conn.caregiver_id,
                    "caregiverName": f"{conn.caregiver.first_name} {conn.caregiver.last_name}".strip(),
                    "relationship": conn.relationship,
                    "role": conn.role,
                    "acceptedAt": conn.accepted_at.isoformat()
                    if conn.accepted_at
                    else None,
                }
            )
        return dependents
    except Exception as e:
        logger.error(f"Error getting dependents data: {str(e)}")
        return []


def _get_tasks_data():
    """Get all tasks (if reminder model has task-like data)"""
    try:
        reminders = Reminder.query.all()
        tasks = []
        for reminder in reminders:
            tasks.append(
                {
                    "id": reminder.id,
                    "userId": reminder.user_id,
                    "category": reminder.category,
                    "type": reminder.reminder_type,
                    "frequency": reminder.frequency,
                    "isActive": reminder.is_active,
                    "createdAt": reminder.created_at.isoformat()
                    if reminder.created_at
                    else None,
                }
            )
        return tasks
    except Exception as e:
        logger.error(f"Error getting tasks data: {str(e)}")
        return []


def _get_caregivers_data():
    """Get caregiver-specific information"""
    try:
        # Get users with caregiver role type
        caregivers = (
            db.session.query(User)
            .join(UserRole, UserRole.user_id == User.id)
            .join(Role, Role.id == UserRole.role_id)
            .filter(Role.role_type == "caregiver")
            .filter(UserRole.is_active == True)
            .distinct()
            .all()
        )

        caregiver_list = []
        for caregiver in caregivers:
            dependent_count = CaregiverConnection.query.filter_by(
                caregiver_id=caregiver.id, is_active=True
            ).count()

            caregiver_list.append(
                {
                    "id": caregiver.id,
                    "username": caregiver.username,
                    "email": caregiver.email,
                    "firstName": caregiver.first_name,
                    "lastName": caregiver.last_name,
                    "dependentCount": dependent_count,
                    "isActive": caregiver.is_active,
                }
            )
        return caregiver_list
    except Exception as e:
        logger.error(f"Error getting caregivers data: {str(e)}")
        return []


def _get_reminders_data():
    """Get all reminders/tasks"""
    try:
        reminders = Reminder.query.all()
        reminder_list = []
        for reminder in reminders:
            reminder_list.append(
                {
                    "id": reminder.id,
                    "userId": reminder.user_id,
                    "category": reminder.category,
                    "type": reminder.reminder_type,
                    "frequency": reminder.frequency,
                    "isActive": reminder.is_active,
                    "createdAt": reminder.created_at.isoformat()
                    if reminder.created_at
                    else None,
                }
            )
        return reminder_list
    except Exception as e:
        logger.error(f"Error getting reminders data: {str(e)}")
        return []


def _get_user_caregiver_connections(user_id):
    """Get caregiver connections for a user (if user is a patient)"""
    try:
        connections = CaregiverConnection.query.filter_by(
            patient_id=user_id, is_active=True
        ).all()
        return [
            {
                "caregiverId": conn.caregiver_id,
                "caregiverName": f"{conn.caregiver.first_name} {conn.caregiver.last_name}".strip(),
                "relationship": conn.relationship,
                "acceptedAt": conn.accepted_at.isoformat()
                if conn.accepted_at
                else None,
            }
            for conn in connections
        ]
    except Exception as e:
        logger.error(
            f"Error getting caregiver connections for user {user_id}: {str(e)}"
        )
        return []


def _get_user_dependent_connections(user_id):
    """Get dependent connections for a user (if user is a caregiver)"""
    try:
        connections = CaregiverConnection.query.filter_by(
            caregiver_id=user_id, is_active=True
        ).all()
        return [
            {
                "patientId": conn.patient_id,
                "patientName": f"{conn.patient.first_name} {conn.patient.last_name}".strip(),
                "relationship": conn.relationship,
                "acceptedAt": conn.accepted_at.isoformat()
                if conn.accepted_at
                else None,
            }
            for conn in connections
        ]
    except Exception as e:
        logger.error(
            f"Error getting dependent connections for user {user_id}: {str(e)}"
        )
        return []


def _convert_to_csv(data):
    """Convert JSON export data to CSV format"""
    try:
        output = io.StringIO()
        writer = csv.writer(output)

        # Write summary header
        writer.writerow(["EaseBrain Data Export Report"])
        writer.writerow(["Export Date", data.get("exportDate", "")])
        writer.writerow([])

        # Write summary statistics
        if "summary" in data:
            writer.writerow(["Summary Statistics"])
            for key, value in data["summary"].items():
                writer.writerow([key, value])
            writer.writerow([])

        # Write users
        if "users" in data and data["users"]:
            writer.writerow(["Users"])
            writer.writerow(
                ["ID", "Username", "Email", "First Name", "Last Name", "Is Active"]
            )
            for user in data["users"]:
                writer.writerow(
                    [
                        user.get("id"),
                        user.get("username"),
                        user.get("email"),
                        user.get("firstName"),
                        user.get("lastName"),
                        user.get("isActive"),
                    ]
                )
            writer.writerow([])

        # Write dependents
        if "dependents" in data and data["dependents"]:
            writer.writerow(["Caregiver-Patient Relationships"])
            writer.writerow(
                ["ID", "Patient", "Caregiver", "Relationship", "Role", "Accepted Date"]
            )
            for dependent in data["dependents"]:
                writer.writerow(
                    [
                        dependent.get("id"),
                        dependent.get("patientName"),
                        dependent.get("caregiverName"),
                        dependent.get("relationship"),
                        dependent.get("role"),
                        dependent.get("acceptedAt"),
                    ]
                )
            writer.writerow([])

        # Write caregivers
        if "caregivers" in data and data["caregivers"]:
            writer.writerow(["Caregivers"])
            writer.writerow(
                [
                    "ID",
                    "Username",
                    "Email",
                    "First Name",
                    "Last Name",
                    "Dependent Count",
                ]
            )
            for caregiver in data["caregivers"]:
                writer.writerow(
                    [
                        caregiver.get("id"),
                        caregiver.get("username"),
                        caregiver.get("email"),
                        caregiver.get("firstName"),
                        caregiver.get("lastName"),
                        caregiver.get("dependentCount"),
                    ]
                )
            writer.writerow([])

        # Write reminders/tasks
        if "reminders" in data and data["reminders"]:
            writer.writerow(["Reminders/Tasks"])
            writer.writerow(
                ["ID", "User ID", "Category", "Type", "Frequency", "Is Active"]
            )
            for reminder in data["reminders"]:
                writer.writerow(
                    [
                        reminder.get("id"),
                        reminder.get("userId"),
                        reminder.get("category"),
                        reminder.get("type"),
                        reminder.get("frequency"),
                        reminder.get("isActive"),
                    ]
                )
            writer.writerow([])

        return output.getvalue()

    except Exception as e:
        logger.error(f"Error converting to CSV: {str(e)}")
        return ""
