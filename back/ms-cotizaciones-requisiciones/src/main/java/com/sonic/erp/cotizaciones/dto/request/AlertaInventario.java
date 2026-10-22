package com.sonic.erp.cotizaciones.dto.request;

public class AlertaInventario {

    private String idAlerta;
    private Long productoId;
    private Integer cantidadSugerida;
    private String motivo;
    private String prioridad;

    public AlertaInventario() {
    }

    public AlertaInventario(String idAlerta, Long productoId, Integer cantidadSugerida, String motivo, String prioridad) {
        this.idAlerta = idAlerta;
        this.productoId = productoId;
        this.cantidadSugerida = cantidadSugerida;
        this.motivo = motivo;
        this.prioridad = prioridad;
    }

    public String getIdAlerta() {
        return idAlerta;
    }

    public void setIdAlerta(String idAlerta) {
        this.idAlerta = idAlerta;
    }

    public Long getProductoId() {
        return productoId;
    }

    public void setProductoId(Long productoId) {
        this.productoId = productoId;
    }

    public Integer getCantidadSugerida() {
        return cantidadSugerida;
    }

    public void setCantidadSugerida(Integer cantidadSugerida) {
        this.cantidadSugerida = cantidadSugerida;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public String getPrioridad() {
        return prioridad;
    }

    public void setPrioridad(String prioridad) {
        this.prioridad = prioridad;
    }
}