# Mejoras futuras

El proyecto puede evolucionar desde una prueba de integración hacia un orquestador con varias herramientas y controles más completos.

## Orquestación

- Procesar múltiples llamadas a herramientas cuando el modelo las solicite.
- Implementar ciclos de decisión, ejecución y evaluación hasta completar una tarea.
- Definir límites de iteraciones para evitar ciclos indefinidos.
- Incorporar manejo de errores por herramienta.

## Seguridad y control

- Aplicar validación SQL estructural.
- Utilizar permisos de solo lectura en PostgreSQL.
- Restringir tablas, esquemas y volumen de resultados.
- Registrar las solicitudes, herramientas invocadas y resultados relevantes.
- Incorporar límites de tiempo y mecanismos de auditoría.

## Extensibilidad

- Incorporar nuevas herramientas MCP.
- Conectar otras fuentes de datos.
- Exponer el orquestador mediante una API.
- Desarrollar una interfaz de usuario.
- Migrar el servidor MCP a infraestructura cloud con un transporte remoto adecuado.

## Observabilidad

- Centralizar logs del cliente y del servidor MCP.
- Registrar duración y resultado de cada consulta.
- Medir errores de comunicación y consumo de la API de Gemini.
- Separar los errores de modelo, transporte, herramienta y base de datos.
