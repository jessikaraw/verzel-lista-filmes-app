import React from 'react';

/**
 * Lista os filmes que estão no estado 'favorites' de App.jsx
 * O backend agora salva 'tmdb_id' e 'poster_path', então usamos esses dados.
 */
function FavoritesList({ favorites, onRemoveFavorite }) {
  return (
    <main className="favorites-list">
      <h2>Meus Favoritos</h2>
      {favorites.length === 0 ? (
        <p>Você ainda não tem filmes favoritos.</p>
      ) : (
        <div className="movies-grid">
          {favorites.map((movie) => {
            
            // Usa os dados salvos no nosso banco (poster_path, tmdb_id, title, rating)
            const posterUrl = movie.poster_path
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : 'https://via.placeholder.com/500x750?text=Sem+Imagem';
              
            return (
              <div key={movie.tmdb_id} className="movie-card">
                <img src={posterUrl} alt={movie.title} />
                <h3>{movie.title}</h3>
                <p>Nota TMDb: {movie.rating ? movie.rating.toFixed(1) : 'N/A'}</p>
                <button 
                  className="favorite-btn remove"
                  onClick={() => onRemoveFavorite(movie.tmdb_id)}
                >
                  ★ Remover dos Favoritos
                </button>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default FavoritesList;