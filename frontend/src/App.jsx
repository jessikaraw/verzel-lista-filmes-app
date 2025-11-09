import React, { useState, useEffect } from 'react'; // Importa o useEffect
import SearchBar from './components/SearchBar';
import MovieCard from './components/MovieCard';
import FavoritesList from './components/FavoritesList';
import './App.css';

function App() {
  const [movies, setMovies] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  
  // A lógica do userId está ótima
  const [userId] = useState(localStorage.getItem('userId') || generateUserId());

  function generateUserId() {
    const id = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('userId', id);
    return id;
  }

  // (Passo 3: Carregar favoritos) - Nova função
  const fetchFavorites = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/movies/favorites`,
        {
          headers: { 'X-User-ID': userId },
        }
      );
      if (!response.ok) {
        throw new Error('Falha ao buscar favoritos');
      }
      const data = await response.json();
      setFavorites(data || []);
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
    }
  };

  // (Passo 3: Carregar favoritos) - Roda quando o app carregar
  useEffect(() => {
    if (userId) {
      fetchFavorites();
    }
  }, [userId]); // Depende do userId estar pronto

  /**
   * (Passo 1: Segurança)
   * Busca filmes do nosso backend, enviando o X-User-ID.
   */
  const handleSearch = async (query) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/movies/search?query=${query}`,
        {
          headers: {
            'X-User-ID': userId, // (Passo 4: Envia o usuário)
          },
        }
      );
      const data = await response.json();
      // O backend agora retorna 'isFavorite' em cada filme
      setMovies(data.results || []);
    } catch (error) {
      console.error('Erro ao buscar filmes:', error);
    }
  };

  /**
   * (Passo 4: UX)
   * Adiciona um favorito e atualiza os dois estados: 'movies' e 'favorites'.
   */
  const handleAddFavorite = async (movie) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/movies/favorites`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-ID': userId,
          },
          body: JSON.stringify({
            tmdb_id: movie.id,
            title: movie.title,
            rating: movie.vote_average,
            poster_path: movie.poster_path, // Envia o poster para o backend
          }),
        }
      );
      
      if (!response.ok) {
         const err = await response.json();
         throw new Error(err.error || 'Erro ao adicionar favorito');
      }

      const newFavorite = await response.json();
      
      // 1. Atualiza a lista de favoritos
      setFavorites([...favorites, newFavorite]);
      
      // 2. Atualiza a lista de busca (marcando o item como favorito)
      setMovies(prevMovies =>
        prevMovies.map(m =>
          m.id === movie.id ? { ...m, isFavorite: true } : m
        )
      );
      
      alert('Filme adicionado aos favoritos!');
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
      alert(`Erro: ${error.message}`);
    }
  };

  /**
   * (Passo 4: UX)
   * Remove um favorito e atualiza os dois estados: 'movies' e 'favorites'.
   */
  const handleRemoveFavorite = async (tmdbId) => {
    try {
      await fetch(
        `${import.meta.env.VITE_API_URL}/movies/favorites/${tmdbId}`,
        {
          method: 'DELETE',
          headers: { 'X-User-ID': userId },
        }
      );
      
      // 1. Atualiza a lista de favoritos
      setFavorites(favorites.filter((m) => m.tmdb_id !== tmdbId));
      
      // 2. Atualiza a lista de busca (desmarcando o item como favorito)
      setMovies(prevMovies =>
        prevMovies.map(m =>
          m.id === tmdbId ? { ...m, isFavorite: false } : m
        )
      );
      
      alert('Filme removido dos favoritos!');
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
    }
  };

  // (Passo 3: Sincronização)
  // Busca os favoritos toda vez que o usuário clica para ver a lista
  const handleShowFavoritesClick = () => {
    if (!showFavorites) {
      fetchFavorites();
    }
    setShowFavorites(!showFavorites);
  };

  return (
    <div className="app">
      <header>
        <h1>🎬 Lista de Filmes</h1>
        <button onClick={handleShowFavoritesClick}>
          {showFavorites ? 'Voltar à Busca' : 'Ver Favoritos'}
        </button>
      </header>

      {!showFavorites ? (
        <main>
          <SearchBar onSearch={handleSearch} />
          <div className="movies-grid">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                // (Passo 4: Passa as props novas)
                isFavorite={movie.isFavorite} 
                onAddFavorite={handleAddFavorite}
                onRemoveFavorite={handleRemoveFavorite}
              />
            ))}
          </div>
        </main>
      ) : (
        <FavoritesList
          favorites={favorites} // Passa o estado de favoritos
          onRemoveFavorite={handleRemoveFavorite}
        />
      )}
    </div>
  );
}

export default App;