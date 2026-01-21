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

### External APIs
- **IGDB** - Game database (covers, metadata, ratings)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- IGDB API credentials (Twitch Developer)

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
```

Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hitbox
JWT_SECRET=your_jwt_secret
TWITCH_CLIENT_ID=your_twitch_client_id
TWITCH_CLIENT_SECRET=your_twitch_client_secret
```

3. **Setup Frontend**
```bash
cd ../frontend
npm install
```

Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. **Run the Application**

Backend:
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

## 📁 Project Structure

```
hitbox/
├── backend/
│   ├── src/
│   │   ├── config/         # Database config
│   │   ├── middleware/     # Auth middleware
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── utils/          # IGDB, mappers
│   │   └── index.js        # Entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js pages
│   │   ├── components/     # Reusable components
│   │   ├── context/        # Auth context
│   │   └── utils/          # API utility
│   └── package.json
│
└── README.md
```

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Games
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/games` | Browse games |
| GET | `/api/games/:id` | Game details |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reviews/game/:id` | Get game reviews |
| POST | `/api/reviews` | Create review |
| PUT | `/api/reviews/:id` | Update review |
| DELETE | `/api/reviews/:id` | Delete review |
| POST | `/api/reviews/:id/like` | Like review |
| DELETE | `/api/reviews/:id/like` | Unlike review |

### Lists
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/lists/discover` | Browse lists |
| GET | `/api/lists/:id` | List details |
| POST | `/api/lists` | Create list |
| PUT | `/api/lists/:id` | Update list |
| DELETE | `/api/lists/:id` | Delete list |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/comments/list/:id` | Get list comments |
| POST | `/api/comments/list/:id` | Add comment |
| DELETE | `/api/comments/:id` | Delete comment |

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
