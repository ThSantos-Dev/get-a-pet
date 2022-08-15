// Importando pacote JWT
const jwt = require("jsonwebtoken");

// Função responsável por criar o token do usuario
const createUserToken = (user, req, res) => {
  // Criando token, com payload com o nome e id do usuário
  const token = jwt.sign(
    {
      _id: user._id,
      name: user.name,
    },
    "nosso_secret",
    {
      expiresIn: "7d",
    }
  );

  // Retornando o token
  res.status(200).json({ message: "Você está autenticado", token, _id: user._id });
};

module.exports = createUserToken;
