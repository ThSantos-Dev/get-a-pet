// Utilizando o mongoose
const mongoose = require('mongoose');

// Função responsável por criar a conexão com o BD
const main = async ()  => {
    await mongoose.connect('mongodb+srv://thales:5bLxQkKIlj2RL9Wo@cluster0.pd22n.mongodb.net/?retryWrites=true&w=majority')
}

// Executando a função
main()
    .then(() => console.log('Banco conectado com sucesso!✨'))
    .catch((err) => console.log(err))

// Exportando a conexão
module.exports = mongoose