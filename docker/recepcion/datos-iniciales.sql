-- Generado por docker/generar-datos-iniciales.py. No editar a mano.
-- Se ejecuta al iniciar el microservicio (después de que Hibernate crea las tablas).
-- Es idempotente: si los registros ya existen, no se duplican.

INSERT INTO recepcion (id_recepcion, id_orden, fecha, almacen, estado, observacion, documento) VALUES (1, 1, CURRENT_DATE - 2, 'Almacén central', 'AUTORIZADA', 'Entrega parcial', 'REM-LDV-0412') ON CONFLICT (id_recepcion) DO NOTHING;
INSERT INTO detalle_recepcion (id_detalle, id_recepcion, producto_id, cantidad_recibida, cantidad_aceptada) VALUES (1, 1, 4, 100, 100) ON CONFLICT (id_detalle) DO NOTHING;
INSERT INTO inspeccion_calidad (id_inspeccion, id_detalle, fecha, resultado, observacion) VALUES (1, 1, CURRENT_DATE - 2, 'CONFORME', 'Inspección registrada') ON CONFLICT (id_inspeccion) DO NOTHING;

-- Las secuencias continúan después de los IDs insertados.
SELECT setval(pg_get_serial_sequence('recepcion', 'id_recepcion'), (SELECT COALESCE(MAX(id_recepcion), 1) FROM recepcion));
SELECT setval(pg_get_serial_sequence('detalle_recepcion', 'id_detalle'), (SELECT COALESCE(MAX(id_detalle), 1) FROM detalle_recepcion));
SELECT setval(pg_get_serial_sequence('inspeccion_calidad', 'id_inspeccion'), (SELECT COALESCE(MAX(id_inspeccion), 1) FROM inspeccion_calidad));
