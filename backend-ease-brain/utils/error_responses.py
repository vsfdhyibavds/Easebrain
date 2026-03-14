"""
Structured Error Response Framework
Provides consistent error formatting and error codes across API
"""

from flask import jsonify
from datetime import datetime


class APIError(Exception):
    """Base API error class"""

    def __init__(self, message, error_code, status_code=400, details=None):
        """
        Initialize API error

        Args:
            message: Human-readable error message
            error_code: Machine-readable error code
            status_code: HTTP status code
            details: Additional error details
        """
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class ValidationError(APIError):
    """Input validation error"""

    def __init__(self, message, details=None):
        super().__init__(message, "VALIDATION_ERROR", 400, details)


class AuthenticationError(APIError):
    """Authentication failed"""

    def __init__(self, message="Authentication failed", details=None):
        super().__init__(message, "AUTHENTICATION_ERROR", 401, details)


class AuthorizationError(APIError):
    """Authorization failed (insufficient permissions)"""

    def __init__(self, message="Insufficient permissions", details=None):
        super().__init__(message, "AUTHORIZATION_ERROR", 403, details)


class NotFoundError(APIError):
    """Resource not found"""

    def __init__(self, message, resource_type=None):
        details = {"resource_type": resource_type} if resource_type else {}
        super().__init__(message, "NOT_FOUND_ERROR", 404, details)


class ConflictError(APIError):
    """Resource conflict (duplicate, etc.)"""

    def __init__(self, message, details=None):
        super().__init__(message, "CONFLICT_ERROR", 409, details)


class RateLimitError(APIError):
    """Rate limit exceeded"""

    def __init__(self, message="Rate limit exceeded", retry_after=None):
        details = {"retry_after": retry_after} if retry_after else {}
        super().__init__(message, "RATE_LIMIT_ERROR", 429, details)


class InternalServerError(APIError):
    """Internal server error"""

    def __init__(self, message="Internal server error", details=None):
        super().__init__(message, "INTERNAL_SERVER_ERROR", 500, details)


def format_error_response(
    error_code, message, status_code=400, details=None, request_id=None
):
    """
    Format error response

    Args:
        error_code: Machine-readable error code
        message: Human-readable error message
        status_code: HTTP status code
        details: Additional error details
        request_id: Unique request identifier for debugging

    Returns:
        Tuple of (JSON response, HTTP status code)
    """
    response = {
        "error": {
            "code": error_code,
            "message": message,
            "timestamp": datetime.utcnow().isoformat(),
        }
    }

    if details:
        response["error"]["details"] = details

    if request_id:
        response["error"]["request_id"] = request_id

    return jsonify(response), status_code


def handle_api_error(error):
    """
    Error handler for APIError exceptions

    Args:
        error: APIError instance

    Returns:
        Tuple of (JSON response, HTTP status code)
    """
    return format_error_response(
        error.error_code, error.message, error.status_code, error.details
    )


def handle_validation_error(error):
    """Handle validation errors"""
    details = {}
    if hasattr(error, "messages"):
        details["validation_errors"] = error.messages
    return format_error_response("VALIDATION_ERROR", str(error), 400, details)


def handle_unauthorized(error):
    """Handle 401 Unauthorized"""
    return format_error_response("AUTHENTICATION_ERROR", "Authentication required", 401)


def handle_forbidden(error):
    """Handle 403 Forbidden"""
    return format_error_response("AUTHORIZATION_ERROR", "Insufficient permissions", 403)


def handle_not_found(error):
    """Handle 404 Not Found"""
    return format_error_response("NOT_FOUND_ERROR", "Resource not found", 404)


def handle_method_not_allowed(error):
    """Handle 405 Method Not Allowed"""
    return format_error_response("METHOD_NOT_ALLOWED", "HTTP method not allowed", 405)


def handle_internal_error(error):
    """Handle 500 Internal Server Error"""
    import logging

    logging.error(f"Unhandled exception: {error}", exc_info=True)
    return format_error_response(
        "INTERNAL_SERVER_ERROR",
        "An unexpected error occurred",
        500,
        {"support": "Contact support if problem persists"},
    )


# Error code reference for API documentation
ERROR_CODES = {
    "VALIDATION_ERROR": {
        "description": "Input validation failed",
        "status_code": 400,
        "example": "Email address is invalid",
    },
    "AUTHENTICATION_ERROR": {
        "description": "Authentication failed or credentials invalid",
        "status_code": 401,
        "example": "Invalid username or password",
    },
    "AUTHORIZATION_ERROR": {
        "description": "User lacks required permissions",
        "status_code": 403,
        "example": "Only administrators can access this resource",
    },
    "NOT_FOUND_ERROR": {
        "description": "Requested resource does not exist",
        "status_code": 404,
        "example": "User with ID 123 not found",
    },
    "CONFLICT_ERROR": {
        "description": "Resource conflict (duplicate, state conflict)",
        "status_code": 409,
        "example": "User with this email already exists",
    },
    "RATE_LIMIT_ERROR": {
        "description": "Rate limit exceeded",
        "status_code": 429,
        "example": "Too many login attempts. Try again later.",
    },
    "INTERNAL_SERVER_ERROR": {
        "description": "Unexpected server error",
        "status_code": 500,
        "example": "Database connection failed",
    },
}
