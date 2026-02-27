FROM node:20-alpine

WORKDIR /app

# Copia e instala as dependências primeiro para aproveitar o cache do Docker
COPY package*.json ./
RUN npm install

# Copia o resto do código da API
COPY . .

# Expõe a porta do Express
EXPOSE 3001

CMD ["node", "src/index.js"]
