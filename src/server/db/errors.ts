export class DbError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = 'DbError';
    this.code = code;
  }
}

export class UniqueViolationError extends DbError {
  constructor(message = 'Unique constraint violated') {
    super(message, '23505');
    this.name = 'UniqueViolationError';
  }
}

export class ForeignKeyViolationError extends DbError {
  constructor(message = 'Foreign key constraint violated') {
    super(message, '23503');
    this.name = 'ForeignKeyViolationError';
  }
}

export class SerializationFailureError extends DbError {
  constructor(message = 'Transaction serialization failure') {
    super(message, '40001');
    this.name = 'SerializationFailureError';
  }
}

export function mapPgError(err: any): DbError {
  switch (err?.code) {
    case '23505':
      return new UniqueViolationError(err.detail || err.message);
    case '23503':
      return new ForeignKeyViolationError(err.detail || err.message);
    case '40001':
      return new SerializationFailureError(err.detail || err.message);
    default:
      return new DbError(err?.message || 'Database error', err?.code);
  }
}