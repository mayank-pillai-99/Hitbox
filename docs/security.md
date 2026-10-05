# Security notes

What the backend does about the usual web-app risks, and what it leaves open.

## Handled

| Risk | What Hitbox does |
|------|------------------|
| NoSQL injection | Every request body, query and param is parsed with a zod schema (`backend/src/schemas`) before a handler runs. A login body such as `{"email": {"$ne": null}}` is rejected because the fields must be strings. Ids must be 24-character hex or positive integers. |
| IGDB query injection | All IGDB queries are built in `services/igdbQuery.js`. Search text is quoted and escaped, genres and platforms come from allow-lists, and IGDB ids must be positive integers. |
| Credential leaks | Responses never include `password`. Public profiles and member cards also omit `email`. Removing a game from a list used to return the owner's full user document, password hash included; it now returns only `username` and `profilePicture`. Logs redact `x-auth-token`, `authorization` and `password`. |
| Brute force | `/api/auth/*` is limited to 30 requests per 15 minutes per IP, `/api/games` to 60 per minute (it spends IGDB quota), everything else to 300 per minute. |
| Weak configuration | `config/env.js` refuses to start without a database URL, Twitch credentials and a `JWT_SECRET`. In production `CORS_ORIGIN` is required and `JWT_SECRET` must be at least 16 characters. |
| Cross-origin abuse | CORS is an allow-list from `CORS_ORIGIN`. Outside production an empty value allows any origin, for tunnels and local testing. |
| Browser attacks | `helmet` sets security headers. JSON bodies are capped at 100 KB. Profile pictures must be `http(s)` URLs, so `javascript:` URLs are rejected. |
| Account probing | Login returns the same message for an unknown email and a wrong password. |
| Lost updates | Likes use `$addToSet` and `$pull`, and adding a game to a list is a conditional update, so simultaneous requests can't overwrite each other or add duplicates. |
| Information leaks in errors | Unexpected errors return a generic message; the stack goes to the log only. |

## Known gaps

- **Tokens live in `localStorage`.** Any XSS bug would expose them. Moving to an httpOnly cookie means adding CSRF protection; not done.
- **No refresh tokens or revocation.** Tokens last `JWT_EXPIRES_IN` (7 days by default), and logout only deletes the client's copy.
- **Emails are matched case-sensitively**, so `A@x.com` and `a@x.com` can be separate accounts. Normalising needs a migration of existing users.
- **Rate limits are in memory**, per server process. Running several instances needs a shared store.
- **No email verification or password reset.**
- **Remote images** (covers, avatars) load from any host the user supplies, via plain `<img>` tags.
