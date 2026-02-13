#!/usr/bin/env python3
"""Debug script to check database contents."""

import sys

sys.path.insert(0, "/home/eugene/easebrain/backend-ease-brain")

from app import app, db
from models import User, CaregiverConnection

with app.app_context():
    print("=== Checking Database ===")

    # Check users
    users = User.query.all()
    print(f"\nTotal users: {len(users)}")
    for user in users:
        print(f"  - {user.id}: {user.email} ({user.first_name} {user.last_name})")

    # Check caregiver connections
    connections = CaregiverConnection.query.all()
    print(f"\nTotal caregiver connections: {len(connections)}")
    for conn in connections:
        print(f"  - Caregiver {conn.caregiver_id} -> Patient {conn.patient_id}")

    # Check specific connections for caregiver 1
    conns_for_caregiver_1 = CaregiverConnection.query.filter(
        CaregiverConnection.caregiver_id == 1, CaregiverConnection.is_active == True
    ).all()

    print(f"\nActive connections for caregiver 1: {len(conns_for_caregiver_1)}")
    for conn in conns_for_caregiver_1:
        print(f"  - {conn}")
        print(f"    Patient: {conn.patient}")
