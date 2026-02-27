import { useState, useEffect } from 'react';
import '../styles/Settings.css';

const SettingsForm = ({ tenantId, setTenantId }) => {
    const [formData, setFormData] = useState({
        gemini_api_key: '',
        instagram_access_token: '',
        instagram_business_id: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if (tenantId) {
            setFetching(true);
            fetch(`http://localhost:3001/api/tenants/${tenantId}`)
                .then(res => res.json())
                .then(data => {
                    if (data && !data.error) {
                        setFormData(prev => ({
                            ...prev,
                            gemini_api_key: data.gemini_api_key_decrypted || '',
                            instagram_access_token: data.instagram_access_token || '',
                            instagram_business_id: data.instagram_business_id || ''
                        }));
                    }
                })
                .catch(err => console.error("Erro ao carregar configurações:", err))
                .finally(() => setFetching(false));
        }
    }, [tenantId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            if (!tenantId) {
                throw new Error('Tenant ID não disponível. Não é possível salvar integrações.');
            }

            const url = `http://localhost:3001/api/tenants/${tenantId}`;
            const method = 'PUT';

            const payload = {
                gemini_api_key: formData.gemini_api_key,
                instagram_access_token: formData.instagram_access_token,
                instagram_business_id: formData.instagram_business_id
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Falha ao comunicar com o servidor');

            const data = await res.json();

            if (!tenantId && data.id && setTenantId) {
                setTenantId(data.id);
            }

            setStatus({ type: 'success', message: 'Configurações salvas com sucesso!' });

        } catch (err) {
            console.error(err);
            setStatus({ type: 'error', message: 'Erro ao salvar. Verifique se o backend está rodando.' });
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div className="settings-container"><p>Carregando integrações...</p></div>;
    }

    return (
        <div className="settings-container glass-panel animate-slide-up">
            <div className="settings-header">
                <h1>Integrações (APIs)</h1>
                <p className="text-muted">Conecte sua conta do Google AI (Gemini) e Meta (Instagram).</p>
            </div>

            {status.message && (
                <div className={`status-message status-${status.type}`}>
                    {status.type === 'success' ? '✓' : '⚠'} {status.message}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="settings-section">
                    <h2>Integrações & APIs</h2>
                    <p className="text-muted" style={{ marginBottom: '1.2rem', fontSize: '0.9rem' }}>
                        Suas chaves são preservadas usando criptografia AES-256 no banco de dados.
                    </p>
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label className="form-label">Google Gemini API Key</label>
                            <input
                                type="password"
                                name="gemini_api_key"
                                value={formData.gemini_api_key}
                                onChange={handleChange}
                                placeholder="AIzaSy..."
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Instagram Access Token (Meta)</label>
                            <input
                                type="password"
                                name="instagram_access_token"
                                value={formData.instagram_access_token}
                                onChange={handleChange}
                                placeholder="IGQJQ..."
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Instagram Business ID</label>
                            <input
                                type="text"
                                name="instagram_business_id"
                                value={formData.instagram_business_id}
                                onChange={handleChange}
                                placeholder="178414..."
                            />
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Salvando...' : 'Salvar Configurações'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SettingsForm;
