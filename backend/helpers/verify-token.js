// Objetivo: validar o token de autenticação
const jwt = require('jsonwebtoken');

// Helper
const getToken = require('./get-token')


// Middleware responsável por validar o Token 
const verifyToken = (req, res, next) => {
    // Resgatando o token
    const token = getToken(req)

    // Validação para verificar se o token foi passado corretamente
    if(!token) {
       return res.status(401).json({message: "Acesso negado!"})
    }

    try {
        // Verificando se o token é válido | Se for inválido, ele cai no catch
        const verified = jwt.verify(token, "nosso_secret")

        // Atribuindo a req os dados do usuario
        req.user = verified

        // Chamando a próxima função 
        next()
    } catch (error) {
       return res.status(400).json({message: "Token inválido!"})
    }
}

module.exports = verifyToken