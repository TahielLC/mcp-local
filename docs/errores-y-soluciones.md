# Errores encontrados y soluciones

Este documento registra errores observados durante el desarrollo de los clientes y su causa.

## 1. `arguments` y `required` desconocidos en `function_declarations`

**Mensaje observado:**

```text
Unknown name "arguments" at
'tools[0].function_declarations[0]'

Unknown name "required" at
'tools[0].function_declarations[0]'
```

**Causa:** la herramienta se declaró con `arguments` en el nivel superior y `required` fuera del esquema de parámetros. Gemini espera que la declaración describa el esquema de entrada mediante `parameters`.

**Corrección:**

```typescript
const tool = {
  name: "ejecutar_consulta_select",
  description: "Ejecuta consultas SELECT",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
      },
    },
    required: ["query"],
  },
};
```

**Nota:** esta declaración corresponde al modo autónomo. El modo manual no necesita declarar herramientas en Gemini si TypeScript ejecuta la consulta directamente.

## 2. Formato incorrecto de `functionResponse`

**Mensaje observado:**

```text
Unknown name "response" at
'contents[2].parts[0].function_response'
Proto field is not repeating, cannot start list.
```

**Causa identificada en la implementación:** se estaba pasando directamente el array obtenido de PostgreSQL como valor de `response`. El SDK espera un objeto JSON en ese campo.

**Corrección aplicada:**

```typescript
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

El array queda contenido dentro de un objeto, bajo la propiedad `resultado`.

## 3. Mezcla de responsabilidades entre modo manual y autónomo

**Problema:** el cliente manual declaraba herramientas para Gemini y comprobaba si el modelo devolvía llamadas a funciones, aunque la consulta SQL ya se había ejecutado previamente en TypeScript.

**Causa:** se estaban combinando dos flujos diferentes.

**Corrección:** separar las implementaciones:

- Manual: SQL predefinido → MCP → PostgreSQL → Gemini recibe los datos en el prompt.
- Autónomo: Gemini solicita una herramienta → TypeScript ejecuta MCP → el resultado vuelve mediante `functionResponse`.

## 4. Diagnóstico por etapas

Cuando aparezca un error, comprobar el recorrido en este orden:

1. ¿Se inició PostgreSQL?
2. ¿Se construyó correctamente la imagen MCP?
3. ¿El cliente pudo conectarse al servidor MCP?
4. ¿La herramienta existe y recibe los argumentos esperados?
5. ¿PostgreSQL ejecutó la consulta?
6. ¿Gemini recibió el contexto o la respuesta de la herramienta?
7. ¿Gemini generó la respuesta final?

Esta secuencia ayuda a identificar en qué componente se encuentra el problema.
