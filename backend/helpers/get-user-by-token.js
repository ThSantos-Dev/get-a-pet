// Objetivo: resgatar o usuário com base no Token

const jwt = require('jsonwebtoken')

// Model
const User = require('../models/User')

// Resgatando o usuário com base no token
const getUserByToken = async (token) => {

    // Validação para verificar se o token foi passado corretamente
    if (!token) {
        return res.status(401).json({ message: "Acesso negado!" })
    }

    // Decodificando o Token
    const decoded = jwt.verify(token, "nosso_secret")

    // Pegando o ID presente no token
    const userId = decoded._id

    // Buscando o usuário com base no ID
    const user = await User.findOne({ _id: userId })

    // Retornando o usuário encontrado
    return user
}

module.exports = getUserByToken