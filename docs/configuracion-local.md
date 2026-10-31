# Configuración y ejecución local

## Requisitos

- Node.js compatible con las dependencias instaladas.
- Docker y Docker Compose.
- Git.
- API Key de [Google AI Studio](https://aistudio.google.com/).

## Instalación

```bash
git clone https://github.com/TahielLC/mcp-local.git
cd mcp-local
npm install
```

## Variables de entorno

Crear el archivo `.env`:

```bash
cp .env.example .env
```

Ejemplo orientativo:

```ini
# PostgreSQL
DB_USER=postgres
DB_HOST=mcp_postgres_lab
DB_NAME=postgres
DB_PASSWORD=tu_password_seguro
DB_PORT=5432
DB_SSL=false

# Google Gemini
GEMINI_API_KEY=tu_api_key_de_gemini
```

Los nombres y valores deben coincidir con los que consume el servidor MCP y con el servicio declarado en `docker-compose.yml`.

### Host y puerto de PostgreSQL

Hay que distinguir dónde se ejecuta el proceso que se conecta a PostgreSQL:

- Desde otro contenedor de la misma red Docker: usar el nombre del servicio y el puerto interno (por ejemplo, `mcp_postgres_lab:5432`).
- Desde el sistema anfitrión: usar `localhost` y el puerto publicado por Compose (por ejemplo, `localhost:5433`, si así está configurado).

No intercambiar el puerto publicado del host con el puerto interno entre contenedores.

## Iniciar PostgreSQL

```bash
docker compose up -d
docker compose ps
```

## Construir la imagen del servidor MCP

```bash
docker build -t mi-servidor-mcp .
```

Repetir la construcción cuando se modifique el código incluido en la imagen, especialmente el servidor MCP.

## Ejecutar los clientes

Modo manual:

```bash
npx tsx --env-file=.env src/cliente_manual.ts
```

Modo autónomo:

```bash
npx tsx --env-file=.env src/cliente_autonomo.ts
```

Cada cliente inicia el contenedor del servidor MCP mediante el transporte configurado en el código.

## Buenas prácticas

- Mantener `.env` fuera del repositorio.
- Incluir en `.env.example` solamente valores ficticios.
- Verificar que la red Docker indicada en el cliente exista.
- Verificar que el nombre de la imagen coincida con la imagen construida.
- Consultar `docker compose ps` para comprobar el estado de PostgreSQL.
