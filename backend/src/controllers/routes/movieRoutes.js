import express from 'express';
import {
  searchMovies,
  getFavorites,
  addFavorite,
  removeFavorite,
} from '../movieController.js'; // Importa do arquivo ao lado (dentro de /controllers)

const router = express.Router();

// Rota para buscar filmes
// GET /movies/search?query=...
router.get('/search', searchMovies);

// Rota para buscar favoritos de um usuário
// GET /movies/favorites
router.get('/favorites', getFavorites);

// Rota para adicionar um favorito
// POST /movies/favorites
router.post('/favorites', addFavorite);

// Rota para remover um favorito
// DELETE /movies/favorites/12345 (onde 12345 é o tmdb_id)
router.delete('/favorites/:tmdb_id', removeFavorite);

export default router;