"""
Notification Monitoring API Resource
Provides endpoints to view notification statistics and logs
"""

from flask_restful import Resource
from flask import request, send_file
import json
import io
from datetime import datetime
from utils.notification_monitor import get_notification_monitor
from utils.auth_helpers import require_admin


class NotificationStatsResource(Resource):
    """Get notification statistics and metrics"""

    @require_admin
    def get(self):
        """Get current notification statistics"""
        try:
            monitor = get_notification_monitor()
            stats = monitor.get_stats()

            return {"status": "success", "data": stats}, 200
        except Exception as e:
            return {"status": "error", "message": str(e)}, 500


class NotificationLogsResource(Resource):
    """Get notification logs with filtering"""

    parser = None

    @require_admin
    def get(self):
        """
        Get notification logs
        Query parameters:
            - limit: Number of lines to return (default: 100)
            - type: Filter by notification type (warning_sign, reminder_shared, crisis_alert)
            - status: Filter by status (sent, failed, skipped)
        """
        try:
            limit = request.args.get("limit", 100, type=int)
            notification_type = request.args.get("type", None)
            status = request.args.get("status", None)

            # Read notifications log file
            log_file = "logs/notifications.log"
            logs = []

            try:
                with open(log_file, "r") as f:
                    lines = f.readlines()
                    # Get last N lines
                    lines = lines[-limit:] if len(lines) > limit else lines

                    for line in lines:
                        try:
                            # Parse JSON log entry
                            if ": " in line:
                                json_part = line.split(": ", 1)[1]
                                entry = json.loads(json_part)

                                # Apply filters
                                if (
                                    notification_type
                                    and entry.get("type") != notification_type
                                ):
                                    continue
                                if status and entry.get("status") != status:
                                    continue

                                logs.append(entry)
                        except (json.JSONDecodeError, ValueError):
                            # Skip malformed lines
                            continue
            except FileNotFoundError:
                logs = []

            return {
                "status": "success",
                "total": len(logs),
                "limit": limit,
                "filters": {"type": notification_type, "status": status},
                "data": logs,
            }, 200
        except Exception as e:
            return {"status": "error", "message": str(e)}, 500


class NotificationDownloadResource(Resource):
    """Download notification logs as CSV or JSON"""

    @require_admin
    def get(self):
        """
        Download notification logs
        Query parameters:
            - format: 'csv' or 'json' (default: 'json')
        """
        try:
            format_type = request.args.get("format", "json").lower()

            # Read notifications log file
            log_file = "logs/notifications.log"
            logs = []

            try:
                with open(log_file, "r") as f:
                    for line in f.readlines():
                        try:
                            if ": " in line:
                                json_part = line.split(": ", 1)[1]
                                entry = json.loads(json_part)
                                logs.append(entry)
                        except (json.JSONDecodeError, ValueError):
                            continue
            except FileNotFoundError:
                logs = []

            if format_type == "json":
                # Return as JSON file
                output = io.BytesIO()
                json_data = json.dumps(logs, indent=2).encode("utf-8")
                output.write(json_data)
                output.seek(0)

                return send_file(
                    output,
                    mimetype="application/json",
                    as_attachment=True,
                    download_name=f"notification_logs_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json",
                )
            elif format_type == "csv":
                # Convert to CSV
                import csv

                output = io.StringIO()

                if logs:
                    fieldnames = set()
                    for log in logs:
                        fieldnames.update(log.keys())
                    fieldnames = sorted(list(fieldnames))

                    writer = csv.DictWriter(output, fieldnames=fieldnames)
                    writer.writeheader()

                    for log in logs:
                        row = {key: log.get(key, "") for key in fieldnames}
                        # Convert complex types to JSON strings
                        for key, value in row.items():
                            if isinstance(value, (dict, list)):
                                row[key] = json.dumps(value)
                        writer.writerow(row)

                csv_bytes = io.BytesIO(output.getvalue().encode("utf-8"))
                csv_bytes.seek(0)

                return send_file(
                    csv_bytes,
                    mimetype="text/csv",
                    as_attachment=True,
                    download_name=f"notification_logs_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv",
                )
            else:
                return {
                    "status": "error",
                    "message": "Invalid format. Use 'json' or 'csv'",
                }, 400
        except Exception as e:
            return {"status": "error", "message": str(e)}, 500
