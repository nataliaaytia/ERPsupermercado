
package com.sonic.erp.ordenesdecompra.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class CorreoOrdenCompraService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final String remitente;

    public CorreoOrdenCompraService(
            ObjectProvider<JavaMailSender> mailSenderProvider,
            @Value("${app.correo.remitente:}") String remitente) {

        this.mailSenderProvider = mailSenderProvider;
        this.remitente = remitente;
    }

    public void enviarOrden(
            String destinatario,
            String asunto,
            String contenido,
            byte[] documentoPdf) {

        JavaMailSender mailSender =
                mailSenderProvider.getIfAvailable();

        if (mailSender == null || remitente.isBlank()) {
            throw new IllegalStateException(
                    "El servicio SMTP no esta configurado");
        }

        if (destinatario == null || destinatario.isBlank()) {
            throw new IllegalArgumentException(
                    "El correo del proveedor es obligatorio");
        }

        if (documentoPdf == null || documentoPdf.length == 0) {
            throw new IllegalArgumentException(
                    "El documento de la orden esta vacio");
        }

        try {
            MimeMessage mensaje =
                    mailSender.createMimeMessage();

            MimeMessageHelper helper =
                    new MimeMessageHelper(
                            mensaje,
                            true,
                            "UTF-8"
                    );

            helper.setFrom(remitente);
            helper.setTo(destinatario.trim());
            helper.setSubject(asunto);
            helper.setText(contenido, false);

            helper.addAttachment(
                    "orden-compra.pdf",
                    new ByteArrayResource(documentoPdf),
                    "application/pdf"
            );

            mailSender.send(mensaje);

        } catch (MessagingException e) {
            throw new IllegalStateException(
                    "No se pudo preparar el correo", e);
        }
    }
}
