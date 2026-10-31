# MCP Local: PostgreSQL + Gemini AI

Integración de **Model Context Protocol (MCP)** con PostgreSQL y Google Gemini. El proyecto permite consultar una base de datos mediante un servidor MCP ejecutado en Docker y procesar los resultados con inteligencia artificial.

Actualmente incluye dos modalidades:

- **Manual:** TypeScript ejecuta una consulta SQL predefinida mediante MCP y envía los resultados a Gemini para su análisis.
- **Autónoma:** Gemini interpreta una solicitud, selecciona una herramienta y genera sus argumentos. TypeScript ejecuta la herramienta mediante MCP y devuelve el resultado al modelo.

## Arquitectura, de un vistazo

```text
Usuario
   |
   v
Cliente TypeScript -----> Gemini
   |                       |
   |                       | Function Calling (solo modo autónomo)
   v                       |
Cliente MCP                |
   |                       |
   v                       |
Servidor MCP en Docker     |
   |
   v
PostgreSQL
   |
   +------ resultados ------> TypeScript -----> Gemini
```

El servidor MCP expone actualmente la herramienta `ejecutar_consulta_select`. El cliente orquestador coordina las llamadas y Gemini interpreta los datos o solicita herramientas, según la modalidad.

## Requisitos

- Node.js compatible con las dependencias del proyecto.
- Docker y Docker Compose.
- Git.
- Una API Key de [Google AI Studio](https://aistudio.google.com/).

## Inicio rápido

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/TahielLC/mcp-local.git
   cd mcp-local
   ```

2. Instalar dependencias:

   ```bash
   npm install
   ```

3. Crear y completar el archivo de entorno:

   ```bash
   cp .env.example .env
   ```

   Configurar las variables requeridas por PostgreSQL y Gemini. No subir `.env` a Git.

4. Iniciar PostgreSQL:

   ```bash
   docker compose up -d
   docker compose ps
   ```

5. Construir la imagen del servidor MCP:

   ```bash
   docker build -t mi-servidor-mcp .
   ```

6. Ejecutar una modalidad:

   ```bash
   # Consulta SQL predefinida
   npx tsx --env-file=.env src/cliente_manual.ts

   # Selección de herramienta por Gemini
   npx tsx --env-file=.env src/cliente_autonomo.ts
   ```

> La configuración de host y puerto depende de dónde se ejecute cada proceso. Desde el contenedor MCP se debe usar el nombre del servicio PostgreSQL en la red Docker y su puerto interno. Desde el host puede utilizarse el puerto publicado por Docker Compose.

## Documentación

| Documento                                            | Contenido                                                        |
| ---------------------------------------------------- | ---------------------------------------------------------------- |
| [Arquitectura](docs/arquitectura.md)                 | Componentes, responsabilidades y diagrama                        |
| [Modos de ejecución](docs/modos-de-ejecucion.md)     | Diferencias entre el cliente manual y el autónomo                |
| [Configuración local](docs/configuracion-local.md)   | Variables de entorno, Docker y ejecución                         |
| [Integración con Gemini](docs/integracion-gemini.md) | Function Calling, `parameters`, `arguments` y `functionResponse` |
| [Errores y soluciones](docs/errores-y-soluciones.md) | Problemas encontrados durante el desarrollo                      |
| [Seguridad](docs/seguridad.md)                       | Controles para consultas SQL, credenciales y contenedores        |
| [Evolución hacia AWS](docs/aws.md)                   | Arquitectura objetivo con RDS, ECR y ECS/Fargate                 |
| [Mejoras futuras](docs/mejoras-futuras.md)           | Próximos pasos posibles                                          |

## Estado del proyecto

La integración local entre TypeScript, MCP, Docker, PostgreSQL y Gemini es el foco actual. La sección de AWS describe una posible evolución de la arquitectura; no implica que ese despliegue ya esté implementado.

## Autor

Laboratorio técnico de integración entre TypeScript, Node.js, Docker, PostgreSQL, Model Context Protocol y Google Gemini.

Repositorio: [TahielLC/mcp-local](https://github.com/TahielLC/mcp-local)
