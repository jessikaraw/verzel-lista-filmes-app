  import axios from 'axios';

  // Armazenamento mock em memória (trocar por banco de dados depois)
  const favoritesStore = {};

  export const searchMovies = async (req, res) => {
    try {
      const { query } = req.query;

      if (!query) {
        return res.status(400).json({ error: 'Query é obrigatória' });
      }

      const response = await axios.get('https://api.themoviedb.org/3/search/movie', {
        params: {
          api_key: process.env.TMDB_API_KEY,
          query,
        },
      });

      res.json(response.data);
    } catch (error) {
      console.error('Erro ao buscar filmes:', error.message);
      res.status(500).json({ error: 'Erro ao buscar filmes' });
    }
  };

  export const getFavorites = (req, res) => {
    try {
      const userId = req.headers['x-user-id'];

      if (!userId) {
        return res.status(400).json({ error: 'X-User-ID header é obrigatório' });
      }

      const userFavorites = favoritesStore[userId] || [];
      res.json(userFavorites);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar favoritos' });
    }
  };

  export const addFavorite = (req, res) => {
    try {
      const userId = req.headers['x-user-id'];
      const { tmdb_id, title, rating } = req.body;

      if (!userId || !tmdb_id || !title) {
        return res.status(400).json({ error: 'Dados incompletos' });
      }

      if (!favoritesStore[userId]) {
        favoritesStore[userId] = [];
      }

      const favorite = {
        tmdb_id,
        title,
        rating: rating || 0,
        addDate: new Date(),
      };

      favoritesStore[userId].push(favorite);
      res.status(201).json(favorite);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao adicionar favorito' });
    }
  };

  export const removeFavorite = (req, res) => {
    try {
      const userId = req.headers['x-user-id'];
      const { tmdb_id } = req.params;

      if (!userId) {
        return res.status(400).json({ error: 'X-User-ID header é obrigatório' });
      }

      if (!favoritesStore[userId]) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      favoritesStore[userId] = favoritesStore[userId].filter(
        (m) => m.tmdb_id !== parseInt(tmdb_id)
      );

      res.json({ message: 'Filme removido dos favoritos' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao remover favorito' });
    }
  };
