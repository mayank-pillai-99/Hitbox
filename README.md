# 🎮 Hitbox

A social gaming platform for tracking, reviewing, and sharing your gaming experiences. Think Letterboxd, but for video games.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?logo=mongodb)
![IGDB](https://img.shields.io/badge/IGDB-API-purple)

## ✨ Features

### Core Features
- **Game Discovery** - Browse 500K+ games from IGDB with search, filters, and sorting
- **Reviews & Ratings** - Write reviews, rate games (1-5 stars), view community ratings
- **Game Status Tracking** - Mark games as Played, Playing, or Want to Play
- **Custom Lists** - Create curated game lists with descriptions
- **User Profiles** - Public profiles with reviews, lists, and stats

### Social Features
- **Like Reviews** - Like/unlike reviews from other users
- **List Comments** - Discuss and comment on game lists
- **Members Discovery** - Browse and discover other users

### User Experience
- **Mobile Responsive** - Hamburger menu, collapsible filters, optimized layouts
- **Real-time Updates** - Instant UI updates for likes, comments, and status changes

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library
- **Axios** - API requests

### Backend
- **Node.js + Express** - REST API server
- **MongoDB + Mongoose** - Database and ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **zod, helmet, express-rate-limit, pino** - Validation, security headers, rate limiting, structured logging
- **vitest + supertest** - Tests

### External APIs
- **IGDB** - Game database (covers, metadata, ratings)

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ (22 recommended)
- MongoDB (local or Atlas)
- IGDB API credentials ([Twitch Developer console](https://dev.twitch.tv/console/apps))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/hitbox.git
cd hitbox
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env   # then fill in the values
```

The backend validates its environment at startup and exits with a list of what is missing. See `backend/.env.example` for every variable (`DB_CONNECTION_SECRET`, `JWT_SECRET`, `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`, `PORT`, `CORS_ORIGIN`, ...).

3. **Setup Frontend**
```bash
cd ../frontend
npm install
cp .env.example .env.local
```

4. **Run the Application**

Backend (port 8000):
```bash
cd backend
npm run dev
```

Frontend (new terminal):
```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000`

## ✅ Quality checks

```bash
cd backend
npm run lint && npm run format:check
npm test                                   # unit and API tests, no database needed
MONGO_TEST_URI=mongodb://127.0.0.1:27017/hitbox-test npm test   # adds the MongoDB integration tests (wipes that database)

cd ../frontend
npm run lint && npm run build
```

CI runs all of these on every push. The security decisions are written up in [docs/security.md](docs/security.md).

## 📁 Project Structure

```
hitbox/
├── backend/
│   ├── src/
│   │   ├── config/         # Environment validation (zod), database connection
│   │   ├── lib/            # Logger, errors, IGDB client, IGDB-to-app mapper
│   │   ├── middleware/     # Auth, validation, rate limits, error handler
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Thin route handlers
│   │   ├── schemas/        # zod schemas for every request
│   │   ├── services/       # Game lookup/caching, IGDB query builder, stats
│   │   ├── app.js          # Express app (no listen, so tests can import it)
│   │   └── index.js        # Entry point
│   ├── tests/              # vitest + supertest
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js pages
│   │   ├── components/     # Reusable components
│   │   ├── context/        # Auth and toast contexts
│   │   └── utils/          # API client
│   └── package.json
│
├── docs/security.md
└── README.md
```

## 🔌 API Endpoints

Authenticated routes expect the JWT in an `x-auth-token` header. Errors are JSON: `{ "message": "..." }`.

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout (the client discards its token) |
| GET | `/api/auth/me` | Get current user and stats |
| PUT | `/api/auth/me` | Update profile |

### Games
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/games` | Browse and search games (`search`, `ordering`, `genres`, `platforms`, `dates`, `page`) |
| GET | `/api/games/:id` | Game details (local id or IGDB id) |
| GET | `/api/games/:id/stats` | Rating histogram, average and played/playing/want-to-play counts |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reviews/recent` | Latest reviews |
| GET | `/api/reviews/my` | Your reviews |
| GET | `/api/reviews/game/:id` | Get game reviews (`sort=recent|liked`) |
| POST | `/api/reviews` | Create review |
| PUT | `/api/reviews/:id` | Update review |
| DELETE | `/api/reviews/:id` | Delete review |
| POST | `/api/reviews/:id/like` | Like review |
| DELETE | `/api/reviews/:id/like` | Unlike review |

### Lists
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/lists/discover` | Browse lists (`sort=popular|recent`) |
| GET | `/api/lists` | Your lists |
| GET | `/api/lists/:id` | List details |
| POST | `/api/lists` | Create list |
| PUT | `/api/lists/:id` | Update list |
| DELETE | `/api/lists/:id` | Delete list and its comments |
| POST | `/api/lists/:id/add` | Add a game |
| DELETE | `/api/lists/:id/game/:gameId` | Remove a game |

### Game status
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/game-status` | Your games grouped by status |
| GET | `/api/game-status/counts` | Counts per status |
| GET | `/api/game-status/game/:id` | Your status for one game |
| POST | `/api/game-status` | Set status (`played`, `playing`, `want_to_play`) |
| DELETE | `/api/game-status/:id` | Clear status |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/comments/list/:id` | Get list comments |
| POST | `/api/comments/list/:id` | Add comment |
| DELETE | `/api/comments/:id` | Delete comment |

### Users and stats
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Members directory |
| GET | `/api/users/:username` | Public profile |
| GET | `/api/users/:username/reviews` | A member's reviews |
| GET | `/api/users/:username/lists` | A member's lists |
| POST | `/api/users/:username/follow` | Follow a member |
| DELETE | `/api/users/:username/follow` | Unfollow |
| GET | `/api/users/:username/followers` | A member's followers |
| GET | `/api/users/:username/following` | Who a member follows |
| GET | `/api/feed` | Activity feed from members you follow (`before`, `limit`) |
| GET | `/api/stats` | Site-wide counts |
| GET | `/health` | Liveness check |

## 📸 Screenshots

> Add screenshots of your application here

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is for educational purposes.

---

Built with 💚 by Mayank Pillai
