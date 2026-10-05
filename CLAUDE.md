# CLAUDE.md

Hitbox is "Letterboxd for video games": browse games from IGDB, review and rate them, track played/playing/want-to-play, build and comment on lists.

## Stack

- `backend/`: Node 20+ (ESM), Express 5, Mongoose 9 on MongoDB, zod, pino, vitest + supertest. JavaScript, no TypeScript.
- `frontend/`: Next.js 16 (App Router), React 19, Tailwind 4. JavaScript, `@/` alias to `src/`.
- IGDB v4 for the game catalog, authenticated through Twitch client credentials.

## Commands

```bash
cd backend
cp .env.example .env            # the server validates env at startup and lists what's missing
npm run dev                     # API on :8000 (node --watch)
npm run lint && npm run format:check
npm test                        # unit + API tests, no database needed
MONGO_TEST_URI=mongodb://127.0.0.1:27017/hitbox-test npm test   # also the integration tests; WIPES that database

cd frontend
cp .env.example .env.local
npm run dev                     # :3000
npm run lint && npm run build
```

## Layout

`backend/src`: `app.js` builds the Express app (no `listen`, so tests import it); `index.js` connects to MongoDB, then listens. `routes/` stay thin, `schemas/` hold the zod schemas, `services/` hold logic (`game.service.js` lazy game caching, `igdbQuery.js` the only place IGDB queries are built, `stats.service.js`), `lib/` holds the logger, errors and IGDB client, `middleware/` holds auth, validation, rate limits and the error handler.

## Conventions

- Validate every request with a zod schema from `schemas/` using `validate({ body, query, params })`. Handlers read `req.valid.*`, never `req.body`/`req.query`/`req.params`.
- No try/catch in handlers. Express 5 forwards async errors to `middleware/error.js`. Throw `HttpError` helpers from `lib/errors.js` (`badRequest`, `notFound`, `conflict`) for expected failures; the frontend reads `response.data.message`.
- Never build IGDB queries by string interpolation outside `services/igdbQuery.js`.
- Never return a `User` document unfiltered. Use `.select('-password')`, and `populate('user', 'username profilePicture')` for other people's data.
- Do sorting, paging and counting in MongoDB, not in JavaScript over one page. No per-row queries in a loop; batch with `$in` or `$group`.
- Use atomic updates (`$addToSet`, `$pull`, conditional `findOneAndUpdate`) for arrays that users modify concurrently.
- The activity feed (`services/feed.service.js`) is fan-out on read: it queries reviews, lists and game statuses of followed members when asked and merges them with `mergeActivity`. There is no activity collection to keep in sync. Spoiler review text is never included.
- Public routes whose response depends on the viewer use `optionalAuth` (a bad token means anonymous), not `auth`.
- Mongoose ignores writes to `createdAt`; tests that need fixed timestamps write through `Model.collection`.
- IGDB "extras" (screenshots, trailers, similar games) are cached on the `Game` for a week; games nobody has saved get a short in-memory cache and are never created just for browsing. Image and video ids from IGDB are validated before they go into URLs.
- Recommendations: `services/recommend.js` holds the pure scoring (similarity between members, collaborative votes, genre affinity, `rank`) and is unit-tested; `recommendations.service.js` loads the data and never calls IGDB (it only reads cached `Game.extras`). Every pick carries human-readable `reasons`; keep them honest if you change the weights. Not ML on purpose: with a small catalog, explainable heuristics beat a model.
- `GET /api/games/trending` (`services/trending.service.js`) blends IGDB's "Visits" popularity with Hitbox's 7-day reviews/status changes (`scoreTrending` is pure and tested), shows only released games with covers, caches 15 minutes, and falls back to the past year's most-rated releases if IGDB popularity fails. Register static `/games/...` routes before `/:id`.
- Log with pino (`lib/logger.js`), not `console`. Never log tokens, passwords or request bodies.
- Read config from `config/env.js`, not `process.env`. Add new variables to its schema and to `.env.example`.
- Write tests with each change. Tests that need MongoDB go in `tests/integration.test.js` and seed games directly; IGDB is never called from tests.
- Keep `docs/security.md` current when security behaviour changes.

## Gotchas

- A game is addressed by local Mongo `_id` or by IGDB id (numeric). `findOrCreateGame` saves an IGDB game locally the first time anyone reviews, lists or tracks it; community ratings only exist for saved games.
- The frontend sends the JWT in `x-auth-token`, not `Authorization`.
- The frontend sends `ordering=-added` and `page_size`; the backend deliberately ignores unknown orderings and extra keys.
- IGDB has no "Action" genre; `action` maps to Fighting (4) and Hack and slash (25).
- Rate limiting and CORS assume the API may sit behind a tunnel (`trust proxy` is on).
