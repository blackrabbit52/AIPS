FROM node:18-alpine

WORKDIR /app

# Installer les dépendances système nécessaires
RUN apk add --no-cache python3 make g++

# Copier les fichiers de configuration
COPY package*.json ./

# Configurer npm pour ignorer les avertissements et utiliser un timeout plus long
RUN npm config set fetch-timeout 300000 && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 10000 && \
    npm config set fetch-retry-maxtimeout 60000 && \
    npm config set loglevel warn

# Installer les dépendances avec retry et ignorer les avertissements
RUN --mount=type=cache,target=/root/.npm \
    npm install --legacy-peer-deps --no-audit --no-fund || \
    (echo "Retrying npm install..." && npm install --legacy-peer-deps --no-audit --no-fund) || \
    (echo "Retrying npm install one last time..." && npm install --legacy-peer-deps --no-audit --no-fund)

# Copier le reste du code
COPY . .

# Construire l'application en ignorant les avertissements
RUN npm run build -- --no-warnings

# Exposer le port
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["npm", "start"] 