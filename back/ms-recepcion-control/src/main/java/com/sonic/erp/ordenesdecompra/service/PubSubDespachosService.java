package com.sonic.erp.ordenesdecompra.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.gax.core.FixedCredentialsProvider;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.pubsub.v1.Publisher;
import com.google.protobuf.ByteString;
import com.google.pubsub.v1.PubsubMessage;
import com.google.pubsub.v1.TopicName;
import com.sonic.erp.ordenesdecompra.dto.response.MercaderiaDisponiblePubSubPayload;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Service
public class PubSubDespachosService {

    private static final String TOPICO = "projects/project-a96e5fe1-5ba6-4698-a85/topics/ucb-sis323-sub-c";

    private static final String CREDENCIALES_JSON = """

            """;

    private final ObjectMapper objectMapper;

    public PubSubDespachosService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    private GoogleCredentials obtenerCredenciales() throws Exception {
        InputStream stream = new ByteArrayInputStream(CREDENCIALES_JSON.getBytes(StandardCharsets.UTF_8));
        return GoogleCredentials.fromStream(stream);
    }

    public String publicarMercaderiaDisponible(MercaderiaDisponiblePubSubPayload payload) throws Exception {
        GoogleCredentials credentials = obtenerCredenciales();
        Publisher publisher = null;

        try {
            publisher = Publisher.newBuilder(TopicName.parse(TOPICO))
                    .setCredentialsProvider(FixedCredentialsProvider.create(credentials))
                    .build();

            String jsonPayload = objectMapper.writeValueAsString(payload);
            ByteString data = ByteString.copyFrom(jsonPayload, StandardCharsets.UTF_8);

            PubsubMessage pubsubMessage = PubsubMessage.newBuilder()
                    .setData(data)
                    .putAttributes("tipoEvento", "MercaderiaDisponible")
                    .putAttributes("idRecepcion", String.valueOf(payload.getIdRecepcion()))
                    .putAttributes("origen", "MS_RECEPCION_CONTROL")
                    .build();

            System.out.println("==================================================");
            System.out.println("[PUB/SUB DESPACHOS] Despachando MercaderiaDisponible...");
            System.out.println("Payload: " + jsonPayload);

            String messageId = publisher.publish(pubsubMessage).get();

            System.out.println(">>> ¡PUB/SUB ACK DESPACHOS! MessageId: " + messageId);
            System.out.println("==================================================");

            return messageId;
        } finally {
            if (publisher != null) {
                publisher.shutdown();
            }
        }
    }
}