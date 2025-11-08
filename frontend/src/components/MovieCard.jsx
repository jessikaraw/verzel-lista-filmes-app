import React from 'react';

function MovieCard({ movie, onAddFavorite }) {
  const posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

  return (
    <div className="movie-card">
      {movie.poster_path && (
        <img src={posterUrl} alt={movie.title} />
      )}
      <div className="movie-info">
        <h3>{movie.title}</h3>
        <p className="rating">⭐ {movie.vote_average.toFixed(1)}</p>
        <button onClick={() => onAddFavorite(movie)}>
          ❤️ Favoritar
        </button>
      </div>
    </div>
  );
}

export default MovieCard;
