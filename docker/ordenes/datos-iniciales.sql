-- Generado por docker/generar-datos-iniciales.py. No editar a mano.
-- Se ejecuta al iniciar el microservicio (después de que Hibernate crea las tablas).
-- Es idempotente: si los registros ya existen, no se duplican.

INSERT INTO orden_compra (id_orden, id_oferta, proveedor_id, numero, fecha, estado, total, observacion, destino_entrega, horario_entrega, responsable_entrega, aprobado_por, fecha_aprobacion) VALUES (1, 3, 2, 'OC-0001', CURRENT_DATE - 8, 'ACEPTADA_PROVEEDOR', 3570.0, 'Orden generada desde la oferta adjudicada a Lácteos del Valle S.A.', 'Almacén central - Av. Buenos Aires #500', 'Lunes a sábado, 06:00 a 08:00', 'Carlos Mamani', 'jefe', (CURRENT_DATE - 8 + TIME '12:00:00')) ON CONFLICT (id_orden) DO NOTHING;
INSERT INTO detalle_orden_compra (id_detalle, id_orden, producto_id, cantidad, precio, subtotal) VALUES (1, 1, 4, 300, 7.5, 2250.0) ON CONFLICT (id_detalle) DO NOTHING;
INSERT INTO detalle_orden_compra (id_detalle, id_orden, producto_id, cantidad, precio, subtotal) VALUES (2, 1, 5, 120, 11.0, 1320.0) ON CONFLICT (id_detalle) DO NOTHING;
INSERT INTO historial_estado_orden_compra (id_historial, id_orden, estado_anterior, estado_nuevo, responsable, fecha_cambio, observacion) VALUES (1, 1, NULL, 'BORRADOR', 'Comprador', (CURRENT_DATE - 8 + TIME '09:10:00'), 'Orden creada desde la oferta adjudicada.') ON CONFLICT (id_historial) DO NOTHING;
INSERT INTO historial_estado_orden_compra (id_historial, id_orden, estado_anterior, estado_nuevo, responsable, fecha_cambio, observacion) VALUES (2, 1, 'BORRADOR', 'PENDIENTE_APROBACION', 'Comprador', (CURRENT_DATE - 8 + TIME '09:30:00'), 'Se solicitó la aprobación.') ON CONFLICT (id_historial) DO NOTHING;
INSERT INTO historial_estado_orden_compra (id_historial, id_orden, estado_anterior, estado_nuevo, responsable, fecha_cambio, observacion) VALUES (3, 1, 'PENDIENTE_APROBACION', 'APROBADA', 'Jefe de compras', (CURRENT_DATE - 8 + TIME '11:00:00'), 'Monto dentro del rango autorizado.') ON CONFLICT (id_historial) DO NOTHING;
INSERT INTO historial_estado_orden_compra (id_historial, id_orden, estado_anterior, estado_nuevo, responsable, fecha_cambio, observacion) VALUES (4, 1, 'APROBADA', 'ENVIADA', 'Comprador', (CURRENT_DATE - 8 + TIME '11:20:00'), 'Enviada por correo electrónico.') ON CONFLICT (id_historial) DO NOTHING;
INSERT INTO historial_estado_orden_compra (id_historial, id_orden, estado_anterior, estado_nuevo, responsable, fecha_cambio, observacion) VALUES (5, 1, 'ENVIADA', 'ACEPTADA_PROVEEDOR', 'Comprador', (CURRENT_DATE - 7 + TIME '08:45:00'), 'El proveedor aceptó la orden.') ON CONFLICT (id_historial) DO NOTHING;
INSERT INTO respuesta_proveedor_orden_compra (id_respuesta, id_orden, respuesta, referencia, origen, observacion, fecha_respuesta) VALUES (1, 1, 'ACEPTADA', 'LDV-PED-8841', 'CORREO', 'Se confirma la entrega según compromisos.', (CURRENT_DATE - 7 + TIME '12:00:00')) ON CONFLICT (id_respuesta) DO NOTHING;

-- Las secuencias continúan después de los IDs insertados.
SELECT setval(pg_get_serial_sequence('orden_compra', 'id_orden'), (SELECT COALESCE(MAX(id_orden), 1) FROM orden_compra));
SELECT setval(pg_get_serial_sequence('detalle_orden_compra', 'id_detalle'), (SELECT COALESCE(MAX(id_detalle), 1) FROM detalle_orden_compra));
SELECT setval(pg_get_serial_sequence('historial_estado_orden_compra', 'id_historial'), (SELECT COALESCE(MAX(id_historial), 1) FROM historial_estado_orden_compra));
SELECT setval(pg_get_serial_sequence('respuesta_proveedor_orden_compra', 'id_respuesta'), (SELECT COALESCE(MAX(id_respuesta), 1) FROM respuesta_proveedor_orden_compra));
