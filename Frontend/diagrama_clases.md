# Descripción del Diagrama de Clases — Proyecto React

Este diagrama representa el **modelo de datos** del sistema de seguridad para la aplicación frontend en ReactJS. Incluye las entidades principales, sus atributos y las relaciones entre ellas, las cuales reflejan los distintos tipos de asociaciones (1:1, 1:N, N:M) requeridas en el dominio.

---

## Entidades Principales

### 1. **User**

* **Atributos:** id, name, email, password.
* Es la entidad central del sistema. Se relaciona con la mayoría de las demás entidades.
* **Relaciones:**

  * 1:1 con **Profile**, **Address** y **DigitalSignature**.
  * 1:N con **Session**, **Password** y **Device**.
  * N:M con **Role** (a través de **UserRole**).
  * N:M con **SecurityQuestion** (a través de **Answer**).

### 2. **Profile**

* **Atributos:** id, phone, photo.
* **Relación:** 1:1 con **User**.

### 3. **Address**

* **Atributos:** id, street, number, latitude, longitude.
* **Relación:** 1:1 con **User**.

### 4. **DigitalSignature**

* **Atributos:** id, photo.
* **Relación:** 1:1 con **User**.

### 5. **Session**

* **Atributos:** id, token, expiration, faCode, state.
* **Relación:** muchos a uno (N:1) con **User**. Un usuario puede tener múltiples sesiones activas.

### 6. **Password**

* **Atributos:** id, content, startAt, endAt.
* **Relación:** muchos a uno (N:1) con **User**. Permite registrar el historial de contraseñas.

### 7. **Device**

* **Atributos:** id, name, ip, operating_system.
* **Relación:** muchos a uno (N:1) con **User**. Representa los dispositivos desde los cuales el usuario accede al sistema.

### 8. **SecurityQuestion**

* **Atributos:** id, name, description.
* **Relación:** muchos a muchos (N:M) con **User**, mediada por **Answer**.

### 9. **Answer**

* **Atributos:** id, content.
* **Relación:** actúa como tabla intermedia entre **User** y **SecurityQuestion**.

### 10. **Role**

* **Atributos:** id, name, description.
* **Relaciones:**

  * N:M con **User** mediante **UserRole**.
  * N:M con **Permission** mediante **RolePermission**.

### 11. **Permission**

* **Atributos:** id, name, url, method.
* **Relación:** N:M con **Role** a través de **RolePermission**.

### 12. **UserRole**

* **Atributos:** id, startAt, endAt.
* **Función:** tabla intermedia para la relación N:M entre **User** y **Role**.

### 13. **RolePermission**

* **Atributos:** id, startAt, endAt.
* **Función:** tabla intermedia para la relación N:M entre **Role** y **Permission**.

---

## Tipos de Relaciones

* **1:1 (Uno a Uno):** User–Profile, User–Address, User–DigitalSignature.
* **1:N (Uno a Muchos):** User–Session, User–Password, User–Device.
* **N:M (Muchos a Muchos):**

  * User–Role (por UserRole)
  * Role–Permission (por RolePermission)
  * User–SecurityQuestion (por Answer)

---

## Colores en el Diagrama

* **Amarillo:** Relaciones y entidades del integrante **Amarillo (Google / Material UI)**.
* **Verde:** Relaciones y entidades del integrante **Verde (GitHub / Bootstrap)**.
* **Azul:** Relaciones y entidades del integrante **Azul (Microsoft / Tailwind CSS)**.

---

Este modelo soporta la modularidad del sistema de seguridad, garantizando que cada estudiante implemente sus relaciones según el color asignado, manteniendo la integridad del dominio y la estructura del frontend ReactJS.
