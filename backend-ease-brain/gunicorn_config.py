"""Gunicorn configuration for production deployment on Render."""

import os
import multiprocessing

# Server socket
bind = f"0.0.0.0:{os.environ.get('PORT', 5000)}"

# Worker processes - use 2-4 workers to handle concurrent requests
# Render free tier: use CPU count, standard tier: 2 * CPU count + 1
workers = int(os.environ.get("WEB_CONCURRENCY", multiprocessing.cpu_count()))

# Worker class (sync is good for Flask)
worker_class = "sync"

# Worker timeout (30 seconds)
timeout = 30

# Keep-alive timeout
keepalive = 2

# Max requests before worker restart (prevents memory leaks)
max_requests = 1000
max_requests_jitter = 50

# Server mechanics
daemon = False
pidfile = None
umask = 0
user = None
group = None
tmp_upload_dir = None

# Logging
accesslog = "-"  # Log to stdout
errorlog = "-"  # Log to stderr
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Process naming
proc_name = "easebrain-backend"

# SSL configuration (handled by Render/reverse proxy)
# No need to configure SSL here - Render handles it at the edge

# Application settings
raw_env = []
