-- Generado por docker/generar-datos-iniciales.py. No editar a mano.
-- Se ejecuta al iniciar el microservicio (después de que Hibernate crea las tablas).
-- Es idempotente: si los registros ya existen, no se duplican.

INSERT INTO requisiciones (id_requisicion, fecha, prioridad, estado, solicitante, observacion, origen) VALUES (1, CURRENT_DATE - 3, 'ALTA', 'PENDIENTE', 'Jefe de Abarrotes', 'Reposición semanal de abarrotes para sucursal central.', 'MANUAL') ON CONFLICT (id_requisicion) DO NOTHING;
INSERT INTO detalles_requisicion (id_detalle, id_requisicion, producto_id, cantidad, observacion) VALUES (1, 1, 1, 200, '') ON CONFLICT (id_detalle) DO NOTHING;
INSERT INTO detalles_requisicion (id_detalle, id_requisicion, producto_id, cantidad, observacion) VALUES (2, 1, 3, 150, '') ON CONFLICT (id_detalle) DO NOTHING;
INSERT INTO requisiciones (id_requisicion, fecha, prioridad, estado, solicitante, observacion, origen) VALUES (2, CURRENT_DATE - 4, 'MEDIA', 'APROBADA', 'Jefe de Limpieza', 'Stock de detergente para promoción de fin de mes.', 'MANUAL') ON CONFLICT (id_requisicion) DO NOTHING;
INSERT INTO detalles_requisicion (id_detalle, id_requisicion, producto_id, cantidad, observacion) VALUES (3, 2, 6, 80, '') ON CONFLICT (id_detalle) DO NOTHING;
INSERT INTO requisiciones (id_requisicion, fecha, prioridad, estado, solicitante, observacion, origen) VALUES (3, CURRENT_DATE - 4, 'BAJA', 'APROBADA', 'Jefe de Limpieza', 'Reposición de papel higiénico para góndola.', 'MANUAL') ON CONFLICT (id_requisicion) DO NOTHING;
INSERT INTO detalles_requisicion (id_detalle, id_requisicion, producto_id, cantidad, observacion) VALUES (4, 3, 7, 120, '') ON CONFLICT (id_detalle) DO NOTHING;
INSERT INTO requisiciones (id_requisicion, fecha, prioridad, estado, solicitante, observacion, origen) VALUES (4, CURRENT_DATE - 7, 'ALTA', 'APROBADA', 'Jefe de Abarrotes', 'Aceite y fideo para campaña de canasta familiar.', 'MANUAL') ON CONFLICT (id_requisicion) DO NOTHING;
INSERT INTO detalles_requisicion (id_detalle, id_requisicion, producto_id, cantidad, observacion) VALUES (5, 4, 2, 240, '') ON CONFLICT (id_detalle) DO NOTHING;
INSERT INTO detalles_requisicion (id_detalle, id_requisicion, producto_id, cantidad, observacion) VALUES (6, 4, 8, 300, '') ON CONFLICT (id_detalle) DO NOTHING;
INSERT INTO requisiciones (id_requisicion, fecha, prioridad, estado, solicitante, observacion, origen) VALUES (5, CURRENT_DATE - 11, 'ALTA', 'APROBADA', 'Jefe de Lácteos', 'Reposición de lácteos para la semana.', 'MANUAL') ON CONFLICT (id_requisicion) DO NOTHING;
INSERT INTO detalles_requisicion (id_detalle, id_requisicion, producto_id, cantidad, observacion) VALUES (7, 5, 4, 300, '') ON CONFLICT (id_detalle) DO NOTHING;
INSERT INTO detalles_requisicion (id_detalle, id_requisicion, producto_id, cantidad, observacion) VALUES (8, 5, 5, 120, '') ON CONFLICT (id_detalle) DO NOTHING;
INSERT INTO requisiciones (id_requisicion, fecha, prioridad, estado, solicitante, observacion, origen) VALUES (6, CURRENT_DATE - 16, 'MEDIA', 'APROBADA', 'Jefe de Abarrotes', 'Arroz para reposición quincenal.', 'MANUAL') ON CONFLICT (id_requisicion) DO NOTHING;
INSERT INTO detalles_requisicion (id_detalle, id_requisicion, producto_id, cantidad, observacion) VALUES (9, 6, 1, 400, '') ON CONFLICT (id_detalle) DO NOTHING;
INSERT INTO requisiciones (id_requisicion, fecha, prioridad, estado, solicitante, observacion, origen) VALUES (7, CURRENT_DATE - 2, 'BAJA', 'PENDIENTE', 'Jefe de Conservas', 'Ok', 'MANUAL') ON CONFLICT (id_requisicion) DO NOTHING;
INSERT INTO detalles_requisicion (id_detalle, id_requisicion, producto_id, cantidad, observacion) VALUES (10, 7, 10, 0, 'Requisición con errores para probar la validación.') ON CONFLICT (id_detalle) DO NOTHING;

