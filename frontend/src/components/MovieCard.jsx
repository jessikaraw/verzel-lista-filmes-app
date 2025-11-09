import React from 'react';

/**
 * (Passo 4: UX)
 * Este componente agora recebe 'isFavorite', 'onAddFavorite' e 'onRemoveFavorite'.
 * Ele decide qual botão mostrar (Adicionar ou Remover) com base na prop 'isFavorite'.
 */
function MovieCard({ movie, isFavorite, onAddFavorite, onRemoveFavorite }) {
  
  // Garante que temos uma imagem para mostrar
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://via.placeholder.com/500x750?text=Sem+Imagem'; // Imagem placeholder

  return (
    <div className="movie-card">
      <img src={posterUrl} alt={movie.title} />
      <h3>{movie.title}</h3>
      <p>Nota TMDb: {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</p>
      
      {isFavorite ? (
        // Se é favorito, mostra o botão de REMOVER
        <button 
          className="favorite-btn remove" 
          onClick={() => onRemoveFavorite(movie.id)}
        >
          ★ Remover dos Favoritos
        </button>
      ) : (
        // Se NÃO é favorito, mostra o botão de ADICIONAR
        <button 
          className="favorite-btn add" 
          onClick={() => onAddFavorite(movie)}
        >
          ☆ Adicionar aos Favoritos
        </button>
      )}
    </div>
  );
}

export default MovieCard;