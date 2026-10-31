# 🚀 Arquitectura Híbrida: Servidor MCP + PostgreSQL + Gemini AI

Este repositorio contiene una implementación de una arquitectura de integración basada en **Model Context Protocol (MCP)**, que permite conectar modelos de inteligencia artificial con bases de datos relacionales mediante herramientas controladas.

El proyecto demuestra cómo un modelo de lenguaje (LLM), utilizando **Google Gemini**, puede interactuar con información almacenada en PostgreSQL a través de un servidor MCP ejecutado en un contenedor Docker.

La arquitectura implementa dos modalidades de interacción:

- **Modo manual:** el desarrollador define previamente la consulta SQL. El cliente ejecuta la consulta mediante MCP y posteriormente envía los resultados a Gemini para su análisis.
- **Modo autónomo:** Gemini recibe una solicitud en lenguaje natural, decide qué herramienta utilizar y genera los argumentos necesarios para ejecutar una consulta SQL mediante MCP.

El objetivo es explorar la integración entre inteligencia artificial, bases de datos, contenedores y protocolos de comunicación estandarizados, manteniendo una separación clara entre la toma de decisiones de la IA y la ejecución de operaciones sobre los datos.

La arquitectura está preparada para trabajar en entornos locales y contempla su posible evolución hacia infraestructura cloud mediante **AWS RDS y AWS ECR**.

---

## 📑 Tabla de contenidos

