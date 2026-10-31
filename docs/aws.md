# Evolución hacia AWS

Esta sección describe una posible evolución de la arquitectura local. No implica que el despliegue en AWS ya esté implementado.

## Amazon RDS

Amazon RDS permite utilizar PostgreSQL como servicio administrado.

Configuración orientativa:

- Motor: PostgreSQL.
- Puerto habitual: `5432`.
- Acceso restringido mediante Security Groups.
- Conexiones cifradas mediante SSL/TLS.

Pasos generales:

1. Crear una instancia PostgreSQL en RDS.
2. Obtener su endpoint.
3. Configurar las reglas de red para permitir únicamente los orígenes autorizados.
4. Configurar las credenciales y los parámetros de conexión.
5. Habilitar TLS y validar el certificado del servidor.

Ejemplo de variables:

```ini
DB_USER=postgres
DB_HOST=mi-instancia.xxxxxxxxx.us-east-1.rds.amazonaws.com
DB_NAME=postgres
DB_PASSWORD=tu_password_seguro
DB_PORT=5432
DB_SSL=true
```

## Amazon ECR

Amazon Elastic Container Registry permite almacenar imágenes Docker en repositorios privados.

Flujo general:

1. Crear un repositorio ECR.
2. Autenticarse con AWS CLI.
3. Construir la imagen del servidor MCP.
4. Etiquetar la imagen con la URI del repositorio.
5. Publicar la imagen mediante `docker push`.

## Amazon ECS con Fargate

ECS con Fargate puede ejecutar el contenedor del servidor MCP sin administrar directamente las máquinas anfitrionas.

### Consideración sobre el transporte

La implementación local inicia el servidor MCP como un proceso hijo de Docker y utiliza STDIO. Si el servidor se despliega en ECS/Fargate y el cliente se ejecuta fuera del contenedor, será necesario adoptar un transporte remoto compatible con esa topología. No basta con trasladar la imagen: también hay que resolver cómo se comunicarán el cliente y el servidor.

## Arquitectura objetivo

```text
             Cliente orquestador
              TypeScript + Gemini
                      |
                      | Transporte remoto
                      v
                Servidor MCP
               ECS / Fargate
                      |
                      | SSL/TLS
                      v
                 Amazon RDS
                  PostgreSQL

                Amazon ECR
             Imagen del servidor
```

La arquitectura definitiva deberá contemplar también autenticación, autorización, gestión de secretos, conectividad privada y observabilidad.
