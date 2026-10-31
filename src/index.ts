import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { z } from "zod";
import pg from "pg";

const { Client } = pg;

// 1. Inicializamos el servidor con la clase actualizada v2
const server = new McpServer({
  name: "mi-servidor-mcp-postgres",
  version: "1.0.0",
});

// Usamos el cliente
// 2. Conectar al contenedor
const dbClient = new Client({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "postgres",
  password: process.env.DB_PASSWORD || "password_local",
  port: Number(process.env.DB_PORT) || 5432,
  // Activa SSL automáticamente solo si detecta que el host es de AWS RDS o si se fuerza por variable
  ssl:
    process.env.DB_SSL === "true" ||
    process.env.DB_HOST?.includes("rds.amazonaws.com")
      ? { rejectUnauthorized: false }
      : false,
});
// 3. Registrar la Herramienta (Tool) para la IA
server.registerTool(
  "ejecutar_consulta_select",
  {
    description:
      "Ejecuta una consulta SQL SELECT de solo lectura en la base de datos PostgreSQL",
    inputSchema: z.object({
      query: z.string().min(5).describe("La consulta SQL SELECT a ejecutar"),
    }),
  },
  async ({ query }) => {
    // Validar por seguridad que la IA solo intente leer datos
    if (!query.trim().toUpperCase().startsWith("SELECT")) {
      return {
        content: [
          {
            type: "text",
            text: "Error: Solo se permiten consultas SELECT por seguridad.",
          },
        ],
      };
    }

    try {
      const res = await dbClient.query(query);
      return {
        content: [{ type: "text", text: JSON.stringify(res.rows, null, 2) }],
      };
    } catch (error: any) {
      return {
        content: [
          { type: "text", text: `Error en la base de datos: ${error.message}` },
        ],
      };
    }
  },
);

// 2. Función principal para arrancar el servidor
async function main() {
  await dbClient.connect();
  console.error("Conectado a PostgreSQL en Docker (Puerto 5433)");

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Servidor MCP iniciado correctamente");
}

main().catch((error) => {
  console.error("Error al iniciar el servidor:", error);
  process.exit(1);
});
