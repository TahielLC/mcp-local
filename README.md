# 🚀 Arquitectura Híbrida: Servidor MCP + PostgreSQL en AWS + Gemini AI

Este repositorio contiene una implementación completa de una arquitectura de integración basada en el **Model Context Protocol (MCP)**. El proyecto demuestra cómo un modelo de lenguaje (LLM) puede interactuar de forma segura y controlada con una base de datos relacional empresarial.

El sistema orquesta la extracción de datos desde PostgreSQL mediante un servidor MCP ejecutado en un contenedor Docker, para posteriormente procesar esos datos utilizando la API de Google Gemini en un flujo de análisis corporativo.

La arquitectura está diseñada para ejecutarse tanto en entornos de desarrollo local como en infraestructuras cloud, utilizando servicios de **AWS RDS** y **AWS ECR**.

---

## 📑 Tabla de contenidos

1. [Características principales](#-características-principales)
2. [Arquitectura del sistema](#-arquitectura-del-sistema)
3. [Stack tecnológico](#️-stack-tecnológico)
4. [Requisitos previos](#-requisitos-previos)
5. [Estructura del proyecto](#-estructura-del-proyecto)
6. [Instalación y configuración](#-instalación-y-configuración)
7. [Ejecución local](#-ejecución-local)
8. [Despliegue en AWS](#️-despliegue-en-aws-producción)
9. [Seguridad y mejores prácticas](#-seguridad-y-mejores-prácticas)
10. [Autor](#-autor)

---

## ✨ Características principales

- **Integración MCP:** Uso del estándar Model Context Protocol para conectar modelos de inteligencia artificial con recursos de datos locales y en la nube.
- **Orquestación con Docker:** El servidor MCP se ejecuta de forma aislada e interactúa con el cliente mediante el protocolo STDIO.
- **Arquitectura híbrida:** Soporte para bases de datos locales mediante Docker Compose y bases de datos gestionadas en la nube mediante AWS RDS.
- **Seguridad:** Acceso controlado a la base de datos, consultas de solo lectura, conexiones SSL y gestión de secretos mediante variables de entorno.
- **Procesamiento de lenguaje natural:** Generación automática de reportes corporativos utilizando el modelo `gemini-3.5-flash-lite`.
- **Separación de responsabilidades:** El servidor MCP administra el acceso a los datos, mientras que el cliente orquestador se encarga de comunicarse con Gemini y procesar los resultados.

---

## 🏗️ Arquitectura del sistema

El sistema está compuesto por tres componentes principales:

1. **Base de datos PostgreSQL:** Almacena la información que será consultada por el modelo de inteligencia artificial.
2. **Servidor MCP:** Expone herramientas que permiten consultar la base de datos mediante el protocolo Model Context Protocol.
3. **Cliente orquestador con Gemini AI:** Se conecta al servidor MCP, obtiene los datos y los envía a Gemini para su análisis y generación de respuestas.

El flujo general de ejecución es el siguiente:

```text
                  ┌──────────────────────┐
                  │     CLIENTE MCP      │
                  │   (Node.js / TS)     │
                  └──────────┬───────────┘
                             │
                             │ Protocolo STDIO
                             ▼
                  ┌──────────────────────┐
                  │    SERVIDOR MCP      │
                  │       Docker         │
                  │                      │
                  │ ejecutar_consulta_   │
                  │       select         │
                  └──────────┬───────────┘
                             │
                             │ SQL
                             ▼
                  ┌──────────────────────┐
                  │     PostgreSQL       │
                  │                      │
                  │   Local / AWS RDS    │
                  └──────────────────────┘
                             │
                             │ Datos obtenidos
                             ▼
                  ┌──────────────────────┐
                  │     GOOGLE GEMINI    │
                  │gemini-3.5-flash-lite │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  REPORTE CORPORATIVO │
                  │  Análisis con IA     │
                  └──────────────────────┘
```

---

## 🛠️ Stack tecnológico

| Tecnología             | Función                                   |
| ---------------------- | ----------------------------------------- |
| TypeScript             | Lenguaje de programación                  |
| Node.js                | Entorno de ejecución                      |
| Google Gemini SDK      | Integración con inteligencia artificial   |
| Model Context Protocol | Comunicación entre cliente y servidor MCP |
| PostgreSQL             | Base de datos relacional                  |
| `pg`                   | Cliente de PostgreSQL para Node.js        |
| Docker                 | Contenedorización del servidor MCP        |
| Docker Compose         | Administración del entorno local          |
| AWS RDS                | Base de datos PostgreSQL en la nube       |
| AWS ECR                | Registro privado de imágenes Docker       |
| AWS CLI                | Administración de servicios AWS           |

---

## 📋 Requisitos previos

Antes de ejecutar el proyecto, es necesario contar con las siguientes herramientas:

- [Node.js](https://nodejs.org/) versión 18 o superior.
- [Docker](https://www.docker.com/).
- Docker Compose.
- [Git](https://git-scm.com/).
- Una API Key válida de [Google Gemini](https://aistudio.google.com/).

Para utilizar la infraestructura cloud también se necesita:

- Una cuenta de AWS.
- [AWS CLI](https://aws.amazon.com/cli/) instalado y configurado.
- Permisos para administrar Amazon RDS y Amazon ECR.

---

## 📁 Estructura del proyecto

La organización general del repositorio es la siguiente:

```text
proyecto/
│
├── src/
│   ├── index.ts
│   └── cliente.ts
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

**Descripción de los archivos principales:**

- `src/index.ts`: Implementación del servidor MCP y registro de herramientas para interactuar con PostgreSQL.
- `src/cliente.ts`: Cliente orquestador que se conecta al servidor MCP, obtiene los datos y realiza las consultas a Gemini.
- `Dockerfile`: Define la imagen Docker del servidor MCP.
- `docker-compose.yml`: Configura y levanta los servicios necesarios para el entorno local.
- `.env`: Contiene las credenciales y variables de configuración del entorno.
- `.env.example`: Plantilla de las variables de entorno necesarias.
- `.gitignore`: Evita que archivos sensibles sean incluidos en Git.
- `package.json`: Contiene las dependencias y scripts del proyecto.
- `README.md`: Documentación completa del proyecto.

---

## 🚀 Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/TahielLC/mcp-local.git

cd TU_REPOSITORIO
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

El proyecto utiliza variables de entorno para administrar dinámicamente las credenciales y evitar exponer información sensible dentro del código fuente.

Primero, crear el archivo `.env` a partir de la plantilla:

```bash
cp .env.example .env
```

Luego, editar el archivo `.env` y completar las credenciales correspondientes:

```ini
# Configuración de Base de Datos (Local o AWS RDS)

DB_USER=postgres
DB_HOST=localhost
DB_NAME=postgres
DB_PASSWORD=tu_password_seguro
DB_PORT=5432
DB_SSL=false

# API Keys

GEMINI_API_KEY=tu_api_key_de_gemini
```

**Importante:**

- Para trabajar localmente, utilizar `DB_HOST=localhost` y `DB_SSL=false` según la configuración de Docker Compose.
- Para conectarse a AWS RDS, reemplazar `DB_HOST` por el endpoint de la instancia y configurar SSL correctamente.
- Nunca subir el archivo `.env` a GitHub.
- El archivo `.env.example` debe contener únicamente valores de ejemplo, nunca credenciales reales.

---

## 💻 Ejecución local

Una vez instaladas las dependencias y configuradas las variables de entorno, se puede ejecutar el sistema siguiendo estos pasos.

### 1. Levantar PostgreSQL

Iniciar los servicios definidos en Docker Compose:

```bash
docker compose up -d
```

Verificar que los contenedores estén funcionando:

```bash
docker compose ps
```

### 2. Construir la imagen del servidor MCP

Construir la imagen Docker correspondiente al servidor MCP:

```bash
docker build -t mi-servidor-mcp .
```

Este paso debe repetirse cada vez que se modifique el código del servidor MCP, especialmente `src/index.ts`.

### 3. Ejecutar el cliente orquestador

Ejecutar el siguiente comando:

```bash
npx tsx --env-file=.env src/cliente.ts
```

El cliente realizará el flujo completo:

1. Inicializará el cliente MCP.
2. Levantará un contenedor efímero con el servidor MCP.
3. Establecerá la comunicación mediante STDIO.
4. Ejecutará la herramienta de consulta de PostgreSQL.
5. Obtendrá los datos solicitados.
6. Enviará los resultados a la API de Google Gemini.
7. Procesará la respuesta generada por la inteligencia artificial.
8. Mostrará el reporte corporativo en la terminal.

---

## ☁️ Despliegue en AWS (Producción)

La arquitectura permite migrar desde un entorno local hacia una infraestructura cloud utilizando servicios administrados de Amazon Web Services.

### 1. Amazon RDS

Se puede aprovisionar una instancia administrada de PostgreSQL mediante Amazon RDS.

Configuración de referencia:

- Motor: PostgreSQL.
- Instancia de referencia: `db.t3.micro`.
- Puerto: `5432`.
- Acceso: restringido mediante Security Groups.
- Conexión: cifrada mediante SSL/TLS.

Una vez creada la instancia:

1. Obtener el endpoint de conexión de RDS.
2. Configurar las reglas de entrada del Security Group.
3. Permitir el acceso únicamente desde los recursos autorizados.
4. Actualizar las variables de entorno.

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

Amazon Elastic Container Registry permite almacenar las imágenes Docker del servidor MCP en un repositorio privado.

Flujo general de publicación:

1. Crear un repositorio en Amazon ECR.
2. Autenticarse utilizando AWS CLI.
3. Construir la imagen Docker.
4. Etiquetar la imagen con la URI del repositorio ECR.
5. Publicar la imagen utilizando `docker push`.

La imagen publicada podrá utilizarse posteriormente en servicios de ejecución de contenedores como Amazon ECS con AWS Fargate.

### 3. Arquitectura cloud

En producción, la infraestructura puede evolucionar hacia el siguiente esquema:

```text
             ┌─────────────────────┐
             │  CLIENTE / GEMINI   │
             └──────────┬──────────┘
                        │
                        ▼
             ┌─────────────────────┐
             │   AWS ECS FARGATE   │
             │                     │
             │     Servidor MCP    │
             └──────────┬──────────┘
                        │
                        │ SSL/TLS
                        ▼
             ┌─────────────────────┐
             │      AWS RDS        │
             │                     │
             │    PostgreSQL       │
             └─────────────────────┘

             ┌─────────────────────┐
             │      AWS ECR        │
             │                     │
             │  Imagen Docker MCP  │
             └─────────────────────┘
```

---

## 🔐 Seguridad y mejores prácticas

La seguridad es un componente fundamental de esta arquitectura.

### 1. Gestión de credenciales

- El archivo `.env` debe estar excluido del control de versiones.
- Las claves de API no deben escribirse directamente en el código fuente.
- En producción, se recomienda utilizar AWS Secrets Manager o mecanismos equivalentes de gestión de secretos.

### 2. Validación de consultas SQL

La herramienta `ejecutar_consulta_select`, registrada en el servidor MCP, está diseñada para permitir consultas de lectura sobre PostgreSQL.

La validación debe impedir operaciones de escritura como:

- `INSERT`
- `UPDATE`
- `DELETE`
- `DROP`
- `ALTER`

La comprobación de que una consulta comience con `SELECT` es una validación inicial, pero no constituye por sí sola una protección completa contra SQL injection o consultas peligrosas.

Se recomienda complementar esta validación con:

- Usuario PostgreSQL con permisos exclusivamente de lectura.
- Validación estructural de las consultas.
- Consultas parametrizadas cuando corresponda.
- Restricciones sobre tablas y operaciones permitidas.

### 3. Conexiones seguras

Para las conexiones con AWS RDS se debe utilizar SSL/TLS.

La validación del certificado debe permanecer habilitada mediante una CA confiable. No se recomienda utilizar `rejectUnauthorized: false` en producción, ya que deshabilita la verificación del certificado del servidor.

### 4. Aislamiento mediante Docker

El servidor MCP se ejecuta dentro de un contenedor Docker, proporcionando aislamiento respecto del entorno principal.

Se recomienda:

- Utilizar imágenes confiables.
- Mantener las dependencias actualizadas.
- Limitar los permisos del contenedor.
- Evitar exponer puertos innecesarios.
- No incluir credenciales dentro de la imagen Docker.

---

## 👨‍💻 Autor

Creado como laboratorio técnico para explorar la integración de modelos de lenguaje con infraestructuras cloud, bases de datos relacionales y el protocolo Model Context Protocol (MCP).

**Tecnologías principales:** TypeScript, Node.js, Docker, PostgreSQL, AWS y Google Gemini.

---
