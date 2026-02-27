const db = require('../db');
const { encrypt, decrypt } = require('../utils/encryption');
const ContentGenerator = require('../services/ContentGenerator');
const InstagramService = require('../services/InstagramService');

// Criar um novo tenant
const createTenant = async (req, res) => {
    const { business_name, niche, business_description, target_audience, tone_of_voice, main_products } = req.body;

    try {
        const result = await db.query(
            `INSERT INTO tenants (business_name, niche, business_description, target_audience, tone_of_voice, main_products) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [business_name, niche, business_description, target_audience, tone_of_voice, main_products]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating tenant:', error);
        res.status(500).json({ error: 'Internal server error while creating tenant' });
    }
};

// Obter detalhes de um tenant
const getTenant = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query('SELECT * FROM tenants WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Tenant not found' });
        }

        const tenant = result.rows[0];

        // Descriptografa a chave da API do Gemini antes de retornar (apenas se existir)
        if (tenant.gemini_api_key) {
            try {
                tenant.gemini_api_key_decrypted = decrypt(tenant.gemini_api_key);
                // Removendo o hash cifrado se não for necessário enviar para o frontend,
                // mas em alguns casos você envia a string mascarada.
            } catch (e) {
                console.error('Error decrypting key for tenant', id);
                tenant.gemini_api_key_decrypted = null;
            }
        }

        res.status(200).json(tenant);
    } catch (error) {
        console.error('Error fetching tenant:', error);
        res.status(500).json({ error: 'Internal server error while fetching tenant' });
    }
};

// Atualizar chaves de API e configurações de um tenant
const updateTenantSettings = async (req, res) => {
    const { id } = req.params;
    const {
        gemini_api_key,
        instagram_access_token,
        instagram_business_id,
        business_name,
        niche,
        business_description,
        target_audience,
        tone_of_voice,
        main_products
    } = req.body;

    try {
        // 1. Obter o registro atual para não sobrescrever com nulo o que não for enviado
        const currentResult = await db.query('SELECT * FROM tenants WHERE id = $1', [id]);
        if (currentResult.rows.length === 0) {
            return res.status(404).json({ error: 'Tenant not found' });
        }
        const currentTenant = currentResult.rows[0];

        // 2. Encriptar a nova gemini_api_key se fornecida
        let encryptedGeminiKey = currentTenant.gemini_api_key;
        if (gemini_api_key) {
            encryptedGeminiKey = encrypt(gemini_api_key);
        }

        // 3. Atualizar 
        const updateResult = await db.query(
            `UPDATE tenants 
       SET business_name = $1, 
           niche = $2, 
           business_description = $3, 
           target_audience = $4,
           gemini_api_key = $5,
           instagram_access_token = $6,
           instagram_business_id = $7,
           tone_of_voice = $8,
           main_products = $9,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10 RETURNING *`,
            [
                business_name || currentTenant.business_name,
                niche || currentTenant.niche,
                business_description || currentTenant.business_description,
                target_audience || currentTenant.target_audience,
                encryptedGeminiKey,
                instagram_access_token !== undefined ? instagram_access_token : currentTenant.instagram_access_token,
                instagram_business_id !== undefined ? instagram_business_id : currentTenant.instagram_business_id,
                tone_of_voice || currentTenant.tone_of_voice,
                main_products || currentTenant.main_products,
                id
            ]
        );

        res.status(200).json(updateResult.rows[0]);
    } catch (error) {
        console.error('Error updating tenant:', error);
        res.status(500).json({ error: 'Internal server error while updating tenant' });
    }
};

// Gerar Post (Legenda + Imagem)
const generateContent = async (req, res) => {
    const { id } = req.params;
    const { topic } = req.body;

    try {
        console.log(`[+] Gerando conteúdo para Tenant ${id} - Tópico: ${topic || 'Geral'}`);
        const result = await ContentGenerator.generatePostAndImage(id, topic);

        res.status(200).json(result);
    } catch (error) {
        console.error('Error generating content:', error.message);
        res.status(500).json({ error: 'Erro ao gerar conteúdo', details: error.message });
    }
};

// Publicar Post no Instagram
const publishPost = async (req, res) => {
    const { id } = req.params;
    const { imageUrl, caption } = req.body;

    if (!imageUrl || !caption) {
        return res.status(400).json({ error: 'A URL da Imagem e a Legenda são obrigatórias para publicar.' });
    }

    try {
        console.log(`[+] Enviando para publicação no Instagram - Tenant ${id}`);
        const result = await InstagramService.publishPost(id, imageUrl, caption);

        res.status(200).json(result);
    } catch (error) {
        console.error('Error publishing content:', error.message);
        res.status(500).json({ error: 'Erro ao publicar no Instagram', details: error.message });
    }
};

module.exports = {
    createTenant,
    getTenant,
    updateTenantSettings,
    generateContent,
    publishPost
};
