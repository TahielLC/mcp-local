import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import { GoogleGenAI, Type } from "@google/genai"; // Importamos el nuevo SDK

async function main() {
  console.log("🚀 Iniciando Orquestador Autónomo y contenedor MCP...");

  // 1. Conexión al servidor MCP
  const transport = new StdioClientTransport({
    command: "docker",
    args: [
      "run",
      "-i",
      "--rm",
      "--network",
      "mcplocal_default",
      "--env-file",
      ".env",
      "mi-servidor-mcp",
    ],
  });
  const mcpClient = new Client(
    { name: "cliente-ia-autonomo", version: "2.0.0" },
    { capabilities: {} },
  );
  await mcpClient.connect(transport);
  console.log("Conexión MCP establecida exitosamente.\n");

  // 2. Definición tipada de la herramienta usando el enum Type
  const ejecutarConsultaSelectTool = {
    name: "ejecutar_consulta_select",
    description:
      "Ejecuta una consulta SQL SELECT de solo lectura en la base de datos PostgreSQL",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: "La consulta SQL SELECT a ejecutar",
        },
      },
      required: ["query"],
    },
  };
  // 3. Inicializar el nuevo cliente de Google GenAI
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  // Usamos el gestor de chats automático que administra los thought_signatures
  const chat = ai.chats.create({
    model: "gemini-3.5-flash-lite",
    config: {
      tools: [{ functionDeclarations: [ejecutarConsultaSelectTool] }],
    },
  });

  const instruccionUsuario =
    "Nuestra base de datos tiene una tabla llamada 'clientes_prueba' con las columnas 'nombre' y 'suscripcion'. Dime exclusivamente los nombres de los clientes que tengan una suscripción 'Básica'.";
  console.log(`Usuario: "${instruccionUsuario}"\n`);
  console.log(
    "Gemini está procesando la solicitud y decidiendo qué hacer...\n",
  );

  // 4. Enviar mensaje inicial
  let result = await chat.sendMessage({ message: instruccionUsuario });

  // 5. Intercepción: Si hay peticiones de herramientas
  if (result.functionCalls && result.functionCalls.length > 0) {
    const llamada = result.functionCalls[0]!;

    // Validación estricta para TypeScript: garantizamos que el nombre sea un string
    const nombreHerramienta = llamada.name;
    if (!nombreHerramienta) {
      throw new Error(
        "La IA intentó llamar a una herramienta sin proporcionar su nombre.",
      );
    }

    const argsGenerados = llamada.args as { query: string };

    console.log(
      `[Decisión de IA] Gemini decidió usar la herramienta: ${llamada.name}`,
    );
    console.log(`[SQL Generado] ${argsGenerados.query}\n`);

    // Ejecutar en MCP
    const resultadoTool = await mcpClient.callTool({
      name: nombreHerramienta,
      arguments: argsGenerados,
    });

    const datosCrudos = (resultadoTool.content[0] as any).text;
    console.log(`[Respuesta de PostgreSQL] ${datosCrudos}\n`);
    console.log(
      "Enviando datos a Gemini para redactar la respuesta final...\n",
    );

    const datosParseados = JSON.parse(datosCrudos);

    // 6. Devolver los resultados. El chat gestiona automáticamente el formato interno requerido.
    result = await chat.sendMessage({
      message: [
        {
          functionResponse: {
            name: nombreHerramienta,
            response: {
              resultado: datosParseados,
            },
          },
        },
      ],
    });
  }

  console.log("================ RESPUESTA FINAL DE LA IA ================\n");
  console.log(result.text); // En el nuevo SDK la propiedad final es 'text'
  console.log("\n==========================================================");

  process.exit(0);
}

main().catch((error) => {
  console.error("Error en el cliente orquestador autónomo:", error);
  process.exit(1);
});
