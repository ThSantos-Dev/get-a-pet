// Imports
const express = require('express');
const cors = require('cors');

// Utilizando o express
const app = express();

// Configurando a resposta para JSON
app.use(express.json())

// Resolvendo problemas de cors
app.use(cors({credentials: true, origin: 'http://localhost:3000'}))

// Pasta publica para imagens
app.use(express.static('public'))

// Rotas
const UserRoutes = require('./routes/UserRoutes')
const PetRoutes = require('./routes/PetRoutes')

app.use('/api/users', UserRoutes)
app.use('/api/pets', PetRoutes)


// Iniciando o servidor
app.listen(5000, () => console.log("API Working 🚀"))