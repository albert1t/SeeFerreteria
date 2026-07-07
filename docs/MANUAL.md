# Manual de Usuario — SEE Ferretería

**Sistema de Gestión de Recambios**

---

## 1. Introducción

SEE Ferretería es una aplicación web para la gestión de recambios en una ferretería industrial. Permite organizar los recambios por panales (estanterías), controlar el stock mediante cubetas etiquetadas, gestionar pedidos de reposición, y administrar usuarios con distintos permisos.

### 1.1 Roles de usuario

| Rol | Descripción |
|---|---|
| **Admin** | Acceso completo: gestionar recambios, paneles, pedidos y usuarios |
| **User** | Puede ver y crear pedidos, ver recambios |
| **Operario** | Similar a user, con permisos ajustables |
| **Viewer** | Solo lectura: puede ver recambios y paneles, sin crear pedidos |

---

## 2. Inicio de sesión

![Pantalla de inicio de sesión](images/login.png)

### 2.1 Acceder con usuario y contraseña

1. Abre la aplicación en tu navegador.
2. Introduce tu **usuario** y **contraseña** en el formulario central.
3. Haz clic en **Acceder**.
4. Si los datos son correctos entrarás al almacén. Si no, verás un mensaje de error.

### 2.2 Iniciar sesión con Microsoft

1. En la pantalla de login, haz clic en **Iniciar con Microsoft**.
2. Serás redirigido a la página de inicio de sesión de Microsoft.
3. Introduce tu correo corporativo y contraseña.
4. Tras autenticarte, volverás automáticamente a la aplicación.
5. Si es tu primera vez, se creará una cuenta automáticamente.

> Si el botón de Microsoft aparece deshabilitado con el mensaje *"MSAL no está configurado"*, significa que el administrador no ha activado esta opción. Usa el login con usuario/contraseña.

### 2.3 Registrarse

1. En la pantalla de login, haz clic en **¿No tienes cuenta? Regístrate**.
2. Rellena **Usuario**, **Nombre** y **Contraseña**.
3. Confirma la contraseña.
4. Haz clic en **Registrarse**.
5. Una vez registrado, iniciarás sesión automáticamente.

### 2.4 Cerrar sesión

Haz clic en el botón **Salir** situado en la esquina superior derecha del navbar.

---

## 3. Almacén — Vista general

![Vista general del almacén](images/vista-general.png)

Al entrar en la aplicación, lo primero que ves es la **vista general del almacén** con todos los paneles representados como tarjetas horizontales.

### 3.1 ¿Qué es un panel?

Un **panel** (A1, A2, …, A9, etc.) es una estantería o zona del almacén que contiene un número fijo de **cubetas** (huecos). Cada cubeta puede almacenar un recambio.

### 3.2 Cómo leer una tarjeta de panel

Cada tarjeta muestra:

- **Título del panel** (ej: A1, A2) en la parte superior.
- **Nombre de familia** asignada (ej: "Tornillería", "Rodamientos"). Si no tiene familia, muestra la familia más común entre sus recambios o "Vacío".
- **Cuadrícula de cubetas**: cada cuadrito representa una cubeta.
  - **Azul** → hay un recambio en esa posición.
  - **Gris oscuro** → la cubeta está vacía.
  - **Icono 📦** → hay recambio pero no tiene foto asignada.

> Pasa el ratón por encima de una cubeta para ver la referencia del recambio y su posición (C=columna, F=fila).

### 3.3 Familias de panel

Puedes asignar una familia a cada panel para identificar rápidamente su contenido:

1. Haz clic sobre el nombre de la familia en la tarjeta del panel.
2. Selecciona una familia del desplegable.
3. Haz clic en **Listo** para guardar.

---

## 4. Panel detallado

![Panel detallado](images/panel-detalle.png)

Haz clic en cualquier tarjeta de panel para ver su contenido en detalle.

Cada celda muestra:
- **Foto** del recambio (o un icono 📦 si no tiene).
- **Referencia CMH** (código identificador).
- **Referencia del cliente** (si tiene) en color naranja.
- **Nombre** del recambio.
- **Posición**: columna / fila.
- **Etiqueta "Oculto"** si el recambio está oculto.

### 4.1 Botones de acción

En la parte superior del panel detallado:

| Botón | Función |
|---|---|
| **Mostrar ocultos** | Muestra las cubetas con recambios ocultos (marcados en rojo). |
| **Intercambiar / Mover** | Activa el modo de intercambio o movimiento de recambios. |

