import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import MovieCard from './components/MovieCard';
import FavoritesList from './components/FavoritesList';
import './App.css';

function App() {
  const [movies, setMovies] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [userId] = useState(localStorage.getItem('userId') || generateUserId());

  function generateUserId() {
    const id = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('userId', id);
    return id;
  }

  const handleSearch = async (query) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=YOUR_TMDB_KEY&query=${query}`
      );
      const data = await response.json();
      setMovies(data.results || []);
    } catch (error) {
      console.error('Erro ao buscar filmes:', error);
    }
  };

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
          }),
        }
      );
      const data = await response.json();
      setFavorites([...favorites, data]);
      alert('Filme adicionado aos favoritos!');
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
    }
  };

  const handleRemoveFavorite = async (tmdbId) => {
    try {
      await fetch(
        `${import.meta.env.VITE_API_URL}/movies/favorites/${tmdbId}`,
        {
          method: 'DELETE',
          headers: { 'X-User-ID': userId },
        }
      );
      setFavorites(favorites.filter((m) => m.tmdb_id !== tmdbId));
      alert('Filme removido dos favoritos!');
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>🎬 Lista de Filmes</h1>
        <button onClick={() => setShowFavorites(!showFavorites)}>
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
                onAddFavorite={handleAddFavorite}
              />
            ))}
          </div>
        </main>
      ) : (
        <FavoritesList
          favorites={favorites}
          onRemoveFavorite={handleRemoveFavorite}
        />
      )}
    </div>
  );
}

export default App;
