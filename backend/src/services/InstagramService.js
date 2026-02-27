const axios = require('axios');
const db = require('../db');

class InstagramService {
    /**
     * Busca as credenciais Meta/Instagram do Tenant
     */
    static async getInstagramConfig(tenantId) {
        const result = await db.query('SELECT instagram_access_token, instagram_business_id FROM tenants WHERE id = $1', [tenantId]);
        if (result.rows.length === 0) {
            throw new Error('Tenant não encontrado.');
        }
        const tenant = result.rows[0];

        if (!tenant.instagram_access_token || !tenant.instagram_business_id) {
            throw new Error('As credenciais do Instagram (Access Token ou Business ID) não estão configuradas para este Tenant.');
        }

        // Aqui não criptografamos as chaves na primeira versão, mas se tivessem sido, descriptografaríamos igual a `gemini_api_key`
        return {
            accessToken: tenant.instagram_access_token,
            businessId: tenant.instagram_business_id
        };
    }

    /**
     * Publica uma foto no Instagram do Cliente.
     * @param {string} tenantId - ID do cliente
     * @param {string} imageUrl - URL Pública da Imagem a ser postada
     * @param {string} caption - Legenda do Post
     * @returns {object} Status da publicação e ID do Post no Instagram
     */
    static async publishPost(tenantId, imageUrl, caption) {
        const config = await this.getInstagramConfig(tenantId);

        // Passo 1: Criar o Container de Mídia (Upload Request)
        console.log(`[+] Criando container no Instagram Business ID: ${config.businessId}`);

        // API v19.0 (exemplo) ou 'v20.0' - Documentação Graph API
        const createContainerUrl = `https://graph.facebook.com/v19.0/${config.businessId}/media`;

        let containerResponse;
        try {
            containerResponse = await axios.post(createContainerUrl, null, {
                params: {
                    image_url: imageUrl,
                    caption: caption,
                    access_token: config.accessToken
                }
            });
        } catch (error) {
            console.error("Erro ao criar Media Container:", error.response?.data || error.message);
            throw new Error(`Falha no Instagram Graph API (/media): ${error.response?.data?.error?.message || error.message}`);
        }

        const creationId = containerResponse.data.id;
        if (!creationId) {
            throw new Error("Não foi possível obter o Creation ID do contêiner da imagem.");
        }

        console.log(`[+] Container criado! ID: ${creationId}. Solicitando publicação...`);

        // Passo 2: Publicar o Container Gerado (Publish Request)
        const publishUrl = `https://graph.facebook.com/v19.0/${config.businessId}/media_publish`;

        let publishResponse;
        try {
            publishResponse = await axios.post(publishUrl, null, {
                params: {
                    creation_id: creationId,
                    access_token: config.accessToken
                }
            });
        } catch (error) {
            console.error("Erro ao publicar Media Container:", error.response?.data || error.message);
            throw new Error(`Falha no Instagram Graph API (/media_publish): ${error.response?.data?.error?.message || error.message}`);
        }

        const postId = publishResponse.data.id;
        console.log(`[+] Publicação realizada com sucesso! ID do Post: ${postId}`);

        return {
            success: true,
            instagram_post_id: postId
        };
    }

}

module.exports = InstagramService;
