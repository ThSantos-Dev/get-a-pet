// Módulo para manipular arquivos
const fs = require("fs");

// Importando o Model de Pets
const Pet = require("../models/Pet");

// Importando helpers
const getToken = require("../helpers/get-token");
const getUserByToken = require("../helpers/get-user-by-token");
const ObjectId = require("mongoose").Types.ObjectId;

// Criando e exportando a classe que manipula a model
module.exports = class PetController {
  // Criação de Pet
  static async create(req, res) {
    // Resgatando os dados do body
    const { name, age, weight, color } = req.body;

    const available = true;

    // Upload de Imagens
    // Resgatando as imagens
    const images = req.files;

    // Validações
    if (images.length == 0) {
      return res.status(422).json({ message: "A imagem é obrigatória" });
    }

    if (!name) {
      return res.status(422).json({ message: "O nome é obrigatório" });
    }
    if (!age) {
      return res.status(422).json({ message: "A idade é obrigatória" });
    }
    if (!weight) {
      return res.status(422).json({ message: "O peso é obrigatório" });
    }
    if (!color) {
      return res.status(422).json({ message: "A cor é obrigatória" });
    }

    // Resgatando o dono do pet
    const token = getToken(req);
    const user = await getUserByToken(token);

    // Criando o Pet
    const pet = new Pet({
      name,
      age,
      weight,
      color,
      available,
      images: [],
      user: {
        _id: user._id,
        name: user.name,
        image: user.image,
        phone: user.phone,
      },
    });

    // Adicionando o nome das imagens no Pet
    images.map((image) => {
      pet.images.push(image.filename);
    });

    try {
      const newPet = await pet.save();
      res.status(201).json({ message: "Pet cadastrado com sucesso", newPet });
    } catch (error) {}
  }

  // Listando todos os Pets
  static async getAll(req, res) {
    // Buscando todos os pets
    const pets = await Pet.find().sort("-createdAt");

    // Retornando os pets
    res.status(200).json(pets);
  }

  // Listando todos os Pets do usuário logado
  static async getAllUserPets(req, res) {
    // Pegando o usuário através do Token
    const token = getToken(req);
    const user = await getUserByToken(token);

    // Buscando os pets do usuário
    const pets = await Pet.find({ "user._id": user._id }).sort("created_at");

    // Retornando os pets
    res.status(200).json(pets);
  }

  // Listando os Pets que o usuário adotou
  static async getAllUserAdoptions(req, res) {
    // Pegando o usuário pelo token
    const token = getToken(req);
    const user = await getUserByToken(token);

    // Buscando os Pets que o usuário adotou
    const pets = await Pet.find({ "adopter._id": user._id }).sort("-createdAt");

    // Retornando os Pets
    res.status(200).json(pets);
  }

  // Buscando Pet pelo ID
  static async getPetById(req, res) {
    // Resgatando o Id passado pela URL
    const { id } = req.params;

    // Validando se o ID é válido
    if (!ObjectId.isValid(id)) {
      return res.status(422).json({ message: "ID inválido!" });
    }

    // Verificando se o Pet existe
    const pet = await Pet.findOne({ _id: id });

    // Validação para verificar se o Pet foi encontrado
    if (!pet) {
      return res.status(404).json(pet);
    }

    // Retornando o Pet
    res.status(200).json(pet);
  }

  // Removendo o Pet
  static async removePetById(req, res) {
    // Recuperando o id passado pela URL
    const { id } = req.params;

    // Validação para verificar se o ID informado é válido
    if (!ObjectId.isValid(id)) {
      return res.status(422).json({ message: "ID inválido" });
    }

    // Bucando o Pet pelo Id
    const pet = await Pet.findOne({ _id: id });

    // Validação para verificar se o Pet foi encontrado
    if (!pet) {
      return res.status(404).json({ message: "Pet não encontrado!" });
    }

    // Validação para verificar se o usuário logado registrou o Pet
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (pet.user._id.toString() !== user._id.toString()) {
      return res.status(401).json({ message: "Não autorizado." });
    }

    // Removendo o registro do BD
    await Pet.findByIdAndRemove(id);

    // Removendo as fotos da pasta
    pet.images.map((image) => {
      try {
        fs.unlinkSync(`./public/images/pets/${image}`);
      } catch (error) {
        console.log(error);
      }
    });

    // Retornando uma mensagem
    res.status(200).json({ message: "Pet removido com sucesso!" });
  }

  // Atualizando o Pet
  static async updatePet(req, res) {
    // Resgatando o Id do Pet passado pela URL
    const { id } = req.params;

    // Validação para verificar se o ID informado é válido
    if (!ObjectId.isValid(id)) {
      return res.status(422).json({ message: "ID inválido" });
    }

    // Validação para verificar se o Pet existe
    const pet = await Pet.findOne({ _id: id });

    if (!pet) {
      return res.status(404).json({ message: "Pet não encontrado." });
    }

    // Validação para verificar se o usuário logado registrou o Pet
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (pet.user._id.toString() !== user._id.toString()) {
      return res.status(401).json({ message: "Não autorizado." });
    }

    // Resgatando os dados do body
    const { name, age, weight, color } = req.body;

    // Resgatando as Imagens
    const images = req.files;

    // Status do Pet (adotado)
    const available = true;

    // Validações
    if (images.length == 0) {
      return res.status(422).json({ message: "A imagem é obrigatória" });
    }

    if (!name) {
      return res.status(422).json({ message: "O nome é obrigatório" });
    }
    if (!age) {
      return res.status(422).json({ message: "A idade é obrigatória" });
    }
    if (!weight) {
      return res.status(422).json({ message: "O peso é obrigatório" });
    }
    if (!color) {
      return res.status(422).json({ message: "A cor é obrigatória" });
    }

    // Objeto que contem os dados atualizados do Pet
    const updatedData = { name, age, weight, color, available, images: [] };
    images.map((image) => {
      updatedData.images.push(image.filename);
    });

    // Atualizando
    await Pet.findByIdAndUpdate(id, updatedData);

    // Retornando uma mensagem
    return res.status(200).json({ message: "Pet atualizado com sucesso!" });
  }

  // Agendando visita
  static async schedule(req, res) {
    // Recuperando o ID do Pet
    const { id } = req.params;

    // Validação para verificar se o ID informado pertence a um PET
    const pet = await Pet.findOne({ _id: ObjectId(id) });

    if (!pet) {
      return res.status(404).json({ message: "Pet não encontrado." });
    }

    // Validação para verificar se o usuário é o que cadastrou o Pet
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (pet.user._id.equals(user._id)) {
      return res.status(401).json({
        message: "Você não pode agendar uma visita com o próprio Pet.",
      });
    }

    // Validação para verificar se o usuário já agendou uma visita com o Pet
    if (pet.adopter) {
      if (pet.adopter._id.equals(user._id)) {
        return res
          .status(422)
          .json({ message: "Você já agendou uma visita para este Pet!" });
      }
    }

    // Adicionando o usuário como "adotante do Pet", simulando a visita
    pet.adopter = {
      _id: user._id,
      name: user.name,
      image: user.image,
    };

    // Atualizando os dados do Pet
    await Pet.findByIdAndUpdate(id, pet);

    res.status(200).json({
      message: `A visita foi agendada com sucesso, entre em contato com ${pet.user.name} através do telefone ${user.phone}.`,
    });
  }

  //   Concluindo a adoção do Pet
  static async concludeAdoption(req, res) {
    // Resgatando o ID do Pet
    const { id } = req.params;

    // Validação para verificar se o ID informado pertence a um PET
    const pet = await Pet.findOne({ _id: id });

    if (!pet) {
      return res.status(404).json({ message: "Pet não encontrado." });
    }

    // Validação para verificar se o usuário é o que cadastrou o Pet
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (!pet.user._id.equals(user._id)) {
      return res.status(401).json({
        message:
          "Houve um problema em processar a sua solicitação, tente novamente mais tarde!",
      });
    }

    // Removendo a disponibilidade do Pet
    pet.available = false;

    // Atualizando o Pet
    await Pet.findByIdAndUpdate(id, pet);

    // Retornando uma mensagem para o usuário
    return res
      .status(200)
      .json({
        message:
          "Parabéns, o processo de adoção do Pet foi finalizado com sucesso!",
      });
  }
};
