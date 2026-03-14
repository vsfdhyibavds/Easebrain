"""
OpenAPI/Swagger Documentation for EaseBrain API
Provides comprehensive API documentation and endpoint specifications
"""

from flask import Blueprint, jsonify
from utils.error_responses import ERROR_CODES

swagger_bp = Blueprint("swagger", __name__)


@swagger_bp.route("/openapi.json", methods=["GET"])
def get_openapi_spec():
    """
    Returns OpenAPI 3.0.0 specification for the API
    Use with Swagger UI or Redoc for interactive documentation
    """
    return jsonify(
        {
            "openapi": "3.0.0",
            "info": {
                "title": "EaseBrain API",
                "description": "Comprehensive mental health support platform with community features",
                "version": "1.0.0",
                "contact": {
                    "name": "EaseBrain Support",
                    "email": "support@easebrain.com",
                },
                "license": {
                    "name": "Proprietary",
                    "url": "https://easebrain.com/license",
                },
            },
            "servers": [
                {
                    "url": "http://localhost:5500/api",
                    "description": "Development Server",
                },
                {
                    "url": "https://api.easebrain.com",
                    "description": "Production Server",
                },
            ],
            "paths": {
                "/health": {
                    "get": {
                        "summary": "Health Check",
                        "description": "Returns system health status and service information",
                        "tags": ["Health"],
                        "responses": {
                            "200": {
                                "description": "System is healthy",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "status": {
                                                    "type": "string",
                                                    "example": "healthy",
                                                },
                                                "timestamp": {
                                                    "type": "string",
                                                    "example": "2024-01-15T10:30:00Z",
                                                },
                                                "version": {
                                                    "type": "string",
                                                    "example": "1.0.0",
                                                },
                                                "service": {
                                                    "type": "string",
                                                    "example": "EaseBrain Backend API",
                                                },
                                                "environment": {
                                                    "type": "string",
                                                    "example": "production",
                                                },
                                                "dependencies": {
                                                    "type": "object",
                                                    "properties": {
                                                        "database": {"type": "string"},
                                                        "cache": {"type": "string"},
                                                        "email": {"type": "string"},
                                                    },
                                                },
                                            },
                                        }
                                    }
                                },
                            }
                        },
                    }
                },
                "/signup": {
                    "post": {
                        "summary": "User Registration",
                        "description": "Create a new user account",
                        "tags": ["Authentication"],
                        "requestBody": {
                            "required": True,
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "required": ["username", "email", "password"],
                                        "properties": {
                                            "username": {
                                                "type": "string",
                                                "example": "john_doe",
                                            },
                                            "email": {
                                                "type": "string",
                                                "format": "email",
                                            },
                                            "password": {
                                                "type": "string",
                                                "format": "password",
                                                "minLength": 8,
                                            },
                                            "first_name": {"type": "string"},
                                            "last_name": {"type": "string"},
                                        },
                                    }
                                }
                            },
                        },
                        "responses": {
                            "201": {"description": "User successfully created"},
                            "400": {"description": "Validation error"},
                            "409": {"description": "User already exists"},
                        },
                    }
                },
                "/login": {
                    "post": {
                        "summary": "User Login",
                        "description": "Authenticate user and return JWT token",
                        "tags": ["Authentication"],
                        "requestBody": {
                            "required": True,
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "required": ["email", "password"],
                                        "properties": {
                                            "email": {
                                                "type": "string",
                                                "format": "email",
                                            },
                                            "password": {
                                                "type": "string",
                                                "format": "password",
                                            },
                                        },
                                    }
                                }
                            },
                        },
                        "responses": {
                            "200": {
                                "description": "Login successful, returns JWT token",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "access_token": {
                                                    "type": "string",
                                                    "description": "JWT access token",
                                                },
                                                "user": {"type": "object"},
                                            },
                                        }
                                    }
                                },
                            },
                            "401": {"description": "Invalid credentials"},
                            "429": {"description": "Rate limit exceeded"},
                        },
                    }
                },
                "/me": {
                    "get": {
                        "summary": "Get Current User",
                        "description": "Get authenticated user's profile",
                        "tags": ["User"],
                        "security": [{"BearerAuth": []}],
                        "responses": {
                            "200": {"description": "User profile data"},
                            "401": {"description": "Unauthorized"},
                        },
                    }
                },
                "/messages": {
                    "get": {
                        "summary": "Get Messages",
                        "description": "Retrieve user's messages",
                        "tags": ["Messages"],
                        "security": [{"BearerAuth": []}],
                        "parameters": [
                            {
                                "name": "conversation_id",
                                "in": "query",
                                "schema": {"type": "integer"},
                                "description": "Filter by conversation ID",
                            },
                            {
                                "name": "limit",
                                "in": "query",
                                "schema": {"type": "integer", "default": 20},
                                "description": "Number of messages to return",
                            },
                        ],
                        "responses": {
                            "200": {"description": "List of messages"},
                            "401": {"description": "Unauthorized"},
                        },
                    },
                    "post": {
                        "summary": "Create Message",
                        "description": "Send a new message",
                        "tags": ["Messages"],
                        "security": [{"BearerAuth": []}],
                        "requestBody": {
                            "required": True,
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "required": ["content", "conversation_id"],
                                        "properties": {
                                            "content": {"type": "string"},
                                            "conversation_id": {"type": "integer"},
                                        },
                                    }
                                }
                            },
                        },
                        "responses": {
                            "201": {"description": "Message created successfully"},
                            "401": {"description": "Unauthorized"},
                        },
                    },
                },
                "/conversations": {
                    "get": {
                        "summary": "Get Conversations",
                        "description": "Retrieve user's conversations",
                        "tags": ["Conversations"],
                        "security": [{"BearerAuth": []}],
                        "parameters": [
                            {
                                "name": "limit",
                                "in": "query",
                                "schema": {"type": "integer", "default": 20},
                            }
                        ],
                        "responses": {
                            "200": {"description": "List of conversations"},
                            "401": {"description": "Unauthorized"},
                        },
                    }
                },
                "/reminders": {
                    "get": {
                        "summary": "Get Reminders",
                        "description": "Retrieve user's reminders",
                        "tags": ["Reminders"],
                        "security": [{"BearerAuth": []}],
                        "responses": {
                            "200": {"description": "List of reminders"},
                            "401": {"description": "Unauthorized"},
                        },
                    },
                    "post": {
                        "summary": "Create Reminder",
                        "description": "Create a new reminder",
                        "tags": ["Reminders"],
                        "security": [{"BearerAuth": []}],
                        "requestBody": {
                            "required": True,
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "required": ["title", "remind_at"],
                                        "properties": {
                                            "title": {"type": "string"},
                                            "description": {"type": "string"},
                                            "remind_at": {
                                                "type": "string",
                                                "format": "date-time",
                                            },
                                        },
                                    }
                                }
                            },
                        },
                        "responses": {
                            "201": {"description": "Reminder created"},
                            "401": {"description": "Unauthorized"},
                        },
                    },
                },
                "/admin/stats": {
                    "get": {
                        "summary": "Admin Statistics",
                        "description": "Get platform statistics (admin only)",
                        "tags": ["Admin"],
                        "security": [{"BearerAuth": []}],
                        "responses": {
                            "200": {"description": "Platform statistics"},
                            "401": {"description": "Unauthorized"},
                            "403": {"description": "Insufficient permissions"},
                        },
                    }
                },
            },
            "components": {
                "schemas": {
                    "Error": {
                        "type": "object",
                        "properties": {
                            "error": {
                                "type": "object",
                                "properties": {
                                    "code": {"type": "string"},
                                    "message": {"type": "string"},
                                    "timestamp": {
                                        "type": "string",
                                        "format": "date-time",
                                    },
                                    "details": {"type": "object"},
                                    "request_id": {"type": "string"},
                                },
                            }
                        },
                    }
                },
                "securitySchemes": {
                    "BearerAuth": {
                        "type": "http",
                        "scheme": "bearer",
                        "bearerFormat": "JWT",
                        "description": "JWT Bearer token. Obtain token from /api/login endpoint",
                    }
                },
            },
            "tags": [
                {"name": "Health", "description": "System health monitoring"},
                {
                    "name": "Authentication",
                    "description": "User signup, login, and authentication",
                },
                {"name": "User", "description": "User profile and settings"},
                {"name": "Messages", "description": "Direct messages"},
                {"name": "Conversations", "description": "Group conversations"},
                {"name": "Reminders", "description": "User reminders"},
                {"name": "Admin", "description": "Admin operations"},
            ],
        }
    )


@swagger_bp.route("/docs", methods=["GET"])
def get_docs():
    """
    Swagger UI documentation page
    Access at /api/docs
    """
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>EaseBrain API Documentation</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@3/swagger-ui.css">
    </head>
    <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@3/swagger-ui.js"></script>
        <script src="https://unpkg.com/swagger-ui-dist@3/swagger-ui-standalone-preset.js"></script>
        <script>
            const ui = SwaggerUIBundle({
                url: "/api/openapi.json",
                dom_id: '#swagger-ui',
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                layout: "BaseLayout",
                requestInterceptor: (request) => {
                    request.headers['X-Requested-With'] = 'XMLHttpRequest';
                    return request;
                }
            });
            window.ui = ui;
        </script>
    </body>
    </html>
    """


@swagger_bp.route("/error-codes", methods=["GET"])
def get_error_codes():
    """
    Returns documentation for all API error codes
    """
    return jsonify(
        {
            "error_codes": ERROR_CODES,
            "description": "All possible error codes returned by the API",
            "usage": 'Check the "code" field in error responses to determine the type of error',
        }
    )
