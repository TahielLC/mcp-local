# Arquitectura del sistema

## Componentes

### Cliente orquestador

Implementado en TypeScript y Node.js. Coordina la interacción entre Gemini y el servidor MCP.

- `src/cliente_manual.ts`: ejecuta una consulta definida en el código y luego envía los datos a Gemini.
- `src/cliente_autonomo.ts`: permite que Gemini solicite una herramienta mediante Function Calling.

### Cliente MCP y transporte

El cliente utiliza el SDK de MCP y `StdioClientTransport` para comunicarse con el servidor. En el entorno local, el proceso cliente inicia un contenedor Docker que ejecuta el servidor MCP.

### Servidor MCP

Expone herramientas que el cliente puede invocar. La herramienta utilizada actualmente es:

`ejecutar_consulta_select`

Su función es recibir los argumentos, ejecutar la consulta permitida y devolver el resultado al cliente.

### PostgreSQL

Almacena los datos consultados. En desarrollo se ejecuta mediante Docker Compose.

### Google Gemini

En el modo manual recibe los resultados como contexto. En el modo autónomo puede solicitar la ejecución de una herramienta y, después, analizar su respuesta.

## Diagrama

```text
                    Usuario
                       |
                       v
              Cliente TypeScript
                 /          \
                /            \
         Modo manual      Modo autónomo
         SQL definido     Gemini decide
                \            /
                 \          /
                  Cliente MCP
                       |
                 Transporte STDIO
                       |
                       v
                 Servidor MCP
                    Docker
                       |
                       | SQL
                       v
                  PostgreSQL
                       |
                       | resultados
                       v
                Cliente TypeScript
                       |
                       v
                    Gemini
                       |
                       v
                Respuesta final
```

## Responsabilidades

| Componente | Responsabilidad |
|---|---|
| TypeScript | Orquestar el flujo y controlar la ejecución |
| Gemini | Interpretar solicitudes y redactar respuestas; en modo autónomo, solicitar herramientas |
| Cliente MCP | Enviar solicitudes al servidor MCP |
| Servidor MCP | Exponer herramientas y ejecutar operaciones autorizadas |
| PostgreSQL | Almacenar y devolver los datos |

## Comunicación local con Docker

El cliente inicia el contenedor del servidor MCP mediante `StdioClientTransport`. Entre los argumentos habituales de Docker se encuentran:

- `-i`: mantiene abierta la entrada estándar.
- `--rm`: elimina el contenedor al finalizar.
- `--network`: conecta el contenedor a la red Docker indicada.
- `--env-file`: proporciona variables de entorno al contenedor.

El nombre de la red y de la imagen deben coincidir con la configuración real del proyecto.
