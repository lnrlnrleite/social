-- Tabela de Tenants (Clientes do SaaS)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name VARCHAR(255) NOT NULL,
    niche VARCHAR(255),
    business_description TEXT,
    target_audience TEXT,
    tone_of_voice VARCHAR(100),
    main_products TEXT,
    gemini_api_key VARCHAR(255),
    instagram_access_token VARCHAR(255),
    instagram_business_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index para buscas mais rápidas se necessário
-- CREATE INDEX idx_tenants_business_name ON tenants(business_name);
