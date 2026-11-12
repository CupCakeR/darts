export type ErrorStatus = 400 | 401 | 404 | 409;

export class DomainError extends Error {
  readonly status: ErrorStatus;

  constructor(code: string, status: ErrorStatus) {
    super(code);
    this.status = status;
  }
}

export const notFound = (what: string) => new DomainError(`${what}-not-found`, 404);
export const conflict = (code: string) => new DomainError(code, 409);
