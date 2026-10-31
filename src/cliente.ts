import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import { GoogleGenerativeAI } from "@google/generative-ai";

async function main() {
  // 1. Conectar al servidor MCP contenerizado
  console.log("Iniciando contenedor Docker del Servidor MCP...");
  const transport = new StdioClientTransport({
    command: "docker",
    args: [
      "run",
      "-i",
      "--rm",
      "--network",
      "mcplocal_default", // Permite que resuelva el nombre "mcp_postgres_lab"
      "--env-file",
      ".env", // Inyecta tus credenciales
      "mi-servidor-mcp",
    ],
  });

  const mcpClient = new Client(
    { name: "mi-cliente-ia", version: "1.0.0" },
    { capabilities: {} },
  );
  await mcpClient.connect(transport);
  console.log("Conexión MCP establecida exitosamente.");

  // 2. Ejecutar la herramienta (Tool) para extraer datos de PostgreSQL
  // En un flujo 100% autónomo, la IA genera el string del 'query'.
  // Aquí le pasamos el query estructurado para validar la conexión end-to-end.
  console.log("Ejecutando consulta SQL a través de MCP...");
  const resultadoTool = await mcpClient.callTool({
    name: "ejecutar_consulta_select",
    arguments: {
      query:
        "SELECT nombre, suscripcion FROM clientes_prueba WHERE suscripcion = 'Premium';",
    },
  });

  const datosCrudos = (resultadoTool.content[0] as any).text;
  console.log("Datos extraídos de PostgreSQL:", datosCrudos);

  // 3. Procesar los datos con la API nativa de Gemini (Sin comillas en process.env)
  console.log("\nEnviando contexto a Gemini para análisis...");
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Falta la variable GEMINI_API_KEY en el archivo .env");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Usamos el modelo flash estándar de la API
  const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });

  const prompt = `Actúa como un asistente corporativo. Recibiste este JSON crudo desde nuestra base de datos PostgreSQL mediante el protocolo MCP: ${datosCrudos}. Escribe un mensaje breve y profesional dirigido al equipo de ventas indicando quiénes son nuestros clientes Premium actuales basándote únicamente en esos datos.`;

  const result = await model.generateContent(prompt);
  console.log("\n================ RESPUESTA DE LA IA ================\n");
  console.log(result.response.text());
  console.log("\n====================================================");

  process.exit(0);
}

main().catch((error) => {
  console.error("Error en el cliente orquestador:", error);
  process.exit(1);
});
