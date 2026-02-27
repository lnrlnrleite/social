const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');

// Rota para criar um novo tenant
router.post('/', tenantController.createTenant);

// Rota para obter detalhes de um tenant
router.get('/:id', tenantController.getTenant);

// Rota para atualizar as configurações e chaves de API do tenant
router.put('/:id', tenantController.updateTenantSettings);

// Rota para gerar post (Legenda e Imagem via IA)
router.post('/:id/generate', tenantController.generateContent);

// Rota para publicar direto no Instagram
router.post('/:id/publish', tenantController.publishPost);

module.exports = router;
