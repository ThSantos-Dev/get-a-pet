// Importando o Model de Usuário
const User = require("../models/User");

// Importando Helpers
const createUserToken = require("../helpers/create-user-token");
const getToken = require("../helpers/get-token");
const getUserByToken = require("../helpers/get-user-by-token");

// Importando o bcrypt
const bcrypt = require("bcrypt");

// Importando o jwt
const jwt = require("jsonwebtoken");

module.exports = class UserController {
  // Método para registrar Usuário
  static async register(req, res) {
    //  Sem destructuring
    //    const name = req.body.name
    //    const email = req.body.email
    //    const password = req.body.password
    //    const phone = req.body.phone
    //    const confirmPassword = req.body.confirmPassword

    // Com destructuring
    const { name, email, phone, password, confirmPassword } = req.body;

    // Validações
    if (!name) {
      return res.status(422).json({ message: "O nome é obrigatório" });
    }
    if (!phone) {
      return res.status(422).json({ message: "O telefone é obrigatório" });
    }
    if (!email) {
      return res.status(422).json({ message: "O e-mail é obrigatório" });
    }
    if (!password) {
      return res.status(422).json({ message: "A senha é obrigatória" });
    }
    if (!confirmPassword) {
      return res
        .status(422)
        .json({ message: "A confirmação da senha é obrigatório" });
    }

    if (password !== confirmPassword) {
      return res.status(422).json({
        message: "A senha e a confirmação de senha precisam ser iguais!",
      });
    }

    // Validação para verificar se o usuário já existe
    const userExists = await User.findOne({ email });

    // Se existir, devolvemos uma mensagem de erro
    if (userExists) {
      return res.status(422).json({
        message: "Por favor, utilize outro e-mail!",
      });
    }

    // Codificando a senha antes de salvar no Banco
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Criando um objeto com os dados do usuário
    const user = new User({
      name,
      email,
      phone,
      password: passwordHash,
    });

    // Tentando salvar o usuário no Banco
    try {
      // Salvando o usuário no banco
      const newUser = await user.save();

      // Retornando uma mensagem de sucesso
      // res.status(201).json({message: "Usuário criado!", newUser})

      // Retornando o token de autenticação
      await createUserToken(newUser, req, res);
    } catch (error) {
      // Retornando uma mensagem de erro
      res.status(500).json({
        message:
          "Não foi possível cadastrar o usuário, tente novamente mais tarde.",
        error,
      });
    }
  }

  //   Método para login
  static async login(req, res) {
    // Resgatando os dados do Body
    const { email, password } = req.body;

    // Validações
    if (!email) {
      return res.status(422).json({ message: "O e-mail é obrigatório" });
    }
    if (!password) {
      return res.status(422).json({ message: "A senha é obrigatória" });
    }

    // Validação para verificar se o usuário existe
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(422)
        .json({ message: "Não há usuário cadastrado com esse e-mail" });
    }

    // Validação para verificar se a senha informada corresponde com a senha do bd
    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      return res.status(422).json({ message: "Senha inválida." });
    }

    // Retornando um token de autenticação
    await createUserToken(user, req, res);
  }

  //   Método para pegar o usuário autenticado / atual
  static async checkUser(req, res) {
    // Variável que vai receber o usuário caso o encontre
    let currentUser;

    const token = getToken(req);

    // Validação para verificar se o token foi informado
    if (token) {
      // Decodificando o token - transforma o payload em objeto
      const decoded = jwt.verify(token, "nosso_secret");

      // Buscando o usuário pelo ID
      currentUser = await User.findById(decoded._id).select("-password");
    } else {
      // Caso não haja o token nos headers, o usuáro será retornado vazio
      currentUser = null;
    }

    // Retornando o usuário com base no token
    res.status(200).json(currentUser);
  }

  //   Método para pegar usuário pelo ID
  static async getUserById(req, res) {
    // Resgatando o id do usuário dos parâmetros
    const { id } = req.params;

    // Buscando usuário pelo ID - o "-password" diz ao mongodb que eu não quero que venha a senha
    const user = await User.findById(id).select("-passwword");

    // Validação para verificar se o usuário foi encontrado
    if (!user) {
      return res.status(422).json({ message: "Usuário não encontrado!" });
    }

    // Retornando os dados do usuário encontrado
    res.status(200).json(user);
  }

  // Método para atualização do usuário
  static async editUser(req, res) {
    // Resgatando o ID dos parametros da URL
    const { id } = req.params;

    // Pegando o usuário autenticado
    const token = getToken(req);
    const user = await getUserByToken(token);

    // Validação para verificar se o usuário que solicitou a atualização é o proprietário do perfil
    if (user._id !== id)
      return res.status(204).json({ message: "Você não tem autorização." });

    // Resgatando dados do body
    const { name, email, password, phone, confirmPassword } = req.body;

    // Validação para verificar se a imagem veio
    if (req.file) {
      // Atribuindo o nome da imagem
      user.image = req.file.filename;
    }

    // Validações
    if (!email) {
      return res.status(422).json({ message: "O e-mail é obrigatório" });
    }

    // Validação para verificar se o usuário já existe
    const userExists = await User.findOne({ email });

    // Verficando se o usuario quer trocar de email e se esse email pertence a outro usuário
    if (user.email !== email && userExists) {
      return res
        .status(422)
        .json({ message: "Por favor, utilize outro email" });
    }

    // Atualizando o e-mail do usuario
    user.email = email;

    if (!name) {
      return res.status(422).json({ message: "O nome é obrigatório" });
    }

    // Atualziando o nome
    user.name = name;

    if (!phone) {
      return res.status(422).json({ message: "O telefone é obrigatório" });
    }

    // Atualizando o telefone
    user.phone = phone;

    if (password !== confirmPassword) {
      return res.status(422).json({
        message: "A senha e a confirmação de senha precisam ser iguais!",
      });
    } else if (password === confirmPassword && password != null) {
      // Criando/codificando a nova senha
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      // Atualizando a senha
      user.password = passwordHash;
    }

    try {
      // Atualizando o usuário
      await User.findOneAndUpdate(
        { _id: user._id },
        { $set: user },
        { new: true }
      );

      // Retornando uma mensagem de sucesso
      res.status(200).json({ message: "Usuário atualizado com sucesso!" });
    } catch (error) {
      // Retornando uma mensagem de erro
      return res.status(500).json({ message: error });
    }
  }
};
