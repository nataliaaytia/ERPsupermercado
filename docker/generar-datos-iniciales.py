"""
Genera los datos iniciales de cada base de datos a partir de los JSON de
docker/semillas, para que los IDs coincidan entre servicios.

    python3 docker/generar-datos-iniciales.py

Crea:
    docker/proveedores/datos-iniciales.sql
    docker/cotizaciones/datos-iniciales.sql
    docker/ordenes/datos-iniciales.sql
    docker/recepcion/datos-iniciales.sql

Cada script se ejecuta al iniciar su microservicio (después de que Hibernate
crea las tablas) y es idempotente: no duplica registros si ya existen.
"""
import json
import subprocess
from datetime import date
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
DATA = Path(__file__).resolve().parent / "semillas"
DOCKER = Path(__file__).resolve().parent
REFERENCIA = date(2026, 11, 21)  # las fechas de las semillas están escritas respecto a este día


def cargar(nombre):
    return json.loads((DATA / nombre).read_text(encoding="utf-8"))


def texto(valor):
    if valor is None:
        return "NULL"
    return "'" + str(valor).replace("'", "''") + "'"


def fecha(iso):
    """Fecha relativa a hoy (las fechas del JSON están escritas respecto a REFERENCIA)."""
    dias = (date.fromisoformat(iso[:10]) - REFERENCIA).days
    return f"CURRENT_DATE + {dias}" if dias >= 0 else f"CURRENT_DATE - {-dias}"


def fecha_hora(iso):
    hora = iso[11:19] if len(iso) > 10 else "12:00:00"
    return f"({fecha(iso)} + TIME '{hora}')"


def bcrypt(contrasena):
    salida = subprocess.run(
        ["htpasswd", "-bnBC", "10", "", contrasena], capture_output=True, text=True, check=True
    ).stdout
    return salida.strip().lstrip(":")


def secuencias(tablas):
    lineas = ["", "-- Las secuencias continúan después de los IDs insertados."]
    for tabla, columna in tablas:
        lineas.append(
            f"SELECT setval(pg_get_serial_sequence('{tabla}', '{columna}'), "
            f"(SELECT COALESCE(MAX({columna}), 1) FROM {tabla}));"
        )
    return lineas


def guardar(servicio, lineas):
    destino = DOCKER / servicio / "datos-iniciales.sql"
    destino.parent.mkdir(parents=True, exist_ok=True)
    cabecera = [
        "-- Generado por docker/generar-datos-iniciales.py. No editar a mano.",
        "-- Se ejecuta al iniciar el microservicio (después de que Hibernate crea las tablas).",
        "-- Es idempotente: si los registros ya existen, no se duplican.",
        "",
    ]
    destino.write_text("\n".join(cabecera + lineas) + "\n", encoding="utf-8")
    print(f"Generado {destino.relative_to(RAIZ)}")


productos = cargar("productos.json")
proveedores = cargar("proveedores.json")
usuarios = cargar("usuarios.json")
requisiciones = cargar("requisiciones.json")
solicitudes = cargar("solicitudesCotizacion.json")
ofertas = cargar("ofertas.json")
ordenes = cargar("ordenesCompra.json")
recepciones = cargar("recepciones.json")

ROLES = {"Responsable de Facturación/Pagos": "Responsable de Facturación"}

# ---------------------------------------------------------------- proveedores
lineas = []
precios = {}
for proveedor in proveedores:
    for item in proveedor["catalogo"]:
        precios[item["idProducto"]] = min(precios.get(item["idProducto"], 10**9), item["precioPactado"])

for p in productos:
    lineas.append(
        "INSERT INTO productos (id_producto, codigo_sku, descripcion, categoria, unidad, precio_referencial, estado) "
        f"VALUES ({p['idProducto']}, {texto(p['sku'])}, {texto(p['nombre'])}, {texto(p['categoria'])}, "
        f"{texto(p['unidadMedida'])}, {precios.get(p['idProducto'], 0)}, 'Activo') ON CONFLICT (id_producto) DO NOTHING;"
    )
