package com.sonic.erp.ordenesdecompra.dto.response;

import com.sonic.erp.ordenesdecompra.dto.request.LineaDisponiblePayload;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MercaderiaDisponiblePubSubPayload {

    private String evento; // MercaderiaDisponible
    private Long idRecepcion;
    private Integer totalUnidadesDisponibles;
    private String ubicacionAlmacen;
    private String fechaDisponibilidad;
    private List<LineaDisponiblePayload> lineasDisponibles;

    public String getEvento() { return evento; }
    public void setEvento(String evento) { this.evento = evento; }

    public Long getIdRecepcion() { return idRecepcion; }
    public void setIdRecepcion(Long idRecepcion) { this.idRecepcion = idRecepcion; }

    public Integer getTotalUnidadesDisponibles() { return totalUnidadesDisponibles; }
    public void setTotalUnidadesDisponibles(Integer totalUnidadesDisponibles) { this.totalUnidadesDisponibles = totalUnidadesDisponibles; }

    public String getUbicacionAlmacen() { return ubicacionAlmacen; }
    public void setUbicacionAlmacen(String ubicacionAlmacen) { this.ubicacionAlmacen = ubicacionAlmacen; }

    public String getFechaDisponibilidad() { return fechaDisponibilidad; }
    public void setFechaDisponibilidad(String fechaDisponibilidad) { this.fechaDisponibilidad = fechaDisponibilidad; }

    public List<LineaDisponiblePayload> getLineasDisponibles() { return lineasDisponibles; }
    public void setLineasDisponibles(List<LineaDisponiblePayload> lineasDisponibles) { this.lineasDisponibles = lineasDisponibles; }
}