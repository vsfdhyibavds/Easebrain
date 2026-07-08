#!/usr/bin/env python
"""Quick test of the roles endpoint"""
import json
from app import app

with app.test_client() as client:
    response = client.get('/api/roles')
    print(f'Status: {response.status_code}')
    print('Response:')
    print(json.dumps(response.get_json(), indent=2))
