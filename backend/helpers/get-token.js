const getToken = (req) => {

    let token = null
 
    // Validação para verificar se o token foi informado
    if (req.headers.authorization) {
        // Resgatando o conteúdo de authorization
        const authHeader = req.headers.authorization

        // Separando o Token
        token = authHeader.split(' ')[1]
    }

    // Retornando o token
    return token

}

module.exports = getToken