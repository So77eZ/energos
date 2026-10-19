from typing import Any, Optional

from core.error_codes import ErrorCode


class BaseServiceException(Exception):
    status_code: int = 500
    error_code: str = ErrorCode.INTERNAL_ERROR
    default_message: str = "An error occurred"

    def __init__(self, message: Optional[str] = None, *, extra: Optional[dict[str, Any]] = None) -> None:
        self.message = message if message is not None else type(self).default_message
        self.extra = extra or {}
        super().__init__(self.message)


class ObjectNotFoundException(BaseServiceException):
    status_code = 404
    error_code = ErrorCode.NOT_FOUND
    default_message = "Object not found"


class ForbiddenException(BaseServiceException):
    status_code = 403
    error_code = ErrorCode.FORBIDDEN
    default_message = "Forbidden"


class BadRequestException(BaseServiceException):
    status_code = 400
    error_code = ErrorCode.BAD_REQUEST
    default_message = "Bad request"


class UnauthorizedException(BaseServiceException):
    status_code = 401
    error_code = ErrorCode.UNAUTHORIZED
    default_message = "Unauthorized"


class ConflictException(BaseServiceException):
    status_code = 409
    error_code = ErrorCode.CONFLICT
    default_message = "Conflict"


class ValidationException(BaseServiceException):
    status_code = 422
    error_code = ErrorCode.VALIDATION_ERROR
    default_message = "Validation error"

    def __init__(self, default_message: Optional[str] = None, *, fields: Optional[list] = None) -> None:
        super().__init__(default_message, extra={"fields": fields or []})


class InternalServerErrorException(BaseServiceException):
    status_code = 500
    error_code = ErrorCode.INTERNAL_ERROR
    default_message = "Internal server error"


class UnprocessableEntityException(BaseServiceException):
    status_code = 422
    error_code = ErrorCode.UNPROCESSABLE_ENTITY
    default_message = "Unprocessable entity"


class ImageNotFoundException(BaseServiceException):
    status_code = 404
    error_code = ErrorCode.IMAGE_NOT_FOUND
    default_message = "Image not found"


class EnergyDrinkNotFoundException(BaseServiceException):
    status_code = 404
    error_code = ErrorCode.ENERGY_DRINK_NOT_FOUND
    default_message = "Energy drink not found"


class ReviewNotFoundException(BaseServiceException):
    status_code = 404
    error_code = ErrorCode.REVIEW_NOT_FOUND
    default_message = "Review not found"


class UserNotFoundException(BaseServiceException):
    status_code = 404
    error_code = ErrorCode.USER_NOT_FOUND
    default_message = "User not found"


class EmailAlreadyExistsException(BaseServiceException):
    status_code = 409
    error_code = ErrorCode.EMAIL_ALREADY_EXISTS
    default_message = "A user with this email already exists"


class UsernameAlreadyExistsException(BaseServiceException):
    status_code = 409
    error_code = ErrorCode.USERNAME_ALREADY_EXISTS
    default_message = "A user with this username already exists"


class InvalidPasswordException(BaseServiceException):
    status_code = 422
    error_code = ErrorCode.INVALID_PASSWORD
    default_message = "Password validation failed"


class VerifiedUserRequiredException(BaseServiceException):
    status_code = 403
    error_code = ErrorCode.VERIFIED_USER_REQUIRED
    default_message = "Verified user required"


class AdminRequiredException(BaseServiceException):
    status_code = 403
    error_code = ErrorCode.ADMIN_REQUIRED
    default_message = "Admin privileges required"


class ReviewNotOwnerException(BaseServiceException):
    status_code = 403
    error_code = ErrorCode.REVIEW_NOT_OWNER
    default_message = "You are not the owner of this review"


class ReviewAlreadyExistsException(BaseServiceException):
    status_code = 409
    error_code = ErrorCode.REVIEW_ALREADY_EXISTS
    default_message = "You have already submitted a review for this energy drink"


class ContentTooLargeException(BaseServiceException):
    status_code = 413
    error_code = ErrorCode.CONTENT_TOO_LARGE
    default_message = "Content too large"
