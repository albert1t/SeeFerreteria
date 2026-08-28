import { jsPDF } from 'jspdf';

const PAGE_WIDTH = 210;
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

interface PdfContext {
  doc: jsPDF;
  y: number;
  page: number;
}

function addPageIfNeeded(ctx: PdfContext, neededSpace: number) {
  if (ctx.y + neededSpace > 280) {
    ctx.doc.addPage();
    ctx.page++;
    ctx.y = MARGIN;
  }
}

function title(ctx: PdfContext, text: string) {
  addPageIfNeeded(ctx, 20);
  ctx.doc.setFontSize(22);
  ctx.doc.setFont('helvetica', 'bold');
  ctx.doc.setTextColor(30, 58, 95);
  ctx.doc.text(text, MARGIN, ctx.y);
  ctx.y += 10;
  ctx.doc.setDrawColor(30, 58, 95);
  ctx.doc.setLineWidth(0.5);
  ctx.doc.line(MARGIN, ctx.y, PAGE_WIDTH - MARGIN, ctx.y);
  ctx.y += 8;
}

function sectionTitle(ctx: PdfContext, text: string) {
  addPageIfNeeded(ctx, 16);
  ctx.doc.setFontSize(15);
  ctx.doc.setFont('helvetica', 'bold');
  ctx.doc.setTextColor(30, 58, 95);
  ctx.doc.text(text, MARGIN, ctx.y);
  ctx.y += 8;
}

function subsectionTitle(ctx: PdfContext, text: string) {
  addPageIfNeeded(ctx, 12);
  ctx.doc.setFontSize(12);
  ctx.doc.setFont('helvetica', 'bold');
  ctx.doc.setTextColor(60, 60, 60);
  ctx.doc.text(text, MARGIN, ctx.y);
  ctx.y += 7;
}

function bodyText(ctx: PdfContext, text: string) {
  const lines = ctx.doc.splitTextToSize(text, CONTENT_WIDTH);
  addPageIfNeeded(ctx, lines.length * 5 + 2);
  ctx.doc.setFontSize(10);
  ctx.doc.setFont('helvetica', 'normal');
  ctx.doc.setTextColor(50, 50, 50);
  ctx.doc.text(lines, MARGIN, ctx.y);
  ctx.y += lines.length * 5 + 2;
}

function bullet(ctx: PdfContext, text: string) {
  const lines = ctx.doc.splitTextToSize(text, CONTENT_WIDTH - 8);
  addPageIfNeeded(ctx, lines.length * 5 + 2);
  ctx.doc.setFontSize(10);
  ctx.doc.setFont('helvetica', 'normal');
  ctx.doc.setTextColor(50, 50, 50);
  ctx.doc.text('•', MARGIN + 2, ctx.y);
  ctx.doc.text(lines, MARGIN + 8, ctx.y);
  ctx.y += lines.length * 5 + 2;
}

function boldBullet(ctx: PdfContext, boldPart: string, normalPart: string) {
  const full = `${boldPart} ${normalPart}`;
  const lines = ctx.doc.splitTextToSize(full, CONTENT_WIDTH - 8);
  addPageIfNeeded(ctx, lines.length * 5 + 2);
  ctx.doc.setFontSize(10);
  ctx.doc.setTextColor(50, 50, 50);
  ctx.doc.text('•', MARGIN + 2, ctx.y);
  ctx.doc.setFont('helvetica', 'bold');
  ctx.doc.text(boldPart, MARGIN + 8, ctx.y);
  const boldWidth = ctx.doc.getTextWidth(boldPart);
  ctx.doc.setFont('helvetica', 'normal');
  ctx.doc.text(normalPart, MARGIN + 8 + boldWidth, ctx.y);
  ctx.y += 6;
}

function spacer(ctx: PdfContext, h = 4) {
  ctx.y += h;
}

