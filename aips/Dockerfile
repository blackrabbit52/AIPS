FROM node:16-alpine as development

WORKDIR /app

# Install required system dependencies
RUN apk add --no-cache python3 make g++

# Configure npm for better reliability and caching
RUN npm config set fetch-retry-maxtimeout 600000 && \
    npm config set fetch-retry-mintimeout 100000 && \
    npm config set fetch-retries 5 && \
    npm config set cache /root/.npm

# Install dependencies
COPY package*.json ./
RUN npm install --network-timeout=600000

# Source code will be mounted as a volume
EXPOSE 3000

CMD ["npm", "start"]

# Production build stage
FROM node:16-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install --network-timeout=600000

COPY . .
RUN npm run build

# Final stage with Nginx
FROM nginx:alpine as production

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 