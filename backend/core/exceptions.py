class BaseServiceException(Exception):
    status_code: int = 500

    def __init__(self, detail: str = "An error occurred"):
        self.detail = detail
        super().__init__(self.detail)


class ObjectNotFoundException(BaseServiceException):
    status_code = 404

    def __init__(self, detail: str = "Object not found"):
        super().__init__(detail)


class ForbiddenException(BaseServiceException):
    status_code = 403

    def __init__(self, detail: str = "Forbidden"):
        super().__init__(detail)


class BadRequestException(BaseServiceException):
    status_code = 400

    def __init__(self, detail: str = "Bad request"):
        super().__init__(detail)


class InternalServerErrorException(BaseServiceException):
    status_code = 500

    def __init__(self, detail: str = "Internal server error"):
        super().__init__(detail)


class UnprocessableEntityException(BaseServiceException):
    status_code = 422

    def __init__(self, detail: str = "Unprocessable entity"):
        super().__init__(detail)


class ConflictException(BaseServiceException):
    status_code = 409

    def __init__(self, detail: str = "Conflict"):
        super().__init__(detail)
