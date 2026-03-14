"""Small, explicit serializers used by resource endpoints.

These intentionally avoid calling model.to_dict() to prevent SQLAlchemy
lazy-loading relationships when migrations are incomplete.
"""

from datetime import datetime


def _format_datetime(val):
    if val is None:
        return None
    if isinstance(val, datetime):
        return val.isoformat()
    return str(val)


def serialize_user(user):
    return {
        "id": getattr(user, "id", None),
        "username": getattr(user, "username", None),
        "email": getattr(user, "email", None),
        "first_name": getattr(user, "first_name", None),
        "last_name": getattr(user, "last_name", None),
        "phone_number": getattr(user, "phone_number", None),
        "location": getattr(user, "location", None),
        "date_of_birth": _format_datetime(getattr(user, "date_of_birth", None)),
        "is_active": getattr(user, "is_active", None),
        "organization_id": getattr(user, "organization_id", None),
    }


def serialize_model(obj, fields):
    out = {}
    for f in fields:
        val = getattr(obj, f, None)
        if isinstance(val, datetime):
            out[f] = val.isoformat()
        else:
            out[f] = val
    return out