### 4.2 Intercambiar recambios

1. Haz clic en **Intercambiar / Mover**.
2. Haz clic en un recambio → se resalta en amarillo.
3. Haz clic en otro recambio del **mismo panel** para intercambiarlos.
4. Confirma el intercambio en la ventana emergente.

### 4.3 Mover recambio a otra celda

1. Activa el modo **Intercambiar / Mover**.
2. Haz clic en un recambio.
3. Haz clic en **Mover a otro panel**.
4. Selecciona el panel de destino.
5. Elige la celda vacía donde quieres moverlo.

### 4.4 Volver a la vista general

Haz clic en **← Volver** en la parte superior derecha.

---

## 5. Recambios

### 5.1 Ver ficha técnica

![Ficha técnica del recambio](images/ficha.png)

Haz clic en cualquier recambio (desde el panel detallado) para abrir su ficha técnica.

La ficha tiene tres pestañas:

| Pestaña | Contenido |
|---|---|
| **Info** | Datos generales: referencias, marca, métrica, ubicación, familia, pedidos pendientes |
| **Historial** | Lista de todos los pedidos creados para este recambio |
| **Nuevo Pedido** | Crear un pedido para este recambio |

### 5.2 Crear nuevo recambio

![Formulario de nuevo recambio](images/nuevo-recambio.png)

1. Desde la página **Almacén**, haz clic en **+ Nuevo Recambio** (junto al título).
2. Rellena los campos obligatorios (marcados con *):

| Campo | Descripción |
|---|---|
| **Ref. CMH** * | Código identificador único del recambio |
| **Nombre** * | Nombre descriptivo |
| **Panel** * | Panel donde se almacena (ej: A1) |
| **Columna** * | Número de columna dentro del panel |
| **Fila** * | Número de fila dentro del panel |
| **Familia** * | Categoría del recambio |
| **Unidad de embalaje** * | Tipo de empaquetado (ej: Unidad, Caja de 10) |

3. Rellena los campos opcionales: Ref. Cliente, Código, Marca, Descripción, Métrica, Plazo de entrega, N° Reposición.
4. Si quieres añadir una foto, haz clic en **Seleccionar imagen**.
5. Haz clic en **Crear recambio**.

> El botón de guardar se deshabilita hasta que todos los campos obligatorios estén completos.

### 5.3 Editar recambio

1. Abre la ficha técnica del recambio.
2. Haz clic en **Editar** (solo visible para administradores).
3. Modifica los campos necesarios.
4. Haz clic en **Guardar cambios**.

### 5.4 Subir o quitar imagen

- **Subir**: desde el formulario de crear o editar, haz clic en **Seleccionar imagen**, elige un archivo y se subirá automáticamente.
- **Quitar**: si el recambio ya tiene imagen, haz clic en **✕ Quitar** para eliminarla.

### 5.5 Buscar recambios

![Barra de búsqueda](images/busqueda.png)

En el navbar, en la parte superior, hay una **barra de búsqueda**. Escribe cualquier texto (referencia, nombre, código, marca) y aparecerán sugerencias en tiempo real. Haz clic en un resultado para abrir su ficha técnica.

### 5.6 Buscar por QR

![Escáner QR](images/qr.png)

1. En el navbar, haz clic en el botón **QR**.
2. Apunta la cámara al código QR del recambio.
3. Al detectarlo, se abrirá automáticamente la ficha técnica del recambio escaneado.

### 5.7 Ocultar o eliminar recambio

Desde la ficha técnica (solo administradores):

- **Ocultar**: el recambio deja de mostrarse en el panel (se marca con borde rojo si activas "Mostrar ocultos").
- **Mostrar**: lo vuelve a hacer visible.
- **Eliminar**: borra el recambio permanentemente (requiere confirmación).

---

## 6. Pedidos

### 6.1 Crear pedido desde la ficha técnica

![Nuevo pedido](images/nuevo-pedido.png)

1. Abre la ficha técnica del recambio.
2. Ve a la pestaña **Nuevo Pedido**.
3. Selecciona el tipo de pedido:

#### Automático (Reposición)

- Usa la cantidad configurada en **N° Reposición** del recambio.
- Se crea directamente tras confirmar.
- No necesita especificar cantidad ni fecha.
- **⚠️ Si el recambio no tiene número de reposición configurado, el botón se deshabilita y muestra el mensaje *"Número de reposición no configurado"*.**

