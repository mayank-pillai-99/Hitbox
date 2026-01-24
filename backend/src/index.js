import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Routes
import authRoutes from './routes/auth.js';
import gameRoutes from './routes/games.js';
import reviewRoutes from './routes/reviews.js';
import listRoutes from './routes/lists.js';
import userRoutes from './routes/users.js';
import gameStatusRoutes from './routes/gameStatus.js';
import commentRoutes from './routes/comments.js';
import statsRoutes from './routes/stats.js';

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/users', userRoutes);
app.use('/api/game-status', gameStatusRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/stats', statsRoutes);

// Basic route
app.get('/', (req, res) => {
    res.send('Hitbox API is running');
});

// Connect to MongoDB
connectDB();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
