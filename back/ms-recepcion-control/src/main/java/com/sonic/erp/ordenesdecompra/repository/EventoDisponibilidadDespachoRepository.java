package com.sonic.erp.ordenesdecompra.repository;

import com.sonic.erp.ordenesdecompra.entity.EventoDisponibilidadDespacho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EventoDisponibilidadDespachoRepository extends JpaRepository<EventoDisponibilidadDespacho, Long> {

    Optional<EventoDisponibilidadDespacho> findByIdRecepcion(Long idRecepcion);
}