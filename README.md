## Gestión de Compras y Proveedores

Sistema ERP orientado a la gestión del proceso de compras y proveedores de un supermercado.

## Descripción

Este proyecto tiene como objetivo centralizar y optimizar el proceso de adquisición de productos, insumos y materiales necesarios para el funcionamiento de un supermercado.

Para el Primer Sprint:
El microservicio de Proveedores y Catálogos permite gestionar la información de los proveedores y los productos que estos ofrecen, proporcionando información que puede ser utilizada posteriormente en procesos de cotización, comparación y selección de proveedores.

## Alcance del microservicio "proveedores y catalogo"

El microservicio contempla las siguientes funcionalidades:

- Registro y consulta de proveedores.
- Actualización de información de proveedores.
- Validación de proveedores.
- Gestión de estados de proveedores.
- Gestión de documentación.
- Registro de incidencias.
- Gestión de condiciones comerciales.
- Asociación de productos con proveedores.
- Consulta y gestión de catálogos.
- Consulta de precios y tiempos estimados de entrega.
- Consulta de descuentos por volumen.
- Comparación de proveedores.
- Evaluación del desempeño de proveedores.
- Consulta de indicadores.
- Generación de rankings de proveedores.

## Arquitectura

El sistema utiliza una arquitectura de tres capas:

```text
┌─────────────────────────────────────┐
│          Capa de Presentación       │
│                 React               │
└──────────────────┬──────────────────┘
                   │
                   │ REST API
                   │
┌──────────────────▼──────────────────┐
│           Capa de Negocio           │
│             Spring Boot             │
│                 Java                │
└──────────────────┬──────────────────┘
                   │
                   │
┌──────────────────▼──────────────────┐
│             Capa de Datos           │
│              PostgreSQL             │
└─────────────────────────────────────┘
```

## Tecnologías

| Componente | Tecnología |
|---|---|
| Frontend | React |
| Backend | Spring Boot |
| Lenguaje Backend | Java |
| Comunicación | REST API |
| Base de datos | PostgreSQL |
| Control de versiones | Git |
| Repositorio | GitHub |
| Gestión del proyecto | Jira |

## Funcionalidades

### Gestión de proveedores

Permite:

- Registrar proveedores.
- Consultar proveedores.
- Actualizar información.
- Validar información registrada.
- Gestionar estados.
- Consultar información detallada.

La información del proveedor contempla datos generales, comerciales, bancarios y operativos.

## Organización del proyecto

La estructura propuesta del repositorio es:

```text
.
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   └── test/
│   └── pom.xml
│
├── database/
│   └── scripts/
│
├── docs/
│   └── diagrams/
│
└── README.md
```

## Requisitos

Para ejecutar el proyecto se requiere:

- Java
- Maven
- Node.js
- npm
- PostgreSQL
- Git

Las versiones específicas se establecerán de acuerdo con la configuración utilizada durante el desarrollo.

## Instalación

### 1. Clonar el repositorio

```bash
git clone <https://github.com/nataliaaytia/ERPsupermercado.git>
cd <https://github.com/nataliaaytia/ERPsupermercado.git>
```

### 2. Configurar PostgreSQL

Crear la base de datos correspondiente y configurar las credenciales utilizadas por el backend.

### 3. Ejecutar el backend

```bash
cd backend
mvn spring-boot:run
```

### 4. Ejecutar el frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

## Equipo

**Universidad Católica Boliviana "San Pablo"**

**Ingeniería de Sistemas**

**Asignatura:** Taller de Sistemas de Información (SIS-323)

**Grupo C**

### Integrantes

- Natalia Aytia
- Hans Carvajal
- Pedro Condorena
- Fabian Condorena
- Nilmar Surci
- Samiel Trujillo

## Estado del proyecto

El proyecto se encuentra en desarrollo.

Actualmente se trabaja en el primer sprint, enfocado en el microservicio:

**Gestión de Proveedores y Catálogos**

El desarrollo inicial se concentra en la gestión de proveedores, productos, catálogos, documentación, condiciones comerciales, incidencias y evaluación del desempeño.
