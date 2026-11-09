
package com.sonic.erp.ordenesdecompra.service;

import com.sonic.erp.ordenesdecompra.entity.DetalleOrdenCompra;
import com.sonic.erp.ordenesdecompra.entity.OrdenCompra;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;

import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class PdfOrdenCompraService {

    public byte[] generarPdf(OrdenCompra orden) {

        List<String> lineas = new ArrayList<>();

        lineas.add("ORDEN DE COMPRA");
        lineas.add("");
        lineas.add("Numero: " + orden.getNumero());
        lineas.add("Fecha: " + orden.getFecha());
        lineas.add("Proveedor ID: " + orden.getProveedorId());
        lineas.add("Estado: " + orden.getEstado());
        lineas.add("");
        lineas.add("DETALLE DE PRODUCTOS");
        lineas.add("");

        for (DetalleOrdenCompra detalle : orden.getDetalles()) {

            lineas.add(
                    "Producto: " + detalle.getProductoId()
                            + " | Cantidad: " + detalle.getCantidad()
                            + " | Precio: " + detalle.getPrecio()
                            + " | Subtotal: " + detalle.getSubtotal()
            );
        }

        lineas.add("");
        lineas.add("TOTAL: Bs " + orden.getTotal());

        try (
                PDDocument documento = new PDDocument();
                ByteArrayOutputStream salida =
                        new ByteArrayOutputStream()
        ) {

            int indice = 0;

            while (indice < lineas.size()) {

                PDPage pagina = new PDPage(PDRectangle.A4);
                documento.addPage(pagina);

                try (PDPageContentStream contenido =
                             new PDPageContentStream(
                                     documento, pagina)) {

                    contenido.beginText();

                    contenido.setFont(
                            new PDType1Font(
                                    Standard14Fonts.FontName.HELVETICA
                            ),
                            11
                    );

                    contenido.newLineAtOffset(50, 785);

                    int filas = 0;

                    while (indice < lineas.size() && filas < 38) {

                        contenido.showText(lineas.get(indice));

                        contenido.newLineAtOffset(0, -18);

                        indice++;
                        filas++;
                    }

                    contenido.endText();
                }
            }

            documento.save(salida);

            return salida.toByteArray();

        } catch (IOException e) {

            throw new IllegalStateException(
                    "No se pudo generar el PDF de la orden",
                    e
            );
        }
    }
}
