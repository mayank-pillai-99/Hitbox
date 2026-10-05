import { badRequest } from '../lib/errors.js';

// validate({ body, query, params }) parses each part with its zod schema and
// replaces it with the parsed value, so handlers only see clean, typed input.
// In Express 5 `req.query` is a getter, so parsed values are stored on `req.valid`.
export default function validate(schemas) {
    return (req, _res, next) => {
        req.valid = {};
        for (const part of ['params', 'query', 'body']) {
            if (!schemas[part]) continue;
            const result = schemas[part].safeParse(req[part] ?? {});
            if (!result.success) {
                return next(badRequest(result.error.issues[0].message));
            }
            req.valid[part] = result.data;
        }
        next();
    };
}
