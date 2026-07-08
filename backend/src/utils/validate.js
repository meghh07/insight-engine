import { AppError } from '../errors.js';

export function assertSchema(schema, value, path = '') {
  if (schema.type === 'object') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new AppError(400, 'VALIDATION_ERROR', `Expected object at ${path || 'root'}`);
    }
    for (const key of schema.required ?? []) {
      if (!(key in value)) {
        throw new AppError(400, 'VALIDATION_ERROR', `Missing required field: ${path}${key}`);
      }
    }
    for (const [key, child] of Object.entries(schema.properties ?? {})) {
      if (key in value) assertSchema(child, value[key], `${path}${key}.`);
    }
    return;
  }

  if (schema.type === 'array') {
    if (!Array.isArray(value)) throw new AppError(400, 'VALIDATION_ERROR', `Expected array at ${path}`);
    for (const item of value) assertSchema(schema.items, item, `${path}[]`);
    return;
  }

  if (schema.type === 'string' && typeof value !== 'string') {
    throw new AppError(400, 'VALIDATION_ERROR', `Expected string at ${path}`);
  }
  if (schema.type === 'number' && typeof value !== 'number') {
    throw new AppError(400, 'VALIDATION_ERROR', `Expected number at ${path}`);
  }
  if (schema.type === 'boolean' && typeof value !== 'boolean') {
    throw new AppError(400, 'VALIDATION_ERROR', `Expected boolean at ${path}`);
  }
}
