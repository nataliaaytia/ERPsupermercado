package com.sonic.erp.cotizaciones.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.gax.core.FixedCredentialsProvider;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.pubsub.v1.Publisher;
import com.google.protobuf.ByteString;
import com.google.pubsub.v1.PubsubMessage;
import com.google.pubsub.v1.TopicName;
import com.sonic.erp.cotizaciones.dto.request.AlertaInventario;
import com.sonic.erp.cotizaciones.entity.Requisicion;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class PubSubService {

    private static final String TOPICO = "projects/project-a96e5fe1-5ba6-4698-a85/topics/ucb-sis323-sub-c";
    private static final String CREDENCIALES_JSON = """
            """;

    private final RequisicionAutomaticaService requisicionAutomaticaService;
    private final ObjectMapper objectMapper;
    public PubSubService(RequisicionAutomaticaService requisicionAutomaticaService, ObjectMapper objectMapper) {
        this.requisicionAutomaticaService = requisicionAutomaticaService;
        this.objectMapper = objectMapper;
    }

    private GoogleCredentials obtenerCredenciales() throws Exception {
        InputStream stream = new ByteArrayInputStream(CREDENCIALES_JSON.getBytes(StandardCharsets.UTF_8));
        return GoogleCredentials.fromStream(stream);
    }

    public String publicarAlertaInventario(AlertaInventario alerta) throws Exception {
        GoogleCredentials credentials = obtenerCredenciales();
        Publisher publisher = null;
        try {
            publisher = Publisher.newBuilder(TopicName.parse(TOPICO))
                    .setCredentialsProvider(FixedCredentialsProvider.create(credentials))
                    .build();

            String payload = objectMapper.writeValueAsString(alerta);
            ByteString data = ByteString.copyFrom(payload, StandardCharsets.UTF_8);

            PubsubMessage pubsubMessage = PubsubMessage.newBuilder()
                    .setData(data)
                    .putAttributes("tipoEvento", "ALERTA_STOCK")
                    .build();

            String messageId = publisher.publish(pubsubMessage).get();
            return messageId;
        } finally {
            if (publisher != null) {
                publisher.shutdown();
            }
        }
    }

    public String enviarMensaje() throws Exception {
        GoogleCredentials credentials = obtenerCredenciales();

        Publisher publisher = null;
        try {
            publisher = Publisher.newBuilder(TopicName.parse(TOPICO))
                    .setCredentialsProvider(FixedCredentialsProvider.create(credentials))
                    .build();

            String fechaHora = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

            String jsonPayload = String.format(
                    "{\"Grupo\": \"Grupo C\",\"fecha_hora\": \"%s\", \"mensaje\": \"Mensaje de prueba PubSub desde Spring Boot\"}",
                    fechaHora
            );

            ByteString data = ByteString.copyFrom(jsonPayload, StandardCharsets.UTF_8);
            PubsubMessage pubsubMessage = PubsubMessage.newBuilder()
                    .setData(data)
                    .putAttributes("contentType", "application/json")
                    .build();

            String messageId = publisher.publish(pubsubMessage).get();

            System.out.println("==================================================");
            System.out.println("¡MENSAJE PUBLICADO EN GOOGLE PUB/SUB!");
            System.out.println("ID del Mensaje: " + messageId);
            System.out.println("Fecha y hora: " + fechaHora);
            System.out.println("Payload: " + jsonPayload);
            System.out.println("==================================================");

            return "Mensaje enviado con éxito. ID: " + messageId + " | Fecha/Hora: " + fechaHora;

        } finally {
            if (publisher != null) {
                publisher.shutdown();
            }
        }
    }

    public Requisicion consumirAlertaJson(String mensajeJson) throws Exception {
        AlertaInventario alerta = objectMapper.readValue(mensajeJson, AlertaInventario.class);
        return requisicionAutomaticaService.procesarAlertaInventario(alerta);
    }
}