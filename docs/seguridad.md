# Seguridad y buenas prácticas

La arquitectura permite que una aplicación de IA solicite consultas sobre una base de datos. Por eso, los permisos deben aplicarse en el servidor y en PostgreSQL, no solamente en el prompt del modelo.

## Credenciales

- Excluir `.env` del control de versiones.
- No incluir API Keys ni contraseñas en el código.
- Mantener `.env.example` sin credenciales reales.
- En producción, utilizar un gestor de secretos, por ejemplo AWS Secrets Manager.

## Consultas SQL

La herramienta `ejecutar_consulta_select` está destinada a operaciones de lectura. Sin embargo, comprobar únicamente que el texto comience con `SELECT` no es una defensa suficiente.

Medidas recomendadas:

- Conectar con un usuario PostgreSQL que tenga permisos de solo lectura.
- Restringir el acceso a las tablas y esquemas necesarios.
- Validar estructuralmente las consultas.
- Limitar el tiempo de ejecución y el volumen de resultados.
- Utilizar consultas parametrizadas cuando corresponda.
- Rechazar instrucciones múltiples y operaciones no permitidas.

El SQL generado por Gemini debe considerarse entrada no confiable. La ejecución debe estar sujeta a controles independientes del modelo.

## Docker

- Utilizar imágenes confiables y actualizadas.
- Limitar los permisos del contenedor.
- Evitar publicar puertos que no sean necesarios.
- No incorporar secretos en la imagen.
- Mantener actualizadas las dependencias.

## Conexiones TLS

Para AWS RDS, utilizar SSL/TLS y validar el certificado del servidor mediante una CA confiable. No deshabilitar la verificación del certificado en producción.

## Herramientas MCP

Cada herramienta debe tener una finalidad y permisos definidos. No conceder a una herramienta más acceso del que necesita para cumplir su función.
