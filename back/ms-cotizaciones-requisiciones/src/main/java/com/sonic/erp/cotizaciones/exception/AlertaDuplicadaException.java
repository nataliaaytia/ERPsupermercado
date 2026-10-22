package com.sonic.erp.cotizaciones.exception;

public class AlertaDuplicadaException extends RuntimeException {
    private final String alertaId;
    private final Long requisicionIdExistente;

    public AlertaDuplicadaException(String alertaId, Long requisicionIdExistente) {
        super("La alerta " + alertaId + " ya fue procesada previamente en la requisición #" + requisicionIdExistente);
        this.alertaId = alertaId;
        this.requisicionIdExistente = requisicionIdExistente;
    }

    public String getAlertaId() {
        return alertaId;
    }

    public Long getRequisicionIdExistente() {
        return requisicionIdExistente;
    }
}