import type { RequestHandler } from 'express';
import type { ZodSchema } from 'zod';

export function validate(schema: ZodSchema): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({ errors: result.error.flatten().fieldErrors });
      return;
    }

    req.body = result.data;
    next();
  };
}