lineas.append("")
id_catalogo = 0
id_documento = 0
for pr in proveedores:
    # Los proveedores activos se dejan validados para poder invitarlos a cotizar.
    validado = "true" if pr["estado"] == "Activo" else "false"
    lineas.append(
        "INSERT INTO proveedores (id_proveedor, nit_ruc, razon_social, direccion, telefono, correo, estado, validado, "
        "fecha_validacion, fecha_creacion) "
        f"VALUES ({pr['idProveedor']}, {texto(pr['nitRuc'])}, {texto(pr['razonSocial'])}, {texto(pr['direccion'])}, "
        f"{texto(pr['telefono'])}, {texto(pr['correo'])}, {texto(pr['estado'])}, {validado}, NOW(), NOW()) "
        "ON CONFLICT (id_proveedor) DO NOTHING;"
    )
    for item in pr["catalogo"]:
        id_catalogo += 1
        lineas.append(
            "INSERT INTO catalogo_comercial (id_catalogo, id_proveedor, id_producto, fecha_inicio, fecha_fin, condiciones, archivo, precio) "
            f"VALUES ({id_catalogo}, {pr['idProveedor']}, {item['idProducto']}, CURRENT_DATE - 30, CURRENT_DATE + 365, "
            f"{texto('Entrega: ' + item['tiempoEntregaEstimado'])}, 'catalogo.pdf', {item['precioPactado']}) "
            "ON CONFLICT (id_catalogo) DO NOTHING;"
        )
    for doc in pr["documentos"]:
        id_documento += 1
        lineas.append(
            "INSERT INTO documentos_proveedor (id_documento, id_proveedor, tipo_documento, numero_documento, fecha_vencimiento, archivo) "
            f"VALUES ({id_documento}, {pr['idProveedor']}, {texto(doc['tipoDocumento'])}, {texto(doc['numeroDocumento'])}, "
            f"{fecha(doc['fechaVencimiento'])}, {texto(doc['archivo'])}) ON CONFLICT (id_documento) DO NOTHING;"
        )
lineas.append("")
for u in usuarios:
    lineas.append(
        "INSERT INTO usuarios (id_usuario, username, password, rol, estado, fecha_creacion) "
        f"VALUES ({u['idUsuario']}, {texto(u['usuario'])}, {texto(bcrypt(u['contrasena']))}, "
        f"{texto(ROLES.get(u['rol'], u['rol']))}, 'Activo', NOW()) ON CONFLICT (id_usuario) DO NOTHING;"
    )
lineas += secuencias([
    ("productos", "id_producto"),
    ("proveedores", "id_proveedor"),
    ("catalogo_comercial", "id_catalogo"),
    ("documentos_proveedor", "id_documento"),
    ("usuarios", "id_usuario"),
])
guardar("proveedores", lineas)

# -------------------------------------------------------------- cotizaciones
lineas = []
id_detalle_req = 0
cantidades = {}  # (idRequisicion, idProducto) -> cantidad
for r in requisiciones:
    lineas.append(
        "INSERT INTO requisiciones (id_requisicion, fecha, prioridad, estado, solicitante, observacion, origen) "
        f"VALUES ({r['idRequisicion']}, {fecha(r['fecha'])}, {texto(r['prioridad'].upper())}, {texto(r['estado'].upper())}, "
        f"{texto(r['solicitante'])}, {texto(r['observacion'])}, 'MANUAL') ON CONFLICT (id_requisicion) DO NOTHING;"
    )
    for d in r["detalles"]:
        id_detalle_req += 1
        cantidades[(r["idRequisicion"], d["producto"]["idProducto"])] = d["cantidad"]
        lineas.append(
            "INSERT INTO detalles_requisicion (id_detalle, id_requisicion, producto_id, cantidad, observacion) "
            f"VALUES ({id_detalle_req}, {r['idRequisicion']}, {d['producto']['idProducto']}, {d['cantidad']}, "
            f"{texto(d['observacion'])}) ON CONFLICT (id_detalle) DO NOTHING;"
        )
lineas.append("")
id_seleccion = 0
requisicion_de = {}
for s in solicitudes:
    requisicion_de[s["idSolicitud"]] = s["requisicion"]
    lineas.append(
        "INSERT INTO solicitudes_cotizacion (id_solicitud, fecha, fecha_limite, estado, id_requisicion) "
        f"VALUES ({s['idSolicitud']}, {fecha(s['fecha'])}, {fecha(s['fechaLimite'])}, {texto(s['estado'].upper())}, "
        f"{s['requisicion']}) ON CONFLICT (id_solicitud) DO NOTHING;"
    )
    for id_proveedor in s["proveedoresIds"]:
        id_seleccion += 1
        lineas.append(
            "INSERT INTO solicitudes_proveedores (id_seleccion, id_solicitud, proveedor_id) "
            f"VALUES ({id_seleccion}, {s['idSolicitud']}, {id_proveedor}) ON CONFLICT (id_seleccion) DO NOTHING;"
        )