#### Personalizado (Solicitud)

- Debes indicar:
  - **N° paquetes**: cuántos paquetes necesitas.
  - **Fecha deseada de entrega**: cuándo lo necesitas.
- El sistema calcula automáticamente el total de unidades (paquetes × unidad de embalaje).

#### Urgente (Solicitud Express)

- Similar a Personalizado, pero se marca como **prioritario**.
- La cantidad es opcional (si no se indica, usa el número de reposición).

4. Revisa los datos en la ventana de **confirmación**.
5. Haz clic en **Confirmar pedido**.

### 6.2 Historial de pedidos

Desde la ficha técnica, pestaña **Historial**, puedes ver todos los pedidos creados para ese recambio, ordenados del más reciente al más antiguo.

### 6.3 Página de pedidos

![Lista de pedidos](images/pedidos.png)

En el navbar, haz clic en **Pedidos** para ver la lista completa de todos los pedidos.

**Estados de un pedido:**

| Estado | Significado |
|---|---|
| Solicitado | El pedido se ha creado, pendiente de procesar |
| Pedido realizado | El pedido se ha cursado al proveedor |
| Pedido recibido | La mercancía ha llegado |
| Finalizado | El pedido está completo y cerrado |

**Filtros disponibles:**

- **Buscar**: por referencia o nombre del recambio.
- **Tipo**: Reposición, Solicitud, Solicitud Express o Todos.
- **Fecha**: rango de fechas.
- **Ordenar**: por fecha ascendente o descendente.
- **Ver finalizados**: activa/desactiva la visualización de pedidos finalizados.

Los pedidos **urgentes** (Solicitud Express) se muestran con un borde rojo y una etiqueta "URGENTE".

---

## 7. Usuarios (solo administradores)

![Gestión de usuarios](images/usuarios.png)

En el navbar, los administradores ven un enlace **Usuarios**. Allí puedes:

### 7.1 Lista de usuarios

Muestra todos los usuarios registrados con su nombre, usuario, rol y estado (activo/inactivo).

### 7.2 Crear usuario

1. Haz clic en **+ Nuevo Usuario**.
2. Rellena **Nombre**, **Usuario** y selecciona un **Rol**.
3. Opcionalmente, marca **Generar contraseña aleatoria** (si no, se envía un enlace para que el usuario la establezca).
4. Haz clic en **Crear**.

### 7.3 Editar usuario

Haz clic en el icono de editar (lápiz) junto al usuario. Puedes modificar:

- **Nombre**
- **Rol** (admin, user, operario, viewer)
- **Permisos detallados** para pedidos y recambios (crear, ver, editar, eliminar)
- **Estado** (activo / inactivo)

### 7.4 Activar / desactivar usuario

Haz clic en el interruptor de estado para activar o desactivar un usuario. Un usuario inactivo no puede iniciar sesión.

---

## 8. Solución de problemas

### Error de conexión con el servidor

- Verifica tu conexión a internet.
- Comprueba que la URL de la API sea correcta (contacta al administrador).
- Si el error persiste, puede ser un problema del servidor. Reporta la incidencia.

### No se cargan las imágenes

- Las imágenes se almacenan en Azure Blob Storage.
- Si ves un icono 📦 en lugar de la foto, el recambio no tiene imagen asignada.
- Si ves un icono de imagen rota, la URL de acceso puede haber expirado. Contacta al administrador.

### No puedo crear pedido automático

- El recambio debe tener un **N° Reposición** configurado.
- Edita el recambio y establece un número en el campo "N° Reposición".
- Si el botón "Automático" está deshabilitado, significa que el recambio no tiene este valor.

### La sesión se cierra sola

- La sesión tiene una duración limitada (configurada por el administrador, normalmente 8 horas).
- Inicia sesión de nuevo para continuar.

### MSAL no está configurado

- El botón "Iniciar con Microsoft" aparece deshabilitado.
- Usa el formulario de **usuario y contraseña** para acceder.
- Si quieres usar Microsoft, solicita al administrador que configure las variables de entorno necesarias.

### Error al subir una imagen

- El tamaño máximo permitido es de **5 MB**.
- Formatos aceptados: JPG, PNG, GIF, WebP.
- Si el error persiste, contacta al administrador.

---

*Documentación generada el 07/07/2026*
