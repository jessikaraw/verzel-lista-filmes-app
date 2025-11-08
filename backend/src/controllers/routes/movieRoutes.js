import express from 'express';
import {
  searchMovies,
  getFavorites,
  addFavorite,
  removeFavorite,
} from '../movieController.js';

const router = express.Router();

// Rotas de filme
router.get('/search', searchMovies);
router.get('/favorites', getFavorites);
router.post('/favorites', addFavorite);
router.delete('/favorites/:tmdb_id', removeFavorite);

export default router;