function table(ctx: PdfContext, headers: string[], rows: string[][]) {
  const colWidths = headers.map(() => CONTENT_WIDTH / headers.length);
  const rowHeight = 7;

  addPageIfNeeded(ctx, (rows.length + 1) * rowHeight + 4);

  // Header
  ctx.doc.setFillColor(30, 58, 95);
  ctx.doc.rect(MARGIN, ctx.y - 4, CONTENT_WIDTH, rowHeight, 'F');
  ctx.doc.setFontSize(9);
  ctx.doc.setFont('helvetica', 'bold');
  ctx.doc.setTextColor(255, 255, 255);
  headers.forEach((h, i) => {
    ctx.doc.text(h, MARGIN + 4 + i * colWidths[i], ctx.y);
  });
  ctx.y += rowHeight;

  // Rows
  rows.forEach((row, ri) => {
    if (ri % 2 === 0) {
      ctx.doc.setFillColor(240, 244, 248);
      ctx.doc.rect(MARGIN, ctx.y - 4, CONTENT_WIDTH, rowHeight, 'F');
    }
    ctx.doc.setFont('helvetica', 'normal');
    ctx.doc.setTextColor(50, 50, 50);
    ctx.doc.setFontSize(8);
    row.forEach((cell, ci) => {
      const text = ctx.doc.splitTextToSize(cell, colWidths[ci] - 6);
      ctx.doc.text(text[0], MARGIN + 4 + ci * colWidths[ci], ctx.y);
    });
    ctx.y += rowHeight;
  });

  ctx.y += 4;
}

