# Semillas de las bases de datos

Datos de ejemplo del supermercado con los que arrancan las bases de datos en Docker.
El frontend **no** lee estos archivos: todo lo obtiene de los microservicios.

`python3 docker/generar-datos-iniciales.py` convierte estos JSON en
`docker/<servicio>/datos-iniciales.sql`, que cada microservicio ejecuta al iniciar
(después de que Hibernate crea las tablas). Los IDs coinciden entre servicios.

| Archivo | Va a |
|---|---|
| `productos.json`, `proveedores.json`, `usuarios.json` | bd_proveedores |
| `requisiciones.json`, `solicitudesCotizacion.json`, `ofertas.json` | bd_cotizaciones |
| `ordenesCompra.json` | bd_ordenes |
| `recepciones.json` | bd_recepcion |

Las fechas están escritas respecto al 21/11/2026 y en SQL se convierten en fechas
relativas a hoy (`CURRENT_DATE ± n`), para que los plazos sigan vigentes.

Para volver a cargarlas desde cero: `docker compose down -v && docker compose up -d`.
