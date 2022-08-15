// Instaciando Router do Express
const router = require("express").Router();

// Importando a Controller
const PetController = require("../controllers/PetController");

// Importando Middlwares
const verifyToken = require("../helpers/verify-token");
const { imageUpload } = require("../helpers/image-upload");

// Rotas de Pets - Privadas
router.post(
  "/create",
  verifyToken,
  imageUpload.array("images"),
  PetController.create
);
router.get("/mypets", verifyToken, PetController.getAllUserPets);
router.get("/myadoptions", verifyToken, PetController.getAllUserAdoptions);
router.delete("/:id", verifyToken, PetController.removePetById);
router.put(
  "/:id",
  verifyToken,
  imageUpload.array("images"),
  PetController.updatePet
);
router.put("/schedule/:id", verifyToken, PetController.schedule);
router.put("/conclude/:id", verifyToken, PetController.concludeAdoption);
// Rotas de Pets - Públicas
router.get("/", PetController.getAll);
router.get("/:id", PetController.getPetById);

// Exportando as rotas
module.exports = router;
