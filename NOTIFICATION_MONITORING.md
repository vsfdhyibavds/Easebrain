# Notification Monitoring & Alerting System

This document describes the notification monitoring and alerting system implemented in EaseBrain.

## Overview

The notification monitoring system provides comprehensive tracking, logging, and alerting for all notification delivery events. It monitors notification success rates, failure patterns, and automatically alerts administrators when issues are detected.

## Architecture

### Components

#### 1. **NotificationMonitor** (`utils/notification_monitor.py`)
Core monitoring service that tracks all notification events.

**Capabilities:**
- Logs all notification attempts with detailed metadata
- Tracks success/failure/skipped events
- Records delivery times in milliseconds
- Categorizes errors by type
- Maintains real-time statistics
- Persistent logging to `logs/notifications.log`

**Key Methods:**
```python
log_notification_attempt(type, recipient_id, recipient_email, ...)
log_notification_success(type, recipient_id, recipient_email, delivery_time_ms, ...)
log_notification_failure(type, recipient_id, recipient_email, error_message, ...)
log_notification_skipped(type, recipient_id, reason, ...)
log_email_service_error(error_message, ...)
get_stats() -> Dict[stats]
```

#### 2. **NotificationAlertSystem** (`utils/notification_alert_system.py`)
Automated alert system that monitors statistics and sends alerts on anomalies.

**Thresholds:**
- Failure rate > 10% → Alert
- Consecutive failures > 5 → Alert
- Alert cooldown: 1 hour (prevents alert spam)
- Check interval: 5 minutes

**Alert Actions:**
- Email alerts to all admins
- In-app notifications (if system available)
- Logging to `logs/notification_alerts.log`

**Key Methods:**
```python
check_and_alert() # Check stats and send alerts if needed
start_monitoring() # Start background monitoring thread
```

#### 3. **NotificationMonitoringResource** (`resources/notification_monitoring_resource.py`)
REST API endpoints for monitoring data access.

**Endpoints:**
- `GET /admin/notifications/stats` - Current statistics
- `GET /admin/notifications/logs` - Query logs with filtering
- `GET /admin/notifications/download` - Download logs (JSON/CSV)

All endpoints require `@require_admin` authorization.

#### 4. **NotificationMonitoringDashboard** (Frontend)
React component for visualizing monitoring data.

**Features:**
- Real-time statistics display
- Charts: by type, performance, error analysis
- Log viewer with filtering
- Download logs (JSON/CSV)
- Auto-refresh capability (30s)
- Failure rate alerts

**Accessible at:** `/admin/notifications`

### Integration Points

#### Backend
1. **notification_service.py** - All notification methods now log metrics
2. **app.py** - Initializes monitoring on startup
3. **Extensions** - Uses shared database and logging infrastructure

#### Frontend
1. **Router** - `/admin/notifications` route
2. **Admin components** - Integrated in admin dashboard

## Usage

### Monitoring Statistics

#### Viewing Stats via API
```bash
curl -H "Authorization: Bearer {token}" \
  http://localhost:5000/api/admin/notifications/stats
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "timestamp": "2026-06-10T15:30:00.000000",
    "total_attempts": 150,
    "successful": 142,
    "failed": 8,
    "success_rate": 94.67,
    "failure_rate": 5.33,
    "by_type": {
      "warning_sign": 120,
      "reminder_shared": 25,
      "crisis_alert": 5
    },
    "errors": {
      "no_email": 3,
      "send_failed": 4,
      "connection_not_found": 1
    }
  }
}
```

### Querying Logs

#### Get Recent Logs
```bash
curl -H "Authorization: Bearer {token}" \
  "http://localhost:5000/api/admin/notifications/logs?limit=50"
```

#### Filter by Type
```bash
curl -H "Authorization: Bearer {token}" \
  "http://localhost:5000/api/admin/notifications/logs?type=warning_sign&limit=100"
```

#### Filter by Status
```bash
curl -H "Authorization: Bearer {token}" \
  "http://localhost:5000/api/admin/notifications/logs?status=failed&limit=100"
```

### Downloading Logs

#### JSON Format
```bash
curl -H "Authorization: Bearer {token}" \
  "http://localhost:5000/api/admin/notifications/download?format=json" \
  -o notifications_logs.json
```

#### CSV Format
```bash
curl -H "Authorization: Bearer {token}" \
  "http://localhost:5000/api/admin/notifications/download?format=csv" \
  -o notifications_logs.csv
```

### Dashboard Usage

1. Navigate to `/admin/notifications`
2. View real-time statistics in "Overview" tab
3. Query recent logs in "Logs" tab with type/status filters
4. View error details in "Errors" tab
5. Download logs for external analysis
6. Enable/disable auto-refresh (default: 30s)

