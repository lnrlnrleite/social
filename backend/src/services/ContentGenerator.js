const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const db = require('../db');
const { decrypt } = require('../utils/encryption');

class ContentGenerator {

    /**
     * Busca as credenciais e contextos de um tenant.
     */
    static async getTenantConfig(tenantId) {
        const result = await db.query('SELECT * FROM tenants WHERE id = $1', [tenantId]);
        if (result.rows.length === 0) {
            throw new Error('Tenant não encontrado.');
        }
        const tenant = result.rows[0];

        if (!tenant.gemini_api_key) {
            throw new Error('A chave de API do Gemini não está configurada para este Tenant.');
        }

        // Descriptografa a chave
        const apiKey = decrypt(tenant.gemini_api_key);

        return {
            apiKey,
            businessName: tenant.business_name,
            businessDescription: tenant.business_description,
            toneOfVoice: tenant.tone_of_voice || 'Profissional',
            mainProducts: tenant.main_products || '',
            targetAudience: tenant.target_audience || ''
        };
    }

    /**
     * Gera uma legenda para post de Instagram usando o Gemini 1.5 Flash.
     */
    static async generateCaption(tenantId, topic = '') {
        const config = await this.getTenantConfig(tenantId);

        const genAI = new GoogleGenerativeAI(config.apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        let basePrompt = `Você é o social media da empresa ${config.businessName}. 
Use este contexto sobre a empresa: ${config.businessDescription}. 
Tom de voz da marca: ${config.toneOfVoice}.
Público alvo: ${config.targetAudience}.
Principais produtos/serviços: ${config.mainProducts}.

Gere um post completo para hoje focado no Instagram. 
O post deve ser atrativo, engajador, e conter emojis e algumas hashtags no final.`;

        if (topic) {
            basePrompt += `\n\nFoque o post no seguinte tópico específico: ${topic}`;
        }

        const result = await model.generateContent(basePrompt);
        const text = result.response.text();

        return text;
    }

    /**
     * Gera uma imagem baseada num prompt (ou contexto da legenda) usando o Imagen 3 
     * via API REST do Google AI Studio.
     */
    static async generateImage(tenantId, visualPrompt) {
        const config = await this.getTenantConfig(tenantId);

        // Endpoint do Imagen 3 via Generative Language API
        const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${config.apiKey}`;

        const body = {
            instances: [
                {
                    prompt: visualPrompt
                }
            ],
            parameters: {
                sampleCount: 1,
                // Opções de aspecto, como "1:1" para Instagram
                aspectRatio: "1:1"
            }
        };

        try {
            const response = await axios.post(url, body, {
                headers: { 'Content-Type': 'application/json' }
            });

            const predictions = response.data.predictions;

            if (predictions && predictions.length > 0) {
                // Retorna a string Base64 da imagem gerada
                return predictions[0].bytesBase64Encoded;
            } else {
                throw new Error('A resposta da API do Imagen 3 não conteve predições visuais válidas.');
            }
        } catch (error) {
            console.error("Erro no Imagen 3:", error.response?.data || error.message);
            throw new Error(`Falha ao gerar imagem: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    /**
     * Pipeline completo: Gera Legenda + Imagem
     */
    static async generatePostAndImage(tenantId, topic = 'Um post institucional ressaltando nossos benefícios.') {
        // 1. Gera a Legenda
        const caption = await this.generateCaption(tenantId, topic);

        // 2. Extrai ou formula um prompt visual simples para o Imagen 3 com base na empresa
        const config = await this.getTenantConfig(tenantId);

        // Pedimos pro Gemini criar o prompt base para a Imagem
        const genAI = new GoogleGenerativeAI(config.apiKey);
        const visionPromptModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const extractionPrompt = `Baseado na legenda abaixo gerada para o Instagram de uma empresa chamada ${config.businessName}, crie um único prompt de geração de imagem (em inglês, detalhado, focado em fotorealismo e alta qualidade) para enviar para uma IA geradora de imagens. Descreva a cena visualmente e o estilo da imagem. NÃO adicione nenhum outro texto na resposta, Apenas o prompt da imagem em inglês.\n\nLegenda:\n${caption}`;

        const imagePromptResponse = await visionPromptModel.generateContent(extractionPrompt);
        const visualPrompt = imagePromptResponse.response.text().trim();

        // 3. Gera a imagem
        const imageBase64 = await this.generateImage(tenantId, visualPrompt);

        return {
            caption,
            visualPrompt,
            imageBase64
        };
    }

}

module.exports = ContentGenerator;
