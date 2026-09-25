package com.sonic.erp.proveedores.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HolaMundoController {
        @GetMapping("/saludo")
        public  String saludar(){
            return "Hola campi";
        }
    }
