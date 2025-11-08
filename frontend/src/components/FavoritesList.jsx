import React, { useEffect, useState } from 'react';

function FavoritesList({ favorites, onRemoveFavorite }) {
  const [userFavorites, setUserFavorites] = useState([]);
  const [userId] = useState(localStorage.getItem('userId'));

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/movies/favorites`,
          {
            headers: { 'X-User-ID': userId },
          }
        );
        const data = await response.json();
        setUserFavorites(data);
      } catch (error) {
        console.error('Erro ao buscar favoritos:', error);
      }
    };

    fetchFavorites();
  }, [userId]);

  return (
    <div className="favorites-list">
      <h2>Meus Filmes Favoritos</h2>
      {userFavorites.length === 0 ? (
        <p>Nenhum filme favorito ainda.</p>
      ) : (
        <ul>
          {userFavorites.map((movie) => (
            <li key={movie.tmdb_id}>
              <span>{movie.title}</span>
              <span className="rating">⭐ {movie.rating}</span>
              <button onClick={() => onRemoveFavorite(movie.tmdb_id)}>
                ❌ Remover
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FavoritesList;
