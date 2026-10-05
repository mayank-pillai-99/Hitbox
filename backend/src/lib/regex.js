// Escapes text so it matches literally inside a RegExp. Search terms come from users, and an
// unescaped "(" or "*" would either throw or change what the pattern matches.
export const escapeRegex = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Case-insensitive "contains" and "starts with" patterns for MongoDB queries.
export const containsPattern = (text) => new RegExp(escapeRegex(text), 'i');
export const prefixPattern = (text) => new RegExp(`^${escapeRegex(text)}`, 'i');
