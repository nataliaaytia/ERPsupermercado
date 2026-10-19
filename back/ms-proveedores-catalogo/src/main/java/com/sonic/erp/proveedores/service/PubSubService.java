package com.sonic.erp.proveedores.service;

import com.google.api.gax.core.FixedCredentialsProvider;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.pubsub.v1.Publisher;
import com.google.protobuf.ByteString;
import com.google.pubsub.v1.PubsubMessage;
import com.google.pubsub.v1.TopicName;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class PubSubService {

    private static final String TOPICO = "projects/project-a96e5fe1-5ba6-4698-a85/topics/ucb-sis323";
    private static final String ARCHIVO_CREDENCIALES = "project-a96e5fe1-5ba6-4698-a85-4d88ffe257a6.json";

    public String enviarMensaje() throws Exception {
        InputStream credentialsStream = new ClassPathResource(ARCHIVO_CREDENCIALES).getInputStream();
        GoogleCredentials credentials = GoogleCredentials.fromStream(credentialsStream);

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
}