export function generateManualPDF() {
  const doc = new jsPDF('p', 'mm', 'a4');
  const ctx: PdfContext = { doc, y: MARGIN, page: 1 };

  // Portada
  doc.setFontSize(30);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 95);
  doc.text('FERRETERIA', PAGE_WIDTH / 2, 60, { align: 'center' });
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Sistema de Gestion de Productos Industriales', PAGE_WIDTH / 2, 72, { align: 'center' });
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 95);
  doc.text('Manual de Usuario', PAGE_WIDTH / 2, 100, { align: 'center' });
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text('Version 1.0 — 2026', PAGE_WIDTH / 2, 115, { align: 'center' });

  doc.addPage();
  ctx.y = MARGIN;

  // 1. Que es SeeFerreteria
  sectionTitle(ctx, '1. Que es SeeFerreteria');
  bodyText(ctx, 'SeeFerreteria es una aplicacion web para gestionar un almacen de piezas y recambios industriales. Permite visualizar el almacen organizado en paneles y cubetas, crear y seguir pedidos, gestionar usuarios con roles y permisos, y importar tarifas de proveedores.');

  // 2. Acceso
  sectionTitle(ctx, '2. Acceso a la aplicacion');
  bodyText(ctx, 'Abre tu navegador y ve a la direccion proporcionada por tu administrador. La pantalla inicial es la pagina de inicio de sesion.');

  // 3. Inicio de sesion
  sectionTitle(ctx, '3. Inicio de sesion');
  subsectionTitle(ctx, '3.1 Con usuario y contrasena');
  bullet(ctx, 'Escribe tu nombre de usuario en el primer campo.');
  bullet(ctx, 'Escribe tu contrasena en el segundo campo.');
  bullet(ctx, 'Pulsa el boton Acceder.');

  subsectionTitle(ctx, '3.2 Con Microsoft');
  bullet(ctx, 'Pulsa el boton Iniciar con Microsoft.');
  bullet(ctx, 'Se abrira una ventana de Microsoft para que elijas tu cuenta.');
  bullet(ctx, 'Tras autenticarte, volveras a la aplicacion automaticamente.');

  // 4. Navegacion
  sectionTitle(ctx, '4. Navegacion general');
  bodyText(ctx, 'Una vez dentro, veras una barra de navegacion en la parte superior:');
  boldBullet(ctx, 'Logo + FERRETERIA:', 'Vuelve a la pantalla principal (Almacen).');
  boldBullet(ctx, 'Barra de busqueda:', 'Busca productos por nombre o referencia.');
  boldBullet(ctx, 'Boton QR:', 'Abre el escaner de codigos QR o busqueda manual.');
  boldBullet(ctx, 'Almacen:', 'Enlace a la vista principal del almacen.');
  boldBullet(ctx, 'Pedidos:', 'Enlace a la lista de pedidos.');
  boldBullet(ctx, 'Usuarios:', '(Solo admin) Gestion de usuarios.');
  boldBullet(ctx, 'Datos:', '(Solo admin) Vista tipo hoja de calculo.');
  boldBullet(ctx, 'Ajustes:', '(Solo admin) Configuracion de notificaciones.');
  boldBullet(ctx, 'Tema:', 'Cambia entre modo claro y oscuro.');
  boldBullet(ctx, 'Salir:', 'Cierra la sesion.');

  // 5. El Almacen
  sectionTitle(ctx, '5. El Almacen (vista principal)');
  subsectionTitle(ctx, '5.1 Vista general');
  bodyText(ctx, 'Al entrar a la aplicacion, ves 25 paneles numerados de A1 a A25. Cada panel representa una zona fisica del almacen con una mini-cuadricula de cubetas.');

  subsectionTitle(ctx, '5.2 Vista detallada de un panel');
  bodyText(ctx, 'Al hacer clic en un panel, ves la cuadricula completa con imagen del producto, referencia CMH, referencia del cliente, nombre y posicion.');

  subsectionTitle(ctx, '5.3 Click en cubeta vacia (admin)');
  bodyText(ctx, 'Al hacer clic en una cubeta vacia, se abre un modal con dos opciones:');
  boldBullet(ctx, 'Nuevo recambio:', 'Abre el formulario de creacion con la posicion prellenada.');
  boldBullet(ctx, 'Asignar recambio existente:', 'Escanea un QR o escribe una referencia para asignar un producto existente a esa posicion.');

  subsectionTitle(ctx, '5.4 Intercambiar/mover productos (admin)');
  bodyText(ctx, 'Desde la vista detallada, pulsa Intercambiar/Mover, selecciona un producto origen, y luego otro producto para intercambiar o una cubeta vacia para mover.');

  // 6. Buscar productos
  sectionTitle(ctx, '6. Buscar productos');
  boldBullet(ctx, 'Por texto:', 'Escribe en la barra de busqueda y selecciona un resultado.');
  boldBullet(ctx, 'Por QR:', 'Pulsa el boton QR, escanea con la camara o escribe una referencia manualmente.');
  boldBullet(ctx, 'Desde Datos:', 'Usa los filtros de columna en la vista de datos.');

  // 7. Ficha tecnica
  sectionTitle(ctx, '7. Ver detalles de un producto');
  bodyText(ctx, 'Al seleccionar un producto se abre su Ficha Tecnica con tres pestanas:');
  boldBullet(ctx, 'Info:', 'Toda la informacion del producto: referencias, nombre, marca, metrica, embalaje, precio, ubicacion.');
  boldBullet(ctx, 'Historial:', 'Lista de pedidos asociados a este producto.');
  boldBullet(ctx, 'Nuevo Pedido:', 'Crear un pedido directamente desde la ficha.');

  // 8. Crear pedidos
  sectionTitle(ctx, '8. Crear pedidos');
  bodyText(ctx, 'Desde la ficha tecnica del producto, en la pestana Nuevo Pedido, selecciona el tipo:');
  boldBullet(ctx, 'Reposicion (Automatico):', 'Usa el punto de reorden como cantidad.');
  boldBullet(ctx, 'Solicitud (Personalizado):', 'Indica cantidad, fecha deseada y observaciones.');
  boldBullet(ctx, 'Solicitud Express (Urgente):', 'Indica cantidad. Tiene prioridad.');
  spacer(ctx);
  bodyText(ctx, 'Pulsa Crear y confirma en el modal de resumen que muestra producto, referencia, tipo, cantidad, precio estimado y fecha.');

  // 9. Gestionar pedidos
  sectionTitle(ctx, '9. Gestionar pedidos');
  bodyText(ctx, 'La pagina Pedidos muestra todos los pedidos con filtros por tipo, fecha y orden.');
  subsectionTitle(ctx, '9.1 Ciclo de vida de un pedido');
  bullet(ctx, 'Solicitado → Pedido realizado → Pedido recibido → Finalizado');
  subsectionTitle(ctx, '9.2 Acciones');
  boldBullet(ctx, 'Avanzar estado:', 'Pulsa el boton para pasar al siguiente estado.');
  boldBullet(ctx, 'Editar:', 'Solo disponible en estado Solicitado.');
  boldBullet(ctx, 'Eliminar:', 'Solo disponible en estado Solicitado (solo admin).');
  boldBullet(ctx, 'Exportar Excel:', 'Exporta todos los pedidos activos a un archivo .xlsx.');

  // 10. Vista de datos
  sectionTitle(ctx, '10. Vista de datos (solo admin)');
  bodyText(ctx, 'Vista tipo hoja de calculo con todos los productos. Permite filtrar, ordenar, editar celdas individualmente o en modo masivo, y exportar a Excel.');

  // 11. Gestion de usuarios
  sectionTitle(ctx, '11. Gestion de usuarios (solo admin)');
  boldBullet(ctx, 'Crear usuario:', 'Pulsa + Nuevo usuario, rellena campos y pulsa Crear.');
  boldBullet(ctx, 'Cambiar rol:', 'Pulsa Editar rol en la tabla.');
  boldBullet(ctx, 'Activar/Desactivar:', 'Pulsa el boton correspondiente.');
  boldBullet(ctx, 'Correos Microsoft:', 'Gestiona la lista de correos autorizados para login con Microsoft.');

  // 12. Importar tarifas
  sectionTitle(ctx, '12. Importar tarifas Festo (solo admin)');
  bodyText(ctx, 'Permite actualizar precios de venta (PVP) desde un archivo CSV de Festo. Selecciona el archivo CSV y pulsa Importar catalogo. Si la ultima importacion tiene mas de 180 dias, se muestra una alerta.');

  // 13. Roles y permisos
  sectionTitle(ctx, '13. Roles y permisos');
  table(ctx,
    ['Funcionalidad', 'admin', 'operario', 'user', 'viewer'],
    [
      ['Ver almacen', 'Si', 'Si', 'Si', 'Si'],
      ['Crear pedidos', 'Si', 'Si', 'Si', 'No'],
      ['Editar pedidos', 'Si', 'Si', 'Si', 'No'],
      ['Eliminar pedidos', 'Si', 'No', 'No', 'No'],
      ['Crear productos', 'Si', 'No', 'No', 'No'],
      ['Editar productos', 'Si', 'No', 'No', 'No'],
      ['Gestionar usuarios', 'Si', 'No', 'No', 'No'],
      ['Importar tarifas', 'Si', 'No', 'No', 'No'],
    ]
  );

  // 14. Glosario
  sectionTitle(ctx, '14. Glosario');
  boldBullet(ctx, 'Panel:', 'Zona fisica del almacen (A1 a A25).');
  boldBullet(ctx, 'Cubeta:', 'Compartimento individual dentro de un panel.');
  boldBullet(ctx, 'Ref. CMH:', 'Referencia interna del producto.');
  boldBullet(ctx, 'PVP orientativo:', 'Precio de venta al publico (EUR).');
  boldBullet(ctx, 'No Reposicion:', 'Punto de reorden para reposicion automatica.');
  boldBullet(ctx, 'Reposicion:', 'Pedido automatico usando el punto de reorden.');
  boldBullet(ctx, 'Solicitud:', 'Pedido personalizado con cantidad y fecha.');
  boldBullet(ctx, 'Solicitud Express:', 'Pedido urgente con prioridad.');

  // Contacto
  spacer(ctx, 10);
  ctx.doc.setDrawColor(30, 58, 95);
  ctx.doc.setLineWidth(0.3);
  ctx.doc.line(MARGIN, ctx.y, PAGE_WIDTH - MARGIN, ctx.y);
  ctx.y += 6;
  subsectionTitle(ctx, 'Contacto');
  bodyText(ctx, 'Comercial CMH: 964 188 142 / comercial@cmhautomacion.com');
  bodyText(ctx, 'Ana Aceiton Peris: +34 717 12 96 99 / ana.peris@cmhautomacion.com');

  // Pie de pagina en todas las paginas
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(`SeeFerreteria — Manual de Usuario — Pagina ${i} de ${totalPages}`, PAGE_WIDTH / 2, 290, { align: 'center' });
  }

  doc.save('SeeFerreteria_Manual_Usuario.pdf');
}
