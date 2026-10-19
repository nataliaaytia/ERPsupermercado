
package com.sonic.erp.cotizaciones.service;

import com.sonic.erp.cotizaciones.entity.OfertaProveedor;
import com.sonic.erp.cotizaciones.entity.DetalleOferta;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class OfertaValidacionService {

    public List<String> validar(OfertaProveedor oferta) {

        List<String> errores = new ArrayList<>();

        if (oferta == null) {
            errores.add("La oferta es obligatoria");
            return errores;
        }

        if (oferta.getProveedorId() == null
                || oferta.getProveedorId() <= 0) {
            errores.add("El proveedor es obligatorio");
        }

        if (oferta.getSolicitud() == null) {
            errores.add("La solicitud de cotización es obligatoria");
        }

        if (oferta.getFecha() == null) {
            errores.add("La fecha de la oferta es obligatoria");
        }

        if (oferta.getValidez() == null) {
            errores.add("La fecha de validez es obligatoria");
        }

        if (oferta.getFecha() != null
                && oferta.getValidez() != null
                && oferta.getValidez().isBefore(oferta.getFecha())) {
            errores.add(
                    "La validez no puede ser anterior a la fecha de la oferta"
            );
        }

        if (oferta.getDetalles() == null
                || oferta.getDetalles().isEmpty()) {

            errores.add("La oferta debe contener al menos un producto");

        } else {

            for (int i = 0; i < oferta.getDetalles().size(); i++) {

                DetalleOferta detalle = oferta.getDetalles().get(i);
                int numero = i + 1;

                if (detalle == null) {
                    errores.add("El detalle " + numero + " es obligatorio");
                    continue;
                }

                if (detalle.getProductoId() == null
                        || detalle.getProductoId() <= 0) {
                    errores.add(
                            "El producto del detalle " + numero + " es obligatorio"
                    );
                }

                if (detalle.getPrecio() == null
                        || detalle.getPrecio().compareTo(BigDecimal.ZERO) <= 0) {
                    errores.add(
                            "El precio del detalle " + numero
                                    + " debe ser mayor que cero"
                    );
                }

                if (detalle.getPlazoEntrega() == null
                        || detalle.getPlazoEntrega() < 0) {
                    errores.add(
                            "El plazo de entrega del detalle " + numero
                                    + " no es válido"
                    );
                }
            }
        }

        return errores;
    }
}
