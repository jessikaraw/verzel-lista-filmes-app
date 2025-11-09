import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import movieRoutes from './controllers/routes/movieRoutes.js'; // Caminho corrigido

// Carrega as variáveis de ambiente (TMDB_API_KEY, PORT)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors()); // Permite que o frontend acesse o backend
app.use(express.json()); // Permite que o backend entenda JSON

// Rotas principais
// Todas as rotas em movieRoutes começarão com /movies
app.use('/movies', movieRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API de Filmes rodando!' });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});