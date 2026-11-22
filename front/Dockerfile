# --- Compilación ---
FROM node:22-alpine AS compilacion
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Variables de Vite: se fijan al compilar (ver docker-compose.yml)
ARG VITE_API_PROVEEDORES=/srv/proveedores
ARG VITE_API_COTIZACIONES=/srv/cotizaciones
ARG VITE_API_ORDENES=/srv/ordenes
ARG VITE_API_RECEPCION=/srv/recepcion
ENV VITE_API_PROVEEDORES=$VITE_API_PROVEEDORES \
    VITE_API_COTIZACIONES=$VITE_API_COTIZACIONES \
    VITE_API_ORDENES=$VITE_API_ORDENES \
    VITE_API_RECEPCION=$VITE_API_RECEPCION
RUN npm run build

# --- Servidor web ---
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=compilacion /app/dist /usr/share/nginx/html
EXPOSE 80
