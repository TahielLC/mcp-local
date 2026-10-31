# Integración con Google Gemini

La integración se realiza mediante el paquete `@google/genai`.

```typescript
import { GoogleGenAI, Type } from "@google/genai";
```

La API Key se obtiene de una variable de entorno:

```typescript
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});
```

El modelo configurado en los clientes actuales es `gemini-3.5-flash-lite`. El identificador debe verificarse según la disponibilidad vigente en la cuenta y la API utilizada.

## Gemini en modo manual

En el modo manual no se configura Function Calling. TypeScript ya ejecutó la consulta y envía los datos a Gemini mediante un prompt:

```typescript
const prompt = `
Recibiste estos datos desde PostgreSQL:

${datosCrudos}

Analiza la información y redacta una respuesta.
`;

const result = await chat.sendMessage({
  message: prompt,
});
```

## Gemini en modo autónomo: Function Calling

En el modo autónomo se declara la herramienta para que Gemini conozca su nombre, descripción y parámetros.

Ejemplo:

```typescript
const ejecutarConsultaSelectTool = {
  name: "ejecutar_consulta_select",
  description:
    "Ejecuta una consulta SQL SELECT de solo lectura en PostgreSQL",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: "Consulta SQL SELECT que se desea ejecutar",
      },
    },
    required: ["query"],
  },
};
```

La declaración se incorpora a la configuración del chat:

```typescript
const chat = ai.chats.create({
  model: "gemini-3.5-flash-lite",
  config: {
    tools: [{ functionDeclarations: [ejecutarConsultaSelectTool] }],
  },
});
```

Cuando Gemini solicita la herramienta, el SDK expone la llamada y sus argumentos. TypeScript utiliza esos argumentos para invocar MCP:

```typescript
const argsGenerados = llamada.args as { query: string };

const resultadoTool = await mcpClient.callTool({
  name: nombreHerramienta,
  arguments: argsGenerados,
});
```

## Diferencia entre `parameters` y `arguments`

No son intercambiables:

- `parameters`: esquema que describe los datos que la función puede recibir. Se utiliza en la declaración que se envía a Gemini.
- `arguments`: valores concretos que se envían al ejecutar una herramienta MCP.

Ejemplo conceptual:

```text
Declaración para Gemini:
parameters -> { query: string }

Invocación MCP:
arguments -> { query: "SELECT ..." }
```

## Devolver el resultado mediante `functionResponse`

Después de ejecutar la herramienta, el cliente debe devolver el resultado a Gemini para que continúe la conversación.

En la implementación actual:

```typescript
const datosParseados = JSON.parse(datosCrudos);

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
```

El objeto `response` encapsula los registros bajo la propiedad `resultado`. Esto evita enviar directamente un array donde el SDK espera un objeto de respuesta.

## Responsabilidad del cliente

Function Calling no significa que Gemini ejecute directamente SQL ni que acceda por sí mismo a la base de datos. Gemini solicita una función; el código TypeScript recibe esa solicitud, valida los datos y decide si ejecuta la herramienta mediante MCP.
