// Importando o módulo de Rotas do Express
const router = require('express').Router()

// Import da controller
const UserController = require('../controllers/UserController')

// Middlewares
const verifyToken = require('../helpers/verify-token')
const { imageUpload } = require('../helpers/image-upload')

// Rotas do usuário
router.post('/register', UserController.register)
router.post('/login', UserController.login)

router.get('/checkuser', UserController.checkUser)
router.get('/:id', UserController.getUserById)

// Rotas privadas
router.put('/edit/:id', verifyToken, imageUpload.single("image"), UserController.editUser)

// Exportando as configurações das rotas
module.exports = router