## Log Format

### Notification Log (`logs/notifications.log`)

```
2026-06-10 15:30:45 - [INFO] - notification_monitor - Notification Attempt: {...json...}
2026-06-10 15:30:46 - [INFO] - notification_monitor - Notification Success: {...json...}
2026-06-10 15:30:47 - [ERROR] - notification_monitor - Notification Failure: {...json...}
```

**Log Entry Example:**
```json
{
  "timestamp": "2026-06-10T15:30:45.123456",
  "event": "notification_success",
  "type": "warning_sign",
  "status": "sent",
  "recipient_id": 42,
  "recipient_email": "caregiver@example.com",
  "delivery_time_ms": 245.67,
  "metadata": {
    "connection_id": 10,
    "severity": "high"
  }
}
```

### Alert Log (`logs/notification_alerts.log`)

```
2026-06-10 15:35:00 - [WARNING] - notification_alerts - Alert triggered: High Notification Failure Rate - Failure rate is 12.5%, exceeding threshold of 10.0%
2026-06-10 15:35:01 - [INFO] - notification_alerts - Alert sent at 2026-06-10T15:35:01.000000
```

## Alert Mechanisms

### Email Alerts
- Sent to all admin users
- Subject: `🚨 Notification System Alert: {alert_type}`
- Includes current stats and action items
- Respects 1-hour cooldown (prevents spam)

### In-App Notifications
- Prepared for admin users (requires NotificationService integration)
- Type: "alert"
- Contains detailed alert message

### Logging
- All alerts logged to `logs/notification_alerts.log`
- Includes timestamp, alert type, and context

## Configuration

### Alert Thresholds (`utils/notification_alert_system.py`)

Modify these constants to adjust alert sensitivity:

```python
FAILURE_RATE_THRESHOLD = 10.0  # Percentage (0-100)
CONSECUTIVE_FAILURES_THRESHOLD = 5  # Number of failures
CHECK_INTERVAL = 300  # Seconds (5 minutes)
ALERT_COOLDOWN = 3600  # Seconds (1 hour)
```

### Environment Variables

No specific environment variables required, but ensure:
- `SENDGRID_API_KEY` is set for email alerts
- `SENDER_EMAIL` is configured for notifications

## Troubleshooting

### No Logs Being Recorded

1. Check `logs/` directory exists
2. Verify notification methods are being called
3. Check application logs for errors

### Alerts Not Being Sent

1. Verify admin user email is configured
2. Check SendGrid API key is set
3. Review `logs/notification_alerts.log` for errors
4. Check email spam folder
5. Verify alert cooldown hasn't suppressed alerts

### High Failure Rate

1. Check caregiver email addresses are valid
2. Verify SendGrid API key is functional
3. Check network connectivity
4. Review error types in dashboard
5. Check email template generation

## Metrics & KPIs

### Key Metrics Tracked

| Metric | Purpose |
|--------|---------|
| Total Attempts | Overall notification volume |
| Success Rate | Percentage of successful deliveries |
| Failure Rate | Percentage of failed deliveries |
| By Type | Distribution across notification types |
| Error Breakdown | Common failure reasons |
| Delivery Time | Performance of email service |

### Performance Targets

- **Success Rate:** > 95%
- **Failure Rate:** < 5%
- **Average Delivery Time:** < 500ms
- **Alert Response:** Within 5 minutes of anomaly

## Best Practices

### Monitoring
1. Check dashboard daily
2. Review logs weekly
3. Archive logs monthly
4. Set up log rotation for old files

### Investigation
1. When failure rate > threshold:
   - Check recent error types
   - Verify email service status
   - Review caregiver email addresses
   - Check network connectivity

2. When crisis alerts fail:
   - Investigate immediately
   - Escalate to support team
   - Log as incident

### Maintenance
1. Keep log files within reasonable size (consider rotating)
2. Archive historical logs
3. Update alert thresholds based on patterns
4. Review and test alert delivery monthly

## Future Enhancements

- [ ] SMS notifications for critical failures
- [ ] Slack/Teams integration for alerts
- [ ] Advanced analytics (trend analysis, predictive alerts)
- [ ] Retry mechanism for failed notifications
- [ ] Notification templates with custom branding
- [ ] User-level notification preferences UI
- [ ] Delivery confirmation via webhooks (SendGrid)
- [ ] Rate limiting by recipient
- [ ] Batch notification processing
- [ ] A/B testing for email templates

## Support

For issues or questions about the notification monitoring system:
1. Check logs in `logs/notifications.log`
2. Review this documentation
3. Check dashboard for insights
4. Contact development team
