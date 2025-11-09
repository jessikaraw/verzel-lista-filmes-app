import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Configuração da Persistência (JSON) ---

// __dirname não existe em "type": "module", então o recriamos:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// O caminho correto: "suba" 1 nível (de 'controllers' para 'src'),
// depois entre em 'data' e encontre 'favorites.json'.
const DB_PATH = path.join(__dirname, '..', 'data', 'favorites.json');

// Função auxiliar para ESCREVER no banco de dados
async function writeDB(data) {
  try {
    // Garante que a pasta 'data' exista
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    // Escreve no arquivo
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Erro ao escrever no banco de dados:', error);
  }
}

// Função auxiliar para LER o banco de dados
async function readDB() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Se o arquivo não existir (ENOENT), cria um arquivo vazio e retorna {}
    if (error.code === 'ENOENT') {
      await writeDB({}); // Cria o arquivo
      return {}; // Retorna um objeto vazio
    }
    // Se for outro erro, lança o erro
    console.error('Erro ao ler o banco de dados:', error);
    throw error;
  }
}
// --- Fim da configuração de persistência ---

/**
 * Busca filmes na API do TMDb (Seguro)
 * e cruza com os favoritos do usuário.
 */
export const searchMovies = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.headers['x-user-id']; // Pega o ID do usuário

    if (!query) {
      return res.status(400).json({ error: 'Query é obrigatória' });
    }

    // 1. Busca os filmes na API do TMDb
    const response = await axios.get('https://api.themoviedb.org/3/search/movie', {
      params: {
        api_key: process.env.TMDB_API_KEY, // Chave segura
        query,
        language: 'pt-BR',
      },
    });

    // 2. Busca os favoritos do usuário no nosso JSON
    let favoriteIds = new Set();
    if (userId) {
      const favoritesStore = await readDB();
      const userFavorites = favoritesStore[userId] || [];
      favoriteIds = new Set(userFavorites.map(f => f.tmdb_id));
    }

    // 3. Adiciona a flag 'isFavorite' aos resultados da busca
    const resultsWithFavorites = response.data.results.map(movie => ({
      ...movie,
      isFavorite: favoriteIds.has(movie.id),
    }));
    
    // 4. Retorna os resultados modificados
    res.json({ ...response.data, results: resultsWithFavorites });

  } catch (error) {
    console.error('Erro ao buscar filmes:', error.message);
    res.status(500).json({ error: 'Erro ao buscar filmes' });
  }
};

/**
 * Busca os favoritos do usuário no arquivo JSON.
 */
export const getFavorites = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(400).json({ error: 'X-User-ID header é obrigatório' });
    }

    const favoritesStore = await readDB(); // Lê do arquivo
    const userFavorites = favoritesStore[userId] || [];
    res.json(userFavorites);
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    res.status(500).json({ error: 'Erro ao buscar favoritos' });
  }
};

/**
 * Adiciona um favorito ao arquivo JSON.
 */
export const addFavorite = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { tmdb_id, title, rating, poster_path } = req.body;

    if (!userId || !tmdb_id || !title) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    const favoritesStore = await readDB(); // Lê do arquivo

    if (!favoritesStore[userId]) {
      favoritesStore[userId] = [];
    }

    // Verifica se o filme já não está favoritado
    const alreadyExists = favoritesStore[userId].some(
      (m) => m.tmdb_id === tmdb_id
    );

    if (alreadyExists) {
      return res.status(409).json({ error: 'Filme já está nos favoritos' });
    }

    const favorite = {
      tmdb_id,
      title,
      rating: rating || 0,
      poster_path: poster_path || null,
      addDate: new Date(),
    };

    favoritesStore[userId].push(favorite);
    await writeDB(favoritesStore); // Escreve no arquivo

    res.status(201).json(favorite);
  } catch (error) {
    console.error('Erro ao adicionar favorito:', error);
    res.status(500).json({ error: 'Erro ao adicionar favorito' });
  }
};

/**
 * Remove um favorito do arquivo JSON.
 */
export const removeFavorite = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { tmdb_id } = req.params; // Pega o ID da URL

    if (!userId) {
      return res.status(400).json({ error: 'X-User-ID header é obrigatório' });
    }

    const favoritesStore = await readDB(); // Lê do arquivo

    if (!favoritesStore[userId]) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const initialLength = favoritesStore[userId].length;
    
    // Filtra o array, removendo o filme com o tmdb_id
    favoritesStore[userId] = favoritesStore[userId].filter(
      (m) => m.tmdb_id !== parseInt(tmdb_id, 10)
    );

    // Verifica se algo foi realmente removido
    if (favoritesStore[userId].length === initialLength) {
      return res.status(404).json({ error: 'Filme não encontrado nos favoritos' });
    }

    await writeDB(favoritesStore); // Escreve no arquivo

    res.json({ message: 'Filme removido dos favoritos' });
  } catch (error) {
    console.error('Erro ao remover favorito:', error);
    res.status(500).json({ error: 'Erro ao remover favorito' });
  }
};