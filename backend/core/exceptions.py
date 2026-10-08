class BaseServiceException(Exception):
    pass


class ObjectNotFoundException(BaseServiceException):
    def __init__(self, detail: str = "Object not found"):
        self.detail = detail
        super().__init__(self.detail)


class ForbiddenException(BaseServiceException):
    def __init__(self, detail: str = "Forbidden"):
        self.detail = detail
        super().__init__(self.detail)


class BadRequestException(BaseServiceException):
    def __init__(self, detail: str = "Bad request"):
        self.detail = detail
        super().__init__(self.detail)


class InternalServerErrorException(BaseServiceException):
    def __init__(self, detail: str = "Internal server error"):
        self.detail = detail
        super().__init__(self.detail)