lineas.append("")
id_detalle_oferta = 0
for o in ofertas:
    lineas.append(
        "INSERT INTO ofertas_proveedor (id_oferta, proveedor_id, id_solicitud, fecha, validez, estado) "
        f"VALUES ({o['idOferta']}, {o['proveedor']['idProveedor']}, {o['solicitud']}, {fecha(o['fecha'])}, "
        f"{fecha(o['validez'])}, {texto(o['estado'].upper())}) ON CONFLICT (id_oferta) DO NOTHING;"
    )
    for d in o["detalles"]:
        id_detalle_oferta += 1
        cantidad = cantidades[(requisicion_de[o["solicitud"]], d["producto"]["idProducto"])]
        lineas.append(
            "INSERT INTO detalles_oferta (id_detalle, id_oferta, producto_id, cantidad, precio, plazo_entrega) "
            f"VALUES ({id_detalle_oferta}, {o['idOferta']}, {d['producto']['idProducto']}, {cantidad}, {d['precio']}, "
            f"{d['plazoEntrega']}) ON CONFLICT (id_detalle) DO NOTHING;"
        )
lineas += secuencias([
    ("requisiciones", "id_requisicion"),
    ("detalles_requisicion", "id_detalle"),
    ("solicitudes_cotizacion", "id_solicitud"),
    ("solicitudes_proveedores", "id_seleccion"),
    ("ofertas_proveedor", "id_oferta"),
    ("detalles_oferta", "id_detalle"),
])
guardar("cotizaciones", lineas)

# ------------------------------------------------------------------- órdenes
# En el backend el precio de la orden es el de la oferta (sin descuento),
# y el estado "Confirmada" del front se llama ACEPTADA_PROVEEDOR.
ESTADOS_ORDEN = {
    "Borrador": "BORRADOR",
    "Pendiente de aprobación": "PENDIENTE_APROBACION",
    "Aprobada": "APROBADA",
    "Enviada": "ENVIADA",
    "Confirmada": "ACEPTADA_PROVEEDOR",
    "Rechazada": "RECHAZADA_PROVEEDOR",
    "Anulada": "ANULADA",
    "Cerrada": "CERRADA",
}
oferta_por_id = {o["idOferta"]: o for o in ofertas}
lineas = []
id_detalle_oc = 0
id_historial = 0
id_respuesta = 0
for oc in ordenes:
    oferta = oferta_por_id[oc["idOfertaOrigen"]]
    detalles = []
    for d in oc["detalles"]:
        precio = next(x["precio"] for x in oferta["detalles"] if x["producto"]["idProducto"] == d["producto"]["idProducto"])
        detalles.append((d["producto"]["idProducto"], d["cantidad"], precio, round(precio * d["cantidad"], 2)))
    total = round(sum(x[3] for x in detalles), 2)
    logistica = oc.get("condicionesLogisticas") or {}
    lineas.append(
        "INSERT INTO orden_compra (id_orden, id_oferta, proveedor_id, numero, fecha, estado, total, observacion, "
        "destino_entrega, horario_entrega, responsable_entrega, aprobado_por, fecha_aprobacion) "
        f"VALUES ({oc['idOrden']}, {oc['idOfertaOrigen']}, {oferta['proveedor']['idProveedor']}, {texto(oc['numero'])}, "
        f"{fecha(oc['fecha'])}, {texto(ESTADOS_ORDEN[oc['estado']])}, {total}, {texto(oc['observacion'])}, "
        f"{texto(logistica.get('destino'))}, {texto(logistica.get('horario'))}, {texto(logistica.get('responsableEntrega'))}, "
        f"'jefe', {fecha_hora(oc['fecha'])}) ON CONFLICT (id_orden) DO NOTHING;"
    )
    for producto, cantidad, precio, subtotal in detalles:
        id_detalle_oc += 1
        lineas.append(
            "INSERT INTO detalle_orden_compra (id_detalle, id_orden, producto_id, cantidad, precio, subtotal) "
            f"VALUES ({id_detalle_oc}, {oc['idOrden']}, {producto}, {cantidad}, {precio}, {subtotal}) "
            "ON CONFLICT (id_detalle) DO NOTHING;"
        )
    for h in oc.get("historialEstados", []):
        id_historial += 1
        lineas.append(
            "INSERT INTO historial_estado_orden_compra (id_historial, id_orden, estado_anterior, estado_nuevo, responsable, "
            "fecha_cambio, observacion) "
            f"VALUES ({id_historial}, {oc['idOrden']}, {texto(ESTADOS_ORDEN.get(h['estadoAnterior']))}, "
            f"{texto(ESTADOS_ORDEN[h['estadoNuevo']])}, {texto(h['usuario'])}, {fecha_hora(h['fecha'])}, "
            f"{texto(h['observacion'])}) ON CONFLICT (id_historial) DO NOTHING;"
        )
    respuesta = oc.get("respuestaProveedor")
    if respuesta:
        id_respuesta += 1
        lineas.append(
            "INSERT INTO respuesta_proveedor_orden_compra (id_respuesta, id_orden, respuesta, referencia, origen, observacion, "
            "fecha_respuesta) "
            f"VALUES ({id_respuesta}, {oc['idOrden']}, "
            f"{texto('ACEPTADA' if respuesta['estado'] == 'Confirmada' else 'RECHAZADA')}, {texto(respuesta['referencia'])}, "
            f"'CORREO', {texto(respuesta['observacion'])}, {fecha_hora(respuesta['fecha'])}) "
            "ON CONFLICT (id_respuesta) DO NOTHING;"
        )
