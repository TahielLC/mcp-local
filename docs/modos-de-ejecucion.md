# Modos de ejecución

El proyecto contiene dos clientes con responsabilidades diferentes. Ambos utilizan MCP para acceder a PostgreSQL, pero cambia quién decide qué consulta ejecutar.

## Modo manual: `cliente_manual.ts`

El desarrollador define la consulta SQL en el código. TypeScript ejecuta la herramienta mediante MCP, recibe los registros y los envía a Gemini para que redacte una respuesta.

```text
Desarrollador define SQL
        |
        v
TypeScript invoca MCP
        |
        v
Servidor MCP ejecuta SQL
        |
        v
PostgreSQL devuelve registros
        |
        v
TypeScript envía los datos a Gemini
        |
        v
Gemini redacta la respuesta
```

Ejemplo:

```typescript
const resultadoTool = await mcpClient.callTool({
  name: "ejecutar_consulta_select",
  arguments: {
    query:
      "SELECT nombre, suscripcion FROM clientes_prueba WHERE suscripcion = 'Premium';",
  },
});
```

En este modo no hace falta declarar herramientas a Gemini: el modelo no tiene que elegir ni invocar una función. La consulta ya fue decidida y ejecutada por TypeScript.

## Modo autónomo: `cliente_autonomo.ts`

El usuario formula una pregunta en lenguaje natural. Gemini analiza la solicitud y puede devolver una llamada a una herramienta, con los argumentos que el cliente debe ejecutar.

```text
Usuario formula una pregunta
        |
        v
Gemini selecciona una herramienta
        |
        v
Gemini genera los argumentos
        |
        v
TypeScript recibe la llamada
        |
        v
TypeScript invoca MCP
        |
        v
Servidor MCP consulta PostgreSQL
        |
        v
TypeScript devuelve el resultado a Gemini
        |
        v
Gemini redacta la respuesta final
```

Ejemplo de solicitud:

> Dime los nombres de los clientes que tengan una suscripción Básica.

Gemini podría generar una consulta como:

```sql
SELECT nombre
FROM clientes_prueba
WHERE suscripcion = 'Básica';
```

El SQL generado debe tratarse como entrada no confiable y validarse antes de ejecutarse.

## Comparación

| Característica | Manual | Autónomo |
|---|---|---|
| Quién define el SQL | Desarrollador | Gemini propone el SQL |
| Quién decide la herramienta | Desarrollador | Gemini |
| MCP | Sí | Sí |
| PostgreSQL | Sí | Sí |
| Gemini analiza resultados | Sí | Sí |
| Function Calling | No es necesario | Sí |
| Respuesta de herramienta a Gemini | No aplica | Sí |

## ¿Por qué mantener ambos modos?

El modo manual permite comprobar por separado la conexión y el recorrido de datos entre TypeScript, MCP y PostgreSQL, antes de introducir la toma de decisiones del modelo.

El modo autónomo agrega la capacidad de seleccionar herramientas dinámicamente. Mantenerlos separados facilita las pruebas y el diagnóstico de errores.