1. [Características principales](#-características-principales)
2. [Arquitectura general](#-arquitectura-general)
3. [Diferencias entre ejecución manual y autónoma](#-diferencias-entre-ejecución-manual-y-autónoma)
4. [Flujo de comunicación y funcionamiento](#-flujo-de-comunicación-y-funcionamiento)
5. [Stack tecnológico](#️-stack-tecnológico)
6. [Requisitos previos](#-requisitos-previos)
7. [Estructura del proyecto](#-estructura-del-proyecto)
8. [Instalación y configuración](#-instalación-y-configuración)
9. [Ejecución local](#-ejecución-local)
10. [Explicación técnica de las dos modalidades](#-explicación-técnica-de-las-dos-modalidades)
11. [Errores encontrados y soluciones](#-errores-encontrados-y-soluciones)
12. [Seguridad y mejores prácticas](#-seguridad-y-mejores-prácticas)
13. [Evolución hacia AWS](#️-evolución-hacia-aws)
14. [Autor](#-autor)

---

## ✨ Características principales

- **Integración mediante MCP:** utilización de Model Context Protocol para comunicar clientes con herramientas externas y fuentes de datos.
- **Servidor MCP contenerizado:** ejecución del servidor MCP dentro de Docker, utilizando comunicación mediante STDIO.
- **Integración con PostgreSQL:** acceso a una base de datos relacional para extraer información mediante consultas SQL.
- **Integración con Gemini AI:** procesamiento de información y generación de respuestas utilizando Google GenAI SDK.
- **Dos modalidades de ejecución:** implementación de un cliente manual y otro autónomo.
- **Function Calling:** capacidad de Gemini para seleccionar herramientas y generar argumentos dinámicamente en el modo autónomo.
- **Separación de responsabilidades:** el servidor MCP administra la ejecución de consultas, TypeScript coordina el flujo y Gemini interpreta la información.
- **Arquitectura extensible:** posibilidad de incorporar nuevas herramientas MCP y conectar infraestructura cloud.

---

## 🏗️ Arquitectura general

El sistema está compuesto por cuatro componentes principales:

### 1. Cliente orquestador (Node.js / TypeScript)

Es el componente encargado de coordinar la comunicación entre Gemini, el servidor MCP y PostgreSQL.

Existen dos implementaciones:

- `cliente_manual.ts`
- `cliente_autonomo.ts`

Cada una implementa una estrategia diferente de interacción con la inteligencia artificial.

### 2. Servidor MCP

Es el intermediario entre el cliente y la base de datos.

Expone herramientas que permiten ejecutar operaciones controladas sobre PostgreSQL.

La herramienta utilizada actualmente es:

`ejecutar_consulta_select`

Su responsabilidad es recibir los argumentos de la consulta, ejecutarla y devolver los resultados al cliente.

### 3. Base de datos PostgreSQL

Almacena la información que será consultada.

En el entorno de desarrollo se utiliza PostgreSQL mediante Docker Compose.

### 4. Google Gemini AI

Es el modelo de inteligencia artificial encargado de interpretar las solicitudes y generar respuestas.

Dependiendo de la modalidad:

- En modo manual, recibe directamente los resultados obtenidos desde PostgreSQL.
- En modo autónomo, decide qué herramienta ejecutar, genera sus argumentos y posteriormente interpreta los resultados.

### Diagrama general

```text
                  ┌────────────────────────┐
                  │       USUARIO          │
                  │  Solicitud en lenguaje │
                  │        natural         │
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │  CLIENTE ORQUESTADOR   │
                  │     Node.js / TS       │
                  └───────────┬────────────┘
                              │
                 ┌────────────┴────────────┐
                 │                         │
                 ▼                         ▼
       ┌──────────────────┐      ┌──────────────────┐
       │   MODO MANUAL    │      │  MODO AUTÓNOMO   │
       │                  │      │                  │
       │ SQL predefinido  │      │ Gemini decide    │
       │ por desarrollador│      │ qué herramienta  │
       │                  │      │ utilizar         │
       └────────┬─────────┘      └────────┬─────────┘
                │                         │
                └────────────┬────────────┘
                             │
                             ▼
                  ┌────────────────────────┐
                  │      CLIENTE MCP       │
                  │    Comunicación STDIO │
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │     SERVIDOR MCP       │
                  │        Docker          │
                  │                        │
                  │ ejecutar_consulta_     │
                  │       select           │
                  └───────────┬────────────┘
                              │
                              │ SQL
                              ▼
                  ┌────────────────────────┐
                  │      PostgreSQL        │
                  │                        │
                  │   Base de datos        │
                  └───────────┬────────────┘
                              │
                              │ Resultados
                              ▼
                  ┌────────────────────────┐
                  │     GOOGLE GEMINI      │
                  │                        │
                  │ Interpretación y       │
                  │ generación de respuesta│
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │    RESPUESTA FINAL     │
                  │    Lenguaje natural    │
                  └────────────────────────┘
```

---

## 🔀 Diferencias entre ejecución manual y autónoma

Una de las principales características del proyecto es que permite comparar dos formas de integrar una inteligencia artificial con herramientas externas.

Aunque ambas modalidades utilizan los mismos componentes tecnológicos, la responsabilidad de decidir qué consulta ejecutar cambia considerablemente.

### 1. Modo manual (`cliente_manual.ts`)

En esta modalidad, el desarrollador define previamente la consulta SQL que se ejecutará.

El cliente TypeScript se conecta al servidor MCP, ejecuta la herramienta y obtiene los resultados de PostgreSQL.

Posteriormente, envía esos datos a Gemini para que los interprete y genere una respuesta en lenguaje natural.

**Flujo de ejecución:**

```text
1. TypeScript inicia el cliente MCP.
             |
             ▼
2. Se establece la conexión con el servidor MCP.
             |
             ▼
3. TypeScript define la consulta SQL.
             |
             ▼
4. MCP ejecuta la consulta en PostgreSQL.
             |
             ▼
5. PostgreSQL devuelve los registros.
             |
             ▼
6. TypeScript recibe los resultados.
             |
             ▼
7. Gemini recibe los datos como contexto.
             |
             ▼
8. Gemini genera una respuesta final.
```

**Ejemplo de consulta predefinida:**

```typescript
const resultadoTool = await mcpClient.callTool({
  name: "ejecutar_consulta_select",
  arguments: {
    query:
      "SELECT nombre, suscripcion FROM clientes_prueba WHERE suscripcion = 'Premium';",
  },
});
```

En este caso, TypeScript ya conoce la consulta que debe ejecutar.

Gemini no participa en la selección de la herramienta ni en la generación del SQL.

Su responsabilidad consiste exclusivamente en analizar los resultados proporcionados por el cliente.

**¿Por qué esta modalidad no necesita Function Calling?**

Porque el desarrollador ya tomó la decisión de qué herramienta ejecutar.

No es necesario declarar herramientas en la configuración de Gemini mediante `functionDeclarations`, ya que no se espera que el modelo solicite su ejecución.

Esto simplifica la arquitectura y permite validar primero la comunicación entre PostgreSQL, MCP y Gemini.

### 2. Modo autónomo (`cliente_autonomo.ts`)

En esta modalidad, la inteligencia artificial participa activamente en la toma de decisiones.

El usuario realiza una solicitud en lenguaje natural y Gemini analiza qué herramienta necesita utilizar para responderla.

Mediante Function Calling, Gemini genera una llamada a la herramienta junto con sus argumentos.

El cliente TypeScript recibe esa solicitud y ejecuta la herramienta a través de MCP.

Posteriormente, los resultados regresan a Gemini para generar la respuesta final.

**Flujo de ejecución:**

```text
1. El usuario realiza una pregunta.
             |
             ▼
2. Gemini analiza la solicitud.
             |
             ▼
3. Gemini decide utilizar una herramienta.
             |
             ▼
4. Gemini genera los argumentos de la función.
             |
             ▼
5. TypeScript recibe la llamada.
             |
             ▼
6. El cliente ejecuta la herramienta mediante MCP.
             |
             ▼
7. PostgreSQL ejecuta la consulta SQL.
             |
             ▼
8. Los resultados regresan a TypeScript.
             |
             ▼
9. TypeScript devuelve los resultados a Gemini.
             |
             ▼
10. Gemini redacta la respuesta final.
```

**Ejemplo de solicitud del usuario:**

```text
Nuestra base de datos tiene una tabla llamada
clientes_prueba con las columnas nombre y suscripcion.

Dime exclusivamente los nombres de los clientes
que tengan una suscripción Básica.
```

Gemini puede decidir generar una consulta como:

```sql
SELECT nombre
FROM clientes_prueba
WHERE suscripcion = 'Básica';
```

El cliente no ejecuta directamente el SQL generado por la IA sin intermediación.

Primero recibe la llamada a la función y posteriormente utiliza MCP para ejecutar la herramienta correspondiente.

**¿Por qué esta modalidad necesita Function Calling?**

Porque Gemini necesita conocer qué herramientas están disponibles y qué parámetros debe proporcionar para utilizarlas.

La declaración de herramientas se realiza mediante `functionDeclarations`.

Ejemplo simplificado:

```typescript
const ejecutarConsultaSelectTool = {
  name: "ejecutar_consulta_select",
  description: "Ejecuta una consulta SQL SELECT de solo lectura en PostgreSQL",
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

La propiedad `parameters` define el esquema de entrada que Gemini debe respetar.

Cuando Gemini decide utilizar la herramienta, genera los valores concretos en `args`, que posteriormente se envían a MCP.

### Comparación técnica

| Característica                    | Modo manual           | Modo autónomo         |
| --------------------------------- | --------------------- | --------------------- |
| Cliente                           | `cliente_manual.ts`   | `cliente_autonomo.ts` |
| Generación SQL                    | Desarrollador         | Gemini                |
| Selección de herramienta          | Desarrollador         | Gemini                |
| Function Calling                  | No requiere           | Sí                    |
| MCP                               | Sí                    | Sí                    |
| PostgreSQL                        | Sí                    | Sí                    |
| Análisis con Gemini               | Sí                    | Sí                    |
| Devolución de resultados a Gemini | Contexto en el prompt | `functionResponse`    |
| Toma de decisiones                | Código TypeScript     | Modelo de IA          |

**Conclusión:** el modo manual permite validar la integración técnica entre los componentes. El modo autónomo agrega una capa de razonamiento y selección dinámica de herramientas.

---

## 🔄 Flujo de comunicación y funcionamiento

Para comprender correctamente la arquitectura es importante distinguir las responsabilidades de cada componente.

### Comunicación entre TypeScript y MCP

El cliente utiliza las bibliotecas oficiales del SDK de MCP:

```typescript
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
```

La comunicación se establece mediante un transporte STDIO.

El cliente inicia un contenedor Docker que ejecuta el servidor MCP:

```typescript
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
```

Parámetros importantes:

- `-i`: mantiene abierta la entrada estándar para permitir la comunicación STDIO.
- `--rm`: elimina el contenedor cuando finaliza su ejecución.
- `--network`: conecta el contenedor a la red Docker correspondiente.
- `--env-file`: proporciona las variables de entorno necesarias.
- `mi-servidor-mcp`: imagen Docker del servidor MCP.

La conexión se establece mediante:

```typescript
await mcpClient.connect(transport);
```

### Comunicación entre MCP y PostgreSQL

El servidor MCP recibe las solicitudes del cliente y ejecuta la herramienta correspondiente.

La herramienta disponible actualmente es:

```text
ejecutar_consulta_select
```

Esta herramienta permite ejecutar consultas de lectura sobre PostgreSQL.

Los resultados regresan al cliente MCP, que posteriormente puede procesarlos o enviarlos a Gemini.

### Comunicación entre TypeScript y Gemini

La integración se realiza utilizando el paquete:

```typescript
import { GoogleGenAI, Type } from "@google/genai";
```

La instancia del cliente se inicializa mediante la API Key:

```typescript
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});
```

El modelo utilizado actualmente en el proyecto es:

```typescript
model: "gemini-3.5-flash-lite";
```

En el modo manual se envía un prompt que contiene los resultados obtenidos.

En el modo autónomo se habilita Function Calling para que Gemini pueda solicitar la ejecución de herramientas.

---

## 🛠️ Stack tecnológico

| Tecnología             | Función                                                 |
| ---------------------- | ------------------------------------------------------- |
| TypeScript             | Lenguaje de programación                                |
| Node.js                | Entorno de ejecución                                    |
| Google GenAI SDK       | Integración con Gemini                                  |
| Google Gemini          | Modelo de inteligencia artificial                       |
| Model Context Protocol | Comunicación entre cliente y servidor MCP               |
| PostgreSQL             | Base de datos relacional                                |
| `pg`                   | Cliente de PostgreSQL para Node.js                      |
| Docker                 | Contenedorización del servidor MCP                      |
| Docker Compose         | Administración del entorno local                        |
| AWS RDS                | Servicio administrado de PostgreSQL previsto para cloud |
| AWS ECR                | Registro privado de imágenes Docker                     |
| AWS CLI                | Administración de servicios AWS                         |

---

## 📋 Requisitos previos

Antes de ejecutar el proyecto se necesita:

- [Node.js](https://nodejs.org/) versión 18 o superior, compatible con las dependencias utilizadas.
- [Docker](https://www.docker.com/).
- Docker Compose.
- [Git](https://git-scm.com/).
- Una API Key válida de [Google AI Studio](https://aistudio.google.com/).
- Un entorno de PostgreSQL configurado mediante Docker Compose.

Para trabajar con infraestructura cloud también se necesita:

- Una cuenta de AWS.
- [AWS CLI](https://aws.amazon.com/cli/) instalado y configurado.
- Permisos para administrar Amazon RDS y Amazon ECR.

---

## 📁 Estructura del proyecto

La organización general del repositorio es la siguiente:

```text
mcp-local/
│
├── src/
│   ├── index.ts
│   ├── cliente_manual.ts
│   └── cliente_autonomo.ts
│
├── docker-compose.yml
├── Dockerfile
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

### Descripción de los archivos principales

**`src/index.ts`**

Implementa el servidor MCP y registra las herramientas que permiten interactuar con PostgreSQL.

**`src/cliente_manual.ts`**

Implementa la modalidad manual.

Ejecuta una consulta SQL predefinida mediante MCP y envía los resultados obtenidos a Gemini para su interpretación.

**`src/cliente_autonomo.ts`**

Implementa la modalidad autónoma.

Permite que Gemini decida qué herramienta utilizar, genere los argumentos necesarios y solicite su ejecución mediante MCP.

**`Dockerfile`**

Define la imagen Docker del servidor MCP.

**`docker-compose.yml`**

Configura los servicios necesarios para el entorno local, incluyendo PostgreSQL.

**`.env`**

Contiene las credenciales y variables de configuración del entorno.

**`.env.example`**

Plantilla de las variables de entorno necesarias.

**`.gitignore`**

Evita que archivos sensibles sean incluidos en Git.

**`package.json`**

Contiene las dependencias y scripts del proyecto.

---

## 🚀 Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/TahielLC/mcp-local.git

cd mcp-local
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear el archivo `.env` utilizando la plantilla:

```bash
cp .env.example .env
```

Completar las variables necesarias:

```ini
# Configuración de PostgreSQL

DB_USER=postgres
DB_HOST=mcp_postgres_lab
DB_NAME=postgres
DB_PASSWORD=tu_password_seguro
DB_PORT=5432
DB_SSL=false

# Google Gemini

GEMINI_API_KEY=tu_api_key_de_gemini
```

**Importante sobre la configuración de red:**

El servidor MCP se ejecuta dentro de un contenedor Docker conectado a la red `mcplocal_default`.

Por lo tanto, cuando PostgreSQL también se ejecuta en esa red, el servidor MCP debe utilizar el nombre del servicio de Docker Compose como host y el puerto interno de PostgreSQL.

Por ejemplo:

- Comunicación entre contenedores: `DB_HOST=mcp_postgres_lab` y `DB_PORT=5432`.
- Acceso desde el sistema anfitrión: puede utilizarse `localhost:5433` si Docker Compose publica ese puerto.

Estos valores deben coincidir con la configuración real de `docker-compose.yml`.

Para AWS RDS se deberá reemplazar el host por el endpoint de la instancia y configurar correctamente SSL/TLS.

**Seguridad:**

- Nunca subir `.env` a GitHub.
- No incluir credenciales reales en `.env.example`.
- No escribir API Keys directamente en el código fuente.

---

## 💻 Ejecución local

### 1. Levantar PostgreSQL

Iniciar los servicios definidos en Docker Compose:

```bash
docker compose up -d
```

Comprobar su estado:

```bash
docker compose ps
```

### 2. Construir la imagen del servidor MCP

```bash
docker build -t mi-servidor-mcp .
```

Este paso debe repetirse cuando se modifique el código del servidor MCP.

El cliente inicia el contenedor automáticamente cuando se ejecuta, por lo que no es necesario levantar manualmente otro contenedor del servidor MCP.

### 3. Ejecutar el cliente manual

```bash
npx tsx --env-file=.env src/cliente_manual.ts
```

Este cliente ejecuta una consulta SQL predefinida, obtiene los resultados mediante MCP y posteriormente los envía a Gemini.

### 4. Ejecutar el cliente autónomo

```bash
npx tsx --env-file=.env src/cliente_autonomo.ts
```

Este cliente envía una solicitud en lenguaje natural a Gemini.

El modelo decide si necesita utilizar una herramienta, genera los argumentos y el cliente TypeScript ejecuta la solicitud mediante MCP.

### 5. Verificar el funcionamiento

En ambas modalidades deberían aparecer mensajes similares a:

```text
Conexión MCP establecida exitosamente.
```

En el modo manual:

```text
Ejecutando consulta SQL a través de MCP...

Datos extraídos de PostgreSQL:
...
```

En el modo autónomo:

```text
Gemini está procesando la solicitud...

[Decisión de IA] Gemini decidió usar la herramienta:
ejecutar_consulta_select

[SQL Generado]
SELECT nombre FROM clientes_prueba
WHERE suscripcion = 'Básica';
```

---

## 🧠 Explicación técnica de las dos modalidades

Esta sección describe algunos conceptos fundamentales de la implementación.

### 1. ¿Qué es Function Calling?

Function Calling es un mecanismo que permite que Gemini solicite la ejecución de funciones externas.

El modelo no ejecuta directamente el código de TypeScript ni accede por sí mismo a PostgreSQL.

En cambio, genera una solicitud estructurada que contiene:

- El nombre de la herramienta.
- Los argumentos necesarios para ejecutarla.

El cliente recibe esa solicitud y decide cómo procesarla.

En este proyecto, el cliente utiliza MCP para ejecutar la herramienta correspondiente.

### 2. ¿Qué diferencia existe entre `parameters` y `arguments`?

Es importante no confundir estos dos conceptos.

**`parameters`**

Define la estructura de los datos que una herramienta puede recibir.

Se utiliza al declarar una función para Gemini.

**`arguments`**

Contiene los valores concretos que se proporcionan cuando se ejecuta una herramienta MCP.

Ejemplo de declaración para Gemini:

```typescript
const ejecutarConsultaSelectTool = {
  name: "ejecutar_consulta_select",
  description: "Ejecuta una consulta SELECT",
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

Ejemplo de ejecución mediante MCP:

```typescript
await mcpClient.callTool({
  name: "ejecutar_consulta_select",
  arguments: {
    query: "SELECT nombre FROM clientes_prueba;",
  },
});
```

Aunque ambos conceptos están relacionados, pertenecen a etapas diferentes de la comunicación.

### 3. ¿Qué es `functionResponse`?

En el modo autónomo, una vez ejecutada la herramienta, el cliente debe devolver los resultados a Gemini.

Esto se realiza mediante `functionResponse`.

Ejemplo de implementación:

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

La propiedad `response` contiene un objeto JSON con los resultados de la ejecución.

Por ejemplo:

```json
{
  "resultado": [
    {
      "nombre": "Carlos Ruiz"
    }
  ]
}
```

Es importante encapsular los registros dentro de un objeto, ya que el SDK espera un objeto de respuesta y no directamente un array en ese campo.

Esto permite que Gemini reciba nuevamente la información y pueda redactar la respuesta final.

### 4. ¿Por qué el modo manual no utiliza `functionResponse`?

Porque en el modo manual no existe una llamada de función realizada por Gemini.

TypeScript ejecuta primero la consulta mediante MCP y después envía los resultados a Gemini como parte del contexto del prompt.

Ejemplo:

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

Por lo tanto, no es necesario construir un ciclo de Function Calling.

---

## 🐛 Errores encontrados y soluciones

Durante el desarrollo se identificaron problemas relacionados principalmente con la estructura de comunicación entre MCP y Gemini.

Esta sección documenta los errores para facilitar su diagnóstico y evitar repetirlos.

### Error 1. Declaración incorrecta de herramientas en Gemini

**Mensaje:**

```text
Invalid JSON payload received.

Unknown name "arguments" at
'tools[0].function_declarations[0]'

Unknown name "required" at
'tools[0].function_declarations[0]'
```

**Causa:**

Se estaba utilizando `arguments` en lugar de `parameters` al declarar una herramienta para Gemini.

También se estaba colocando `required` fuera de la estructura de parámetros.

**Solución:**

Utilizar `parameters`, definir `properties` y colocar `required` dentro del esquema:

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

**Consideración arquitectónica:**

Este cambio corresponde al modo autónomo.

En el modo manual no es necesario declarar herramientas en Gemini porque TypeScript ya ejecuta la consulta.

### Error 2. Estructura incorrecta de `functionResponse`

**Mensaje:**

```text
Invalid JSON payload received.

Unknown name "response" at
'contents[2].parts[0].function_response'

Proto field is not repeating,
cannot start list.
```

**Causa:**

Se estaba enviando directamente un array JSON como contenido de `response`.

Sin embargo, el SDK de Google GenAI espera un objeto JSON en ese campo.

**Solución:**

Encapsular los registros dentro de una propiedad:

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

**Resultado:**

Gemini recibe los registros dentro de un objeto válido y puede continuar el procesamiento de la solicitud.

### Error 3. Diferencia entre la ejecución manual y autónoma

**Problema:**

Se había configurado Function Calling en la versión manual, aunque el cliente ya ejecutaba la consulta SQL directamente.

**Causa:**

Se estaban mezclando responsabilidades de las dos modalidades.

**Solución:**

Separar los flujos:

- Modo manual: SQL predefinido, ejecución MCP y análisis mediante prompt.
- Modo autónomo: declaración de herramientas, decisión de Gemini, ejecución MCP y devolución de resultados mediante `functionResponse`.

Esta separación reduce la complejidad y facilita el mantenimiento.

---

## 🔐 Seguridad y mejores prácticas

La seguridad es un componente fundamental de esta arquitectura, especialmente porque se permite que un modelo de lenguaje genere consultas SQL.

### 1. Gestión de credenciales

- Mantener `.env` excluido del control de versiones.
- No incluir API Keys directamente en el código.
- Utilizar AWS Secrets Manager o mecanismos equivalentes en producción.
- No incluir credenciales dentro de las imágenes Docker.

### 2. Validación de consultas SQL

La herramienta `ejecutar_consulta_select` debe limitarse a operaciones de lectura.

Sin embargo, no es suficiente comprobar que una consulta comience con `SELECT`.

Una consulta aparentemente de lectura puede contener operaciones peligrosas o acceder a información no autorizada.

Se recomienda:

- Utilizar un usuario PostgreSQL con permisos exclusivamente de lectura.
- Validar estructuralmente las consultas.
- Restringir las tablas y operaciones permitidas.
- Aplicar límites de tiempo y cantidad de registros.
- Utilizar consultas parametrizadas cuando corresponda.

**Importante:** el SQL generado por Gemini debe considerarse entrada no confiable. El cliente no debe ejecutar automáticamente cualquier consulta generada sin validación.

### 3. Seguridad en Docker

- Utilizar imágenes confiables.
- Mantener las dependencias actualizadas.
- Limitar los permisos del contenedor.
- Evitar exponer puertos innecesarios.
- No incorporar secretos en las imágenes.

### 4. Seguridad de PostgreSQL

Para las conexiones con AWS RDS se recomienda utilizar SSL/TLS con validación del certificado mediante una autoridad certificadora confiable.

No se recomienda utilizar `rejectUnauthorized: false` en producción.

### 5. Control de las herramientas MCP

El servidor MCP constituye una capa de acceso a los recursos externos.

Por eso, cada herramienta debe tener responsabilidades y permisos claramente definidos.

En este proyecto, la herramienta de consulta SELECT debe permanecer limitada a operaciones de lectura.

---

## ☁️ Evolución hacia AWS

La arquitectura contempla una futura migración hacia servicios administrados de Amazon Web Services.

Esta sección describe una arquitectura objetivo, no implica que el despliegue en AWS ya esté realizado.

### 1. Amazon RDS

Amazon RDS permite utilizar PostgreSQL como servicio administrado.

Configuración de referencia:

- Motor: PostgreSQL.
- Puerto: `5432`.
- Acceso: restringido mediante Security Groups.
- Conexión: cifrada mediante SSL/TLS.

Para conectar el servidor MCP:

1. Crear una instancia de PostgreSQL en RDS.
2. Obtener el endpoint.
3. Configurar las reglas de entrada del Security Group.
4. Autorizar únicamente los recursos que necesiten acceder.
5. Actualizar las variables de entorno.

Ejemplo:

```ini
DB_USER=postgres
DB_HOST=mi-instancia.xxxxxxxxx.us-east-1.rds.amazonaws.com
DB_NAME=postgres
DB_PASSWORD=tu_password_seguro
DB_PORT=5432
DB_SSL=true
```

La configuración SSL debe validar el certificado del servidor mediante una CA confiable.

### 2. Amazon ECR

Amazon Elastic Container Registry permite almacenar imágenes Docker en un repositorio privado.

Flujo general:

1. Crear un repositorio ECR.
2. Autenticarse utilizando AWS CLI.
3. Construir la imagen Docker.
4. Etiquetar la imagen con la URI del repositorio.
5. Publicar la imagen utilizando `docker push`.

### 3. Amazon ECS con Fargate

Una posible evolución consiste en utilizar Amazon ECS con AWS Fargate para ejecutar el servidor MCP sin administrar directamente servidores físicos o máquinas virtuales.

Arquitectura objetivo:

```text
                ┌─────────────────────┐
                │       USUARIO       │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │ CLIENTE ORQUESTADOR │
                │    Gemini + MCP     │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │    AWS ECS /        │
                │     FARGATE         │
                │                     │
                │     Servidor MCP    │
                └──────────┬──────────┘
                           │
                           │ SSL/TLS
                           ▼
                ┌─────────────────────┐
                │      AWS RDS        │
                │                     │
                │     PostgreSQL      │
                └─────────────────────┘

                ┌─────────────────────┐
                │      AWS ECR        │
                │                     │
                │  Imagen Docker MCP  │
                └─────────────────────┘
```

**Consideración de despliegue:** el transporte STDIO utilizado actualmente funciona porque el cliente inicia el contenedor MCP como un proceso local. Si se despliega el servidor MCP en ECS/Fargate y el cliente queda fuera de ese contenedor, será necesario implementar un transporte de comunicación remoto compatible con la arquitectura elegida, en lugar de mantener el mismo transporte STDIO local.

---

## 📈 Posibles mejoras futuras

El proyecto constituye una base para incorporar capacidades más avanzadas de orquestación.

Algunas mejoras posibles son:

- Implementar soporte para múltiples herramientas MCP.
- Permitir que Gemini ejecute varias herramientas en una misma solicitud.
- Incorporar ciclos de decisión y ejecución hasta completar una tarea.
- Agregar validación avanzada de consultas SQL.
- Implementar control de permisos por herramienta.
- Incorporar logs y trazabilidad de las decisiones de la IA.
- Implementar límites de ejecución y manejo de errores.
- Incorporar nuevas fuentes de datos.
- Desarrollar una API para consumir el orquestador desde otras aplicaciones.
- Migrar el servidor MCP hacia infraestructura cloud.

---

## 👨‍💻 Autor

Proyecto desarrollado como laboratorio técnico para explorar la integración de modelos de lenguaje con bases de datos relacionales, herramientas externas y arquitecturas cloud.

**Tecnologías principales:** TypeScript, Node.js, Docker, PostgreSQL, Model Context Protocol, Google Gemini y AWS.

**Repositorio:** [TahielLC/mcp-local](https://github.com/TahielLC/mcp-local)

---
