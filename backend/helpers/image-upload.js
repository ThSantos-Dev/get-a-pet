// Objetivo: configuração de upload de imagem
const multer = require('multer');
const path = require('path');
const { v4: uuid } = require('uuid')

// Configurando o destino das imagens
const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Variável que vai receber a pasta de destino para as imagens
        let folder = ""

        // Verificando qual a URL da requisição
        if (req.baseUrl.includes("users"))
            folder = "users"
        else if (req.baseUrl.includes("pets"))
            folder = "pets"

        // Apontando para o multer a pasta de destino para as imagens
        cb(null, `public/images/${folder}/`)
    },
    filename: (req, file, cb) => {
        // Renomeando o arquvio antes de salvar
        const fileName = uuid(Date.now() + file.originalname) + path.extname(file.originalname);

        console.log(fileName)

        // Definindo o nome do arquivo
        cb(null, fileName)
    }
})

// Instancia do multer para upload de imagens
const imageUpload = multer({
    storage: imageStorage,
    // Função que filtra os tipos de imagens permitidas
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/))
            return cb(new Error('Por favor, evie apenas jpg ou png!'))

        // O tratamento ja foi feito
        cb(undefined, true)
    }
})

module.exports = { imageUpload }