lineas += secuencias([
    ("orden_compra", "id_orden"),
    ("detalle_orden_compra", "id_detalle"),
    ("historial_estado_orden_compra", "id_historial"),
    ("respuesta_proveedor_orden_compra", "id_respuesta"),
])
guardar("ordenes", lineas)

# ----------------------------------------------------------------- recepción
# idDetalleOrden del front → producto de la orden (el backend trabaja por producto).
producto_de_detalle = {
    (oc["idOrden"], d["idDetalle"]): d["producto"]["idProducto"] for oc in ordenes for d in oc["detalles"]
}
validadas = {v["idRecepcion"] for v in recepciones["recepcionesValidadas"]}
inspeccionadas = {
    (i["idRecepcion"], d["idDetalleOrden"]): d
    for i in recepciones["inspeccionesCalidad"]
    for d in i["detalles"]
}
lineas = []
id_detalle_rec = 0
id_inspeccion = 0
for r in recepciones["recepcionesRegistradas"]:
    estado = "AUTORIZADA" if r["idRecepcion"] in validadas else "PENDIENTE_INSPECCION"
    lineas.append(
        "INSERT INTO recepcion (id_recepcion, id_orden, fecha, almacen, estado, observacion, documento) "
        f"VALUES ({r['idRecepcion']}, {r['idOrden']}, {fecha(r['fecha'])}, 'Almacén central', {texto(estado)}, "
        f"'Entrega parcial', {texto(r['documento'].upper())}) ON CONFLICT (id_recepcion) DO NOTHING;"
    )
    for d in r["detalles"]:
        id_detalle_rec += 1
        inspeccion = inspeccionadas.get((r["idRecepcion"], d["idDetalleOrden"]))
        aceptada = inspeccion["cantidadConforme"] if inspeccion else 0
        lineas.append(
            "INSERT INTO detalle_recepcion (id_detalle, id_recepcion, producto_id, cantidad_recibida, cantidad_aceptada) "
            f"VALUES ({id_detalle_rec}, {r['idRecepcion']}, {producto_de_detalle[(r['idOrden'], d['idDetalleOrden'])]}, "
            f"{d['cantidadRecibida']}, {aceptada}) ON CONFLICT (id_detalle) DO NOTHING;"
        )
        if inspeccion:
            id_inspeccion += 1
            resultado = "CONFORME" if inspeccion["cantidadRechazada"] == 0 else "CONFORME_PARCIAL"
            lineas.append(
                "INSERT INTO inspeccion_calidad (id_inspeccion, id_detalle, fecha, resultado, observacion) "
                f"VALUES ({id_inspeccion}, {id_detalle_rec}, {fecha(r['fecha'])}, {texto(resultado)}, "
                "'Inspección registrada') ON CONFLICT (id_inspeccion) DO NOTHING;"
            )
lineas += secuencias([
    ("recepcion", "id_recepcion"),
    ("detalle_recepcion", "id_detalle"),
    ("inspeccion_calidad", "id_inspeccion"),
])
guardar("recepcion", lineas)
