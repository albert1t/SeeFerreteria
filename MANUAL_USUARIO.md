# Manual de Usuario — SeeFerreteria

Guia completa para aprender a utilizar el sistema de gestion de almacen y pedidos.

---

## Tabla de contenidos

1. [Que es SeeFerreteria](#1-que-es-seeferreteria)
2. [Acceso a la aplicacion](#2-acceso-a-la-aplicacion)
3. [Inicio de sesion](#3-inicio-de-sesion)
4. [Navegacion general](#4-navegacion-general)
5. [El Almacen (vista principal)](#5-el-almacen-vista-principal)
6. [Buscar productos](#6-buscar-productos)
7. [Ver detalles de un producto](#7-ver-detalles-de-un-producto)
8. [Crear pedidos](#8-crear-pedidos)
9. [Gestionar pedidos](#9-gestionar-pedidos)
10. [Vista de datos (solo admin)](#10-vista-de-datos-solo-admin)
11. [Gestion de usuarios (solo admin)](#11-gestion-de-usuarios-solo-admin)
12. [Importar tarifas Festo (solo admin)](#12-importar-tarifas-festo-solo-admin)
13. [Tema claro / oscuro](#13-tema-claro--oscuro)
14. [Cerrar sesion](#14-cerrar-sesion)
15. [Tabla de roles y permisos](#15-tabla-de-roles-y-permisos)
16. [Glosario](#16-glosario)

---

## 1. Que es SeeFerreteria

SeeFerreteria es una aplicacion web para gestionar un almacen de piezas y recambios industriales. Permite:

- Visualizar el almacen organizado en **paneles** y **cubetas** (compartimentos fisicos).
- Buscar productos por nombre, referencia o escaneando codigos QR.
- Crear y seguir pedidos de reposicion, solicitud o solicitud express.
- Gestionar usuarios, roles y permisos.
- Importar tarifas de proveedores (Festo) para mantener precios actualizados.

---

## 2. Acceso a la aplicacion

Abre tu navegador y ve a la direccion proporcionada por tu administrador.

La pantalla inicial es la pagina de inicio de sesion.

---

## 3. Inicio de sesion

### 3.1 Con usuario y contrasena

1. Escribe tu **nombre de usuario** en el primer campo.
2. Escribe tu **contrasena** en el segundo campo.
3. Pulsa el boton **Acceder**.

Si los datos son correctos, entraras a la aplicacion. Si no, veras un mensaje de error en rojo.

### 3.2 Con Microsoft

Si tu organizacion tiene configurado el inicio de sesion con Microsoft:

1. Pulsa el boton **Iniciar con Microsoft**.
2. Se abrira una ventana de Microsoft para que elijas tu cuenta.
3. Tras autenticarte, volveras a la aplicacion automaticamente.

> **Nota:** Solo pueden iniciar con Microsoft los usuarios cuyo correo electronico este en la lista de correos permitidos, que gestiona el administrador.

---

## 4. Navegacion general

Una vez dentro, veras una **barra de navegacion** en la parte superior con estos elementos:

| Elemento | Descripcion |
|---|---|
| Logo + FERRETERIA | Vuelve a la pantalla principal (Almacen) |
| **Barra de busqueda** | Busca productos por nombre o referencia |
| **Boton QR** | Abre el escaner de codigos QR o busqueda manual por referencia |
| **Almacen** | Enlace a la vista principal del almacen |
| **Pedidos** | Enlace a la lista de pedidos (muestra un numero si hay urgentes) |
| **Usuarios** | (Solo admin) Gestion de usuarios |
| **Datos** | (Solo admin) Vista tipo hoja de calculo de todos los productos |
| Tema (sol/luna) | Cambia entre modo claro y oscuro |
| Tu nombre y rol | Muestra quien estas logueado y tu rol |
| **Salir** | Cierra la sesion |

En movil, los enlaces de navegacion se ocultan tras un **icono de hamburguesa** que despliega un menu lateral.

---

## 5. El Almacen (vista principal)

### 5.1 Vista general — todos los paneles

Al entrar a la aplicacion, ves una cuadricula con **25 paneles** numerados de A1 a A25. Cada panel representa una zona fisica del almacen.

Cada panel se muestra como una **mini-cuadricula** con miniature de las cubetas (compartimentos):

- Las cubetas que contienen productos muestran la **imagen del producto**.
- Las cubetas vacias muestran el texto **Vacio**.
- Los productos ocultos se muestran con opacidad reducida y borde rojo.

**Navegar:** Desplazate horizontalmente para ver todos los paneles.

**Entrar a un panel:** Haz clic en cualquier panel para ver su detalle a pantalla completa.

### 5.2 Vista detallada de un panel

Al abrir un panel, ves la cuadricula completa de cubetas con mas informacion:

- **Imagen** del producto (o icono de tornillo si no tiene imagen).
- **Referencia CMH** del producto.
- **Referencia del cliente** (si la tiene).
- **Nombre** del producto.
- **Posicion** (Columna x Fila).

Las cubetas vacias muestran "Vacio".

### 5.3 Gestion de familias (solo admin)

El boton **Gestionar familias** abre un modal donde puedes:

- **Crear** una nueva familia: escribe nombre y descripcion, pulsa "Anadir".
- **Editar** familias existentes: modifica el nombre o descripcion directamente en la tabla.
- **Eliminar** familias: pulsa el boton de eliminar en la fila correspondiente.

### 5.4 Intercambiar o mover productos (solo admin)

Desde la vista detallada de un panel:

1. Pulsa el boton **Intercambiar / Mover**.
2. Haz clic en el producto que quieres mover (se selecciona como origen).
3. **Para intercambiar:** haz clic en otro producto del mismo panel. Se abrira un modal de confirmacion mostrando las posiciones actuales y las destino.
4. **Para mover a otro panel:** pulsa "Mover a otro panel", selecciona el panel destino, y luego haz clic en una cubeta vacia del panel destino.

### 5.5 Mostrar productos ocultos (solo admin)

El boton **Mostrar ocultos** / **Ocultar ocultos** alterna la visibilidad de los productos marcados como ocultos en la cuadricula del panel.

---

## 6. Buscar productos

Existen tres formas de encontrar un producto:

### 6.1 Busqueda por texto

1. Escribe en la **barra de busqueda** de la parte superior.
2. Aparecera una lista desplegable con hasta **12 resultados** que coincidan con lo que escribes.
3. Haz clic en un resultado para ver la ficha tecnica del producto.

### 6.2 Busqueda por QR o referencia manual

1. Pulsa el boton **QR** en la barra de navegacion.
2. Se abrira un modal con dos opciones:
   - **Escanear con la camara:** Apunta tu dispositivo a un codigo QR del producto. Si la camara esta disponible, lo escanea automaticamente.
   - **Busqueda manual:** Escribe una referencia CMH o de cliente en el campo de texto y pulsa **Buscar**.
3. Si se encuentra el producto, se abre su ficha tecnica.

### 6.3 Busqueda desde la vista de datos (solo admin)

En la pagina de Datos, usa los **filtros de columna** y la **busqueda global** para encontrar productos.

---

## 7. Ver detalles de un producto

Al seleccionar un producto (desde busqueda, QR o haciendo clic en una cubeta), se abre la **Ficha Tecnica** con tres pestanas:

### 7.1 Pestana "Info"

Muestra toda la informacion del producto:

| Campo | Descripcion |
|---|---|
| Imagen | Foto del producto |
| Referencia CMH | Codigo interno CMH |
| Referencia del Cliente | Codigo del cliente |
| Codigo | Codigo adicional |
| Nombre | Nombre del producto |
| Marca | Fabricante |
| Metrica | Ej: M8x30, 1/2", 35mm2 |
| Ud. de embalaje | Unidades por paquete |
| Plazo de entrega | Tiempo estimado |
| Familia | Categoria del producto |
| No Reposicion | Punto de reorden |
| PVP orientativo | Precio de venta al publico (EUR) |
| Ubicacion | Panel / Columna / Fila |

**Aiciones del admin en esta pestana:**
- **Editar:** Abre el formulario para modificar el producto.
- **Eliminar:** Borra el producto (pide confirmacion).
- **Mostrar / Ocultar:** Cambia si el producto aparece o no en la vista general.

### 7.2 Pestana "Historial"

Lista todos los pedidos asociados a este producto, del mas reciente al mas antiguo. Cada entrada muestra:

- Tipo de pedido (Reposicion / Solicitud / Solicitud Express).
- Estado del pedido.
- Fecha de solicitud.
- Nombre del solicitante.
- Cantidad.

### 7.3 Pestana "Nuevo Pedido"

Permite crear un pedido directamente desde la ficha del producto. Primero elige el tipo de pedido:

#### Pedido de Reposicion (Automatico)

- Se usa el **punto de reorden** del producto como cantidad.
- Ideal para reposiciones automaticas cuando el stock baja.
- Muestra el calculo de unidades segun la unidad de embalaje.
- Pulsa **Crear Reposicion** y confirma.

#### Solicitud (Personalizado)

- Indica la **cantidad** (en numero de paquetes).
- Indica la **fecha deseada de entrega**.
- Anade **observaciones** si lo necesitas.
- Muestra el calculo de unidades y el precio estimado.
- Pulsa **Crear Solicitud** y confirma.

#### Solicitud Express (Urgente)

- Indica la **cantidad**.
- Este tipo de pedido tiene **prioridad** y se marca en rojo en la lista de pedidos.
- Pulsa **Crear Solicitud Express** y confirma.

En todos los casos, antes de confirmar veras un **resumen** con:
- Producto, referencia y ubicacion.
- Tipo de pedido.
- Metrica y unidad de embalaje.
- PVP y cantidad.
- Total estimado.
- Fecha deseada (si aplica).
- Observaciones.

Pulsa **Confirmar pedido** para enviarlo. Recibiras una confirmacion.

---

## 8. Crear pedidos

Los pedidos se pueden crear desde dos sitios:

1. **Desde la ficha tecnica del producto** (pestana "Nuevo Pedido") — como se describe en el apartado 7.3.
2. **Desde la pagina de Pedidos** — el boton "+" o el flujo de creacion disponible segun tu rol.

---

## 9. Gestionar pedidos

La pagina **Pedidos** muestra todos los pedidos del sistema.

### 9.1 Filtrar y buscar

Usa la barra de busqueda y los filtros para encontrar pedidos:

| Filtro | Opciones |
|---|---|
| Texto libre | Busca por nombre de producto, solicitante, etc. |
| Tipo | Todos / Reposicion / Solicitud / Solicitud Express |
| Fecha | Selecciona una fecha concreta |
| Orden | Mas recientes primero / Mas antiguos primero |
| Ver finalizados | Muestra u oculta pedidos finalizados |
| Ver ocultos | Muestra u oculta pedidos ocultos |

### 9.2 Ver detalle de un pedido

Haz clic en cualquier pedido para abrir su detalle. Veras:

- **Barra de progreso** con los 4 estados del ciclo de vida:
  1. Solicitado
  2. Pedido realizado
  3. Pedido recibido
  4. Finalizado

- **Informacion del pedido:** producto, referencia, cantidad, fecha solicitada, solicitante, fecha de solicitud, precio orientativo, total estimado.
- **Observaciones** del pedido.
- **Linea de tiempo** con el historial de cambios de estado (quien cambio que y cuando).

### 9.3 Avanzar estado

Si tienes permisos de edicion, veras el boton **Avanzar a [siguiente estado]**. Por ejemplo:

- "Avanzar a Pedido realizado"
- "Avanzar a Pedido recibido"
- "Avanzar a Finalizado"

Al pulsar, se muestra un modal de confirmacion. El cambio queda registrado en la linea de tiempo.

### 9.4 Editar un pedido (solo admin y operario)

El boton **Editar** permite modificar:

- Cantidad (numero de paquetes).
- Fecha deseada de entrega.
- Observaciones.

### 9.5 Ocultar / Mostrar un pedido

El boton **Mostrar** / **Ocultar** controla si un pedido aparece en la vista general.

### 9.6 Eliminar un pedido (solo admin)

El boton **Eliminar** borra el pedido permanentemente. Se requiere confirmacion.

---

## 10. Vista de datos (solo admin)

La pagina **Datos** es una vista tipo hoja de calculo con **todos los productos** del sistema.

### 10.1 Columnas disponibles

ID, Ref. CMH, Ref. Cliente, Codigo, Nombre, Marca, Metrica, Ud. Embalaje, Precio, Familia, No Repos., Panel, Columna, Fila, Oculto.

### 10.2 Filtrar datos

- Usa la **busqueda global** para buscar en todos los campos.
- Haz clic en el **encabezado de cualquier columna** para abrir un menu de filtrado:
  - Para columnas de texto: escribe un filtro.
  - Para Panel: selecciona un panel del desplegable (A1-A25).
  - Para Familia: selecciona una familia del desplegable.
  - Para Oculto: elige Todos / Si / No.
- Cada filtro permite ordenar A-Z o Z-A.
- Pulsa **Limpiar filtros** para quitar todos los filtros activos.

### 10.3 Editar un producto (inline)

Si eres admin, puedes hacer clic en **cualquier celda** de la tabla para editarla directamente:

- Los campos de texto se convierten en inputs.
- Familia muestra un desplegable.
- Panel muestra un desplegable.
- Oculto muestra un checkbox.
- Los campos numericos muestran un input de numero.

Para guardar: pulsa **Enter**. Para cancelar: pulsa **Escape**.

### 10.4 Edicion masiva

El boton **Editar todo** activa un modo donde **todas las celdas editables** se convierten en inputs simultaneamente. Puedes modificar muchos productos a la vez y luego pulsar **Guardar cambios** para aplicar todo de golpe. Pulsa **Cancelar** para descartar los cambios.

### 10.5 Acciones por fila (solo admin)

- **Editar:** Abre el formulario completo de edicion del producto.
- **Eliminar:** Borra el producto (pide confirmacion).

### 10.6 Anadir producto (solo admin)

El boton **+ Anadir** abre el formulario de creacion de un nuevo producto.

### 10.7 Ir a importar tarifas (solo admin)

El boton **Tarifa Festo** te lleva a la pagina de importacion de tarifas.

---

## 11. Gestion de usuarios (solo admin)

La pagina **Usuarios** esta disponible exclusivamente para administradores.

### 11.1 Ver usuarios

Se muestra una tabla con todos los usuarios registrados:

| Columna | Descripcion |
|---|---|
| Nombre | Nombre completo del usuario |
| Usuario / Email | Nombre de usuario o correo electronico |
| Rol | admin, operario, user o viewer |
| Estado | Activo (verde) o Inactivo (rojo) |

### 11.2 Crear un usuario

1. Pulsa **+ Nuevo usuario**.
2. Rellena los campos:
   - **Nombre de usuario** (obligatorio).
   - **Nombre completo** (obligatorio).
   - **Contrasena** (minimo 6 caracteres).
   - **Rol:** admin, operario, user o viewer.
3. Pulsa **Crear**.

> **Nota:** El usuario se crea **desactivado** por defecto. El admin debe activarlo manualmente.

### 11.3 Cambiar el rol de un usuario

1. En la tabla de usuarios, pulsa **Editar rol** en la fila del usuario.
2. Selecciona el nuevo rol en el desplegable.
3. Los cambios se aplican inmediatamente.

### 11.4 Activar / Desactivar un usuario

1. En la tabla, pulsa **Activar** o **Desactivar** en la fila del usuario.
2. Los usuarios desactivados no pueden iniciar sesion.

### 11.5 Eliminar un usuario

1. Pulsa **Eliminar** en la fila del usuario.
2. Confirma la eliminacion en el modal que aparece.

> **Advertencia:** Esta accion es irreversible.

### 11.6 Correos permitidos para Microsoft

En la parte inferior de la pagina, gestiona la lista de correos autorizados para iniciar sesion con Microsoft:

1. Escribe un **correo electronico**.
2. Selecciona el **rol** que tendra ese correo.
3. Pulsa **Anadir correo**.
4. La tabla muestra todos los correos permitidos con su rol y estado.
5. Puedes **Activar/Desactivar** o **Eliminar** correos individuales.

---

## 12. Importar tarifas Festo (solo admin)

La pagina **Importar tarifas Festo** permite actualizar los precios de venta (PVP) de los productos cuyas referencias CMH coincidan con un archivo CSV de Festo.

### 12.1 Pasos para importar

1. **Descarga el CSV de Festo Online Shop:**
   - Inicia sesion en la tienda online de Festo.
   - Navega a la seccion "Lista de precios netos".
   - Configura la exportacion CSV con las referencias y el precio neto.
   - Descarga el archivo.

2. **Sube el archivo aqui:**
   - Arrastra el archivo CSV/TXT a la zona de carga, o haz clic para seleccionarlo.
   - El nombre del archivo aparecera en pantalla.

3. **Importa:**
   - Pulsa **Importar catalogo**.
   - Espera a que termine el proceso.
   - Veras un mensaje de exito o error.

4. **Resultado:**
   - Los productos cuya referencia CMH coincida con una fila del CSV tendran actualizado su PVP orientativo.

### 12.2 Alerta de obsolescencia

Si la ultima importacion fue hace **mas de 180 dias**, aparecera un banner rojo advirtiendo que la lista de precios esta desactualizada. Este aviso tambien se muestra en la barra de navegacion principal.

---

## 13. Tema claro / oscuro

Pulsa el icono de **sol** (modo claro) o **luna** (modo oscuro) en la barra de navegacion para cambiar el tema visual de la aplicacion.

Tu preferencia se guarda automaticamente y se mantiene entre sesiones.

---

## 14. Cerrar sesion

Pulsa el boton **Salir** en la barra de navegacion. Tu sesion se cerrara y volveras a la pagina de inicio de sesion.

---

## 15. Tabla de roles y permisos

| Funcionalidad | admin | operario | user | viewer |
|---|:---:|:---:|:---:|:---:|
| Ver almacen | Si | Si | Si | Si |
| Buscar productos | Si | Si | Si | Si |
| Ver ficha tecnica | Si | Si | Si | Si |
| Crear productos | Si | No | No | No |
| Editar productos | Si | No | No | No |
| Eliminar productos | Si | No | No | No |
| Mover/Intercambiar productos | Si | No | No | No |
| Gestionar familias | Si | No | No | No |
| Ver pagina de Datos | Si | No | No | No |
| Crear pedidos | Si | Si | Si | No |
| Editar pedidos | Si | Si | Si | No |
| Avanzar estado de pedidos | Si | Si | Si | No |
| Eliminar pedidos | Si | No | No | No |
| Ocultar pedidos/productos | Si | Si | Si | No |
| Gestionar usuarios | Si | No | No | No |
| Importar tarifas Festo | Si | No | No | No |
| Ver pedidos | Si | Si | Si | Si |

---

## 16. Glosario

| Termino | Definicion |
|---|---|
| **Panel** | Zona fisica del almacen, identificada con una letra y numero (A1 a A25). Contiene una cuadricula de cubetas. |
| **Cubeta** | Compartimento individual dentro de un panel. Cada cubeta puede contener un producto o estar vacia. |
| **Producto** | Pieza o recambio que se almacena y gestiona en el sistema. |
| **Familia** | Categoria o grupo al que pertenece un producto. |
| **Ref. CMH** | Referencia interna del producto en el sistema CMH. |
| **Ref. Cliente** | Referencia o codigo que el cliente usa para identificar el producto. |
| **Ud. de embalaje** | Numero de unidades que vienen en un paquete. |
| **PVP orientativo** | Precio de venta al publico orientativo (en EUR). |
| **No Reposicion** | Punto de reorden: cantidad minima a la que se deberia reponer el producto. |
| **Producto oculto** | Producto que existe en el sistema pero no se muestra en la vista general del almacen. Solo los admin pueden verlo. |
| **Reposicion** | Pedido automatico que usa el punto de reorden como cantidad. |
| **Solicitud** | Pedido personalizado con cantidad y fecha deseadas. |
| **Solicitud Express** | Pedido urgente con prioridad. |
| **Estado** | Fase del pedido: Solicitado, Pedido realizado, Pedido recibido o Finalizado. |

---

## Contacto

Si tienes problemas o dudas, contacta con:

- **Comercial CMH:** 964 188 142 / comercial@cmhautomacion.com
- **Ana Aceiton Peris:** +34 717 12 96 99 / ana.peris@cmhautomacion.com
