export class BadRequestError extends Error {
  messages: string | string[];
  status = 400;
  constructor(messages: string | string[]) {
    super('Bad request');
    this.messages = messages;
  }
}

export class UnauthorizedError extends Error {
  status = 401;
  constructor() {
    super('Unauthorized');
  }
}

export class ForbiddenError extends Error {
  status = 403;
  constructor() {
    super('Forbidden');
  }
}

export class NotFoundError extends Error {
  status = 404;
  constructor(message: string) {
    super(message);
  }
}

export class InternalServerError extends Error {
  status = 500;
  constructor(message: string) {
    super(message);
  }
}
