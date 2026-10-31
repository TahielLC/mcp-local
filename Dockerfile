# 1. Usamos una imagen oficial de Node.js ligera
FROM node:20-alpine AS builder

# 2. Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# 3. Copiamos los archivos de dependencias
COPY package*.json ./
COPY tsconfig.json ./

# 4. Instalamos las dependencias
RUN npm install

# 5. Copiamos el código fuente
COPY src/ ./src/

# 6. Compilamos el código TypeScript a JavaScript puro
RUN npx tsc

# 7. Preparamos la imagen final (multistage build para que sea liviana)
FROM node:20-alpine
WORKDIR /app

# 8. Copiamos solo lo necesario desde la etapa de construcción
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# 9. Comando de inicio (usando node directamente sobre el JS compilado)
CMD ["node", "dist/index.js"]