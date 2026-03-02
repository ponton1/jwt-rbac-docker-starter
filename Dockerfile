FROM node:20-alpine

WORKDIR /app

# 1) Copiamos solo los manifests para aprovechar cache
COPY package*.json ./

# 2) Instalamos dependencias de forma reproducible
RUN npm ci

# 3) Copiamos el resto del código
COPY . .

# Puerto típico (si tu app usa otro, lo ajustamos)
EXPOSE 3000

# Tu proyecto corre con npm start
CMD ["npm", "start"]