INSERT INTO solicitudes_cotizacion (id_solicitud, fecha, fecha_limite, estado, id_requisicion) VALUES (1, CURRENT_DATE - 6, CURRENT_DATE + 7, 'ENVIADA', 4) ON CONFLICT (id_solicitud) DO NOTHING;
INSERT INTO solicitudes_proveedores (id_seleccion, id_solicitud, proveedor_id) VALUES (1, 1, 1) ON CONFLICT (id_seleccion) DO NOTHING;
INSERT INTO solicitudes_proveedores (id_seleccion, id_solicitud, proveedor_id) VALUES (2, 1, 5) ON CONFLICT (id_seleccion) DO NOTHING;
INSERT INTO solicitudes_cotizacion (id_solicitud, fecha, fecha_limite, estado, id_requisicion) VALUES (2, CURRENT_DATE - 10, CURRENT_DATE - 5, 'CERRADA', 5) ON CONFLICT (id_solicitud) DO NOTHING;
INSERT INTO solicitudes_proveedores (id_seleccion, id_solicitud, proveedor_id) VALUES (3, 2, 2) ON CONFLICT (id_seleccion) DO NOTHING;
INSERT INTO solicitudes_cotizacion (id_solicitud, fecha, fecha_limite, estado, id_requisicion) VALUES (3, CURRENT_DATE - 15, CURRENT_DATE - 11, 'CERRADA', 6) ON CONFLICT (id_solicitud) DO NOTHING;
INSERT INTO solicitudes_proveedores (id_seleccion, id_solicitud, proveedor_id) VALUES (4, 3, 1) ON CONFLICT (id_seleccion) DO NOTHING;
INSERT INTO solicitudes_proveedores (id_seleccion, id_solicitud, proveedor_id) VALUES (5, 3, 3) ON CONFLICT (id_seleccion) DO NOTHING;

INSERT INTO ofertas_proveedor (id_oferta, proveedor_id, id_solicitud, fecha, validez, estado) VALUES (1, 1, 1, CURRENT_DATE - 4, CURRENT_DATE + 26, 'REGISTRADA') ON CONFLICT (id_oferta) DO NOTHING;
INSERT INTO detalles_oferta (id_detalle, id_oferta, producto_id, cantidad, precio, plazo_entrega) VALUES (1, 1, 2, 240, 14.8, 2) ON CONFLICT (id_detalle) DO NOTHING;
INSERT INTO detalles_oferta (id_detalle, id_oferta, producto_id, cantidad, precio, plazo_entrega) VALUES (2, 1, 8, 300, 5.4, 3) ON CONFLICT (id_detalle) DO NOTHING;
INSERT INTO ofertas_proveedor (id_oferta, proveedor_id, id_solicitud, fecha, validez, estado) VALUES (2, 5, 1, CURRENT_DATE - 3, CURRENT_DATE + 19, 'REGISTRADA') ON CONFLICT (id_oferta) DO NOTHING;
INSERT INTO detalles_oferta (id_detalle, id_oferta, producto_id, cantidad, precio, plazo_entrega) VALUES (3, 2, 2, 240, 14.2, 5) ON CONFLICT (id_detalle) DO NOTHING;
INSERT INTO detalles_oferta (id_detalle, id_oferta, producto_id, cantidad, precio, plazo_entrega) VALUES (4, 2, 8, 300, 5.1, 5) ON CONFLICT (id_detalle) DO NOTHING;
INSERT INTO ofertas_proveedor (id_oferta, proveedor_id, id_solicitud, fecha, validez, estado) VALUES (3, 2, 2, CURRENT_DATE - 9, CURRENT_DATE + 21, 'SELECCIONADA') ON CONFLICT (id_oferta) DO NOTHING;
INSERT INTO detalles_oferta (id_detalle, id_oferta, producto_id, cantidad, precio, plazo_entrega) VALUES (5, 3, 4, 300, 7.5, 1) ON CONFLICT (id_detalle) DO NOTHING;
INSERT INTO detalles_oferta (id_detalle, id_oferta, producto_id, cantidad, precio, plazo_entrega) VALUES (6, 3, 5, 120, 11.0, 1) ON CONFLICT (id_detalle) DO NOTHING;
INSERT INTO ofertas_proveedor (id_oferta, proveedor_id, id_solicitud, fecha, validez, estado) VALUES (4, 1, 3, CURRENT_DATE - 14, CURRENT_DATE + 16, 'SELECCIONADA') ON CONFLICT (id_oferta) DO NOTHING;
INSERT INTO detalles_oferta (id_detalle, id_oferta, producto_id, cantidad, precio, plazo_entrega) VALUES (7, 4, 1, 400, 9.5, 2) ON CONFLICT (id_detalle) DO NOTHING;
INSERT INTO ofertas_proveedor (id_oferta, proveedor_id, id_solicitud, fecha, validez, estado) VALUES (5, 3, 3, CURRENT_DATE - 13, CURRENT_DATE + 17, 'RECHAZADA') ON CONFLICT (id_oferta) DO NOTHING;
INSERT INTO detalles_oferta (id_detalle, id_oferta, producto_id, cantidad, precio, plazo_entrega) VALUES (8, 5, 1, 400, 9.1, 5) ON CONFLICT (id_detalle) DO NOTHING;

-- Las secuencias continúan después de los IDs insertados.
SELECT setval(pg_get_serial_sequence('requisiciones', 'id_requisicion'), (SELECT COALESCE(MAX(id_requisicion), 1) FROM requisiciones));
SELECT setval(pg_get_serial_sequence('detalles_requisicion', 'id_detalle'), (SELECT COALESCE(MAX(id_detalle), 1) FROM detalles_requisicion));
SELECT setval(pg_get_serial_sequence('solicitudes_cotizacion', 'id_solicitud'), (SELECT COALESCE(MAX(id_solicitud), 1) FROM solicitudes_cotizacion));
SELECT setval(pg_get_serial_sequence('solicitudes_proveedores', 'id_seleccion'), (SELECT COALESCE(MAX(id_seleccion), 1) FROM solicitudes_proveedores));
SELECT setval(pg_get_serial_sequence('ofertas_proveedor', 'id_oferta'), (SELECT COALESCE(MAX(id_oferta), 1) FROM ofertas_proveedor));
SELECT setval(pg_get_serial_sequence('detalles_oferta', 'id_detalle'), (SELECT COALESCE(MAX(id_detalle), 1) FROM detalles_oferta));
