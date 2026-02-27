require('dotenv').config();
const express = require('express');
const cors = require('cors');
const tenantRoutes = require('./routes/tenantRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/api/tenants', tenantRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'API is running' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
