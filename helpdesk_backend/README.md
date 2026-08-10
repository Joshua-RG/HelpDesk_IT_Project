# API REST - Sistema de Helpdesk IT

Backend del sistema de gestión de incidencias y requerimientos de soporte técnico (Helpdesk). Provee una API RESTful
protegida con JWT para el manejo de usuarios, tickets y auditoría de estados.

## Tecnologías y Arquitectura

* **Lenguaje:** Java 21
* **Framework:** Spring Boot 3.3.x (Spring Web, Spring Data JPA, Spring Security)
* **Base de Datos:** PostgreSQL 15
* **Seguridad:** JSON Web Tokens (JWT)
* **Arquitectura:** Multicapa (Controladores, Servicios, Repositorios, DTOs)

## Modelo de Dominio (Enums)

Para interactuar con la API, el cliente debe enviar los valores exactos definidos en los siguientes enumeradores:

* **Role:** `EMPLOYEE` (Crea y visualiza sus tickets), `IT_SUPPORT` (Visualiza todos los tickets y cambia estados).
* **TicketPriority:** `LOW`, `MEDIUM`, `HIGH`.
* **TicketStatus:** `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`.

## Seguridad y Autenticación

La API utiliza autenticación Stateless basada en **JWT**.

1. El cliente debe obtener un token a través de `/api/auth/login` o `/api/auth/register`.
2. Para cualquier endpoint protegido (rutas `/api/tickets/**`), el cliente debe incluir el token en las cabeceras HTTP
   de la petición:

* **Header:** `Authorization`
* **Value:** `Bearer <tu_token_jwt>`

---

## Endpoints de la API

### 1. Autenticación (`/api/auth`)

#### 1.1 Registrar Usuario

Crea un usuario en la base de datos.

* **URL:** `/api/auth/register`
* **Método:** `POST`
* **Query Params (Requeridos):**
* `fullName` (String)
* `role` (Enum: EMPLOYEE, IT_SUPPORT)
* **Body (JSON):**
  ```json
  {
    "email": "usuario@empresa.com",
    "password": "password123"
  }
  ```
* **Respuesta Exitosa (201 Created):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1...",
    "email": "usuario@empresa.com",
    "role": "EMPLOYEE"
  }
  ```

#### 1.2 Iniciar Sesión

Autentica a un usuario existente y devuelve un token JWT.

* **URL:** `/api/auth/login`
* **Método:** `POST`
* **Body (JSON):**
  ```json
  {
    "email": "usuario@empresa.com",
    "password": "password123"
  }
  ```
* **Respuesta Exitosa (200 OK):** Mismo formato que el registro. Devuelve credenciales 401 Unauthorized si fallan.

---

### 2. Gestión de Tickets (`/api/tickets`)

#### 2.1 Crear un Ticket

Registra una nueva incidencia. El autor se infiere automáticamente del Token JWT (no enviar el ID del usuario en el
cuerpo).

* **URL:** `/api/tickets`
* **Método:** `POST`
* **Seguridad:** Requiere Token JWT (Roles: EMPLOYEE, IT_SUPPORT).
* **Body (JSON):**
  ```json
  {
    "title": "Problema de red",
    "description": "No hay conexión en el piso 3.",
    "priority": "HIGH"
  }
  ```
* **Respuesta Exitosa (201 Created):**
  ```json
  {
    "id": 1,
    "title": "Problema de red",
    "description": "No hay conexión en el piso 3.",
    "status": "OPEN",
    "priority": "HIGH",
    "authorName": "Juan Perez",
    "assigneeName": "Sin asignar",
    "createdAt": "2026-08-09T15:30:00.000Z"
  }
  ```

#### 2.2 Listar Tickets (Paginado)

Obtiene la lista de tickets. La lógica del backend filtra automáticamente: si el token pertenece a un `EMPLOYEE`, solo
devuelve los tickets creados por él. Si es `IT_SUPPORT`, devuelve todos.

* **URL:** `/api/tickets`
* **Método:** `GET`
* **Seguridad:** Requiere Token JWT.
* **Query Params (Opcionales):**
* `page`: Número de página (Default: 0).
* `size`: Cantidad de elementos por página (Default: 10).
* **Respuesta Exitosa (200 OK):**
  ```json
  {
    "content": [
      {
        "id": 1,
        "title": "Problema de red",
        "status": "OPEN",
        "authorName": "Juan Perez",
        "assigneeName": "Sin asignar"
        // ... otros campos del ticket
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 10
    },
    "totalElements": 1,
    "totalPages": 1
  }
  ```

#### 2.3 Actualizar Estado de Ticket

Modifica el estado de un ticket y registra la auditoría internamente. Asigna automáticamente el ticket al técnico que
realiza la acción.

* **URL:** `/api/tickets/{id}/status`
* **Método:** `PUT`
* **Seguridad:** Requiere Token JWT (Rol exclusivo: **IT_SUPPORT**). Devuelve 403 Forbidden para empleados normales.
* **Path Variable:** `id` (Long) - ID del ticket.
* **Query Param (Requerido):**
* `status` (Enum: OPEN, IN_PROGRESS, RESOLVED, CLOSED)
* **Respuesta Exitosa (200 OK):** Devuelve el objeto TicketResponse actualizado.
* **Respuestas de Error:**
* 400 Bad Request si el ticket ya se encuentra en ese estado.
* 403 Forbidden si el rol no es IT_SUPPORT.

## Manejo de Errores Globales

La API cuenta con un `@RestControllerAdvice`. Cualquier error de negocio, validación de campos, o error de servidor,
retornará de manera predecible el siguiente formato JSON estandarizado:

```json
{
  "timestamp": "2026-08-09T16:00:00.000Z",
  "status": 400,
  "error": "Error de Validación",
  "message": "El formato del email es inválido"
}