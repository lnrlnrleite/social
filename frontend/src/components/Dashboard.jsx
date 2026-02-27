import { useState, useEffect } from 'react';
import '../styles/Dashboard.css';

const TONES = [
    { id: 'professional', label: 'Profissional' },
    { id: 'relaxed', label: 'Descontraído' },
    { id: 'salesman', label: 'Vendedor' },
    { id: 'informative', label: 'Informativo' },
    { id: 'friendly', label: 'Amigável' }
];

const Dashboard = ({ tenantId, setTenantId }) => {
    const [formData, setFormData] = useState({
        business_name: '',
        niche: '',
        business_description: '',
        target_audience: '',
        tone_of_voice: 'professional',
        main_products: ''
    });

    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    // Se já houver um tenantId, carrega os dados dele
    useEffect(() => {
        if (tenantId) {
            setFetching(true);
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
            fetch(`${apiUrl}/tenants/${tenantId}`)
                .then(res => res.json())
                .then(data => {
                    if (data && !data.error) {
                        setFormData(prev => ({
                            ...prev,
                            business_name: data.business_name || '',
                            niche: data.niche || '',
                            business_description: data.business_description || '',
                            target_audience: data.target_audience || '',
                            tone_of_voice: data.tone_of_voice || 'professional',
                            main_products: data.main_products || ''
                        }));
                    }
                })
                .catch(err => console.error("Erro ao carregar tenant:", err))
                .finally(() => setFetching(false));
        }
    }, [tenantId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleToneSelect = (toneId) => {
        setFormData({ ...formData, tone_of_voice: toneId });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
            let url = `${apiUrl}/tenants`;
            let method = 'POST';

            if (tenantId) {
                url = `${apiUrl}/tenants/${tenantId}`;
                method = 'PUT';
            }

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Falha ao comunicar com o servidor');

            const data = await res.json();

            if (!tenantId && data.id) {
                setTenantId(data.id);
            }

            setStatus({ type: 'success', message: 'Configurações de empresa salvas com sucesso!' });

        } catch (err) {
            console.error(err);
            setStatus({ type: 'error', message: 'Erro ao salvar. Verifique se o backend está rodando.' });
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div className="dashboard-container"><p>Carregando perfil...</p></div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Configuração da Empresa</h1>
                <p>Defina a identidade do seu negócio para que a Inteligência Artificial trabalhe perfeitamente por você.</p>
            </div>

            {status.message && (
                <div className={`status-message status-${status.type}`}>
                    {status.type === 'success' ? '✓' : '⚠'} {status.message}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="dashboard-card glass-panel">
                    <h2 className="card-title">Identidade Base</h2>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Nome da Empresa</label>
                            <input
                                type="text"
                                name="business_name"
                                value={formData.business_name}
                                onChange={handleChange}
                                placeholder="Ex: Minha Loja"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Ramo / Nicho principal</label>
                            <input
                                type="text"
                                name="niche"
                                value={formData.niche}
                                onChange={handleChange}
                                placeholder="Ex: Moda Feminina, Clínica Odontológica..."
                                required
                            />
                        </div>
                        <div className="form-group full-width">
                            <label className="form-label">Público Alvo Principal</label>
                            <input
                                type="text"
                                name="target_audience"
                                value={formData.target_audience}
                                onChange={handleChange}
                                placeholder="Ex: Mulheres de 20 a 35 anos, classe B e C."
                            />
                        </div>
                        <div className="form-group full-width">
                            <label className="form-label">Sobre o Negócio (Contexto para IA)</label>
                            <textarea
                                name="business_description"
                                value={formData.business_description}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Descreva a história, diferenciais e como o negócio ajuda os clientes..."
                            />
                        </div>
                    </div>
                </div>

                <div className="dashboard-card glass-panel">
                    <h2 className="card-title">Produtos & Comunicação</h2>
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label className="form-label">Principais Produtos ou Serviços</label>
                            <textarea
                                name="main_products"
                                value={formData.main_products}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Liste seus principais produtos, carros-chefe e o que você mais quer vender."
                            />
                        </div>

                        <div className="form-group full-width">
                            <label className="form-label">Tom de Voz da Marca</label>
                            <p className="text-muted" style={{ fontSize: '0.85rem' }}>Como a IA deve se portar ao escrever em nome da sua marca?</p>
                            <div className="tone-selector">
                                {TONES.map(tone => (
                                    <div
                                        key={tone.id}
                                        className={`tone-option ${formData.tone_of_voice === tone.id ? 'selected' : ''}`}
                                        onClick={() => handleToneSelect(tone.id)}
                                    >
                                        {tone.label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="submit-btn-container">
                        <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }} disabled={loading}>
                            {loading ? 'Salvando Perfil...' : 'Salvar Configuração'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Dashboard;
