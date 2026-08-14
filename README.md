<div align="center">

<img src="./assets/logo-imperio-drinks.jpeg" alt="Logo de Imperio Drinks" width="230">

# 👑 Imperio Drinks

### Sistema web de presupuestos y administración para eventos

Una aplicación web diseñada para crear presupuestos personalizados según la cantidad de invitados, el plan seleccionado y los servicios adicionales contratados.

El proyecto cuenta con una página de presupuestos para uso general y un panel administrativo desde el cual se pueden modificar precios, planes, productos y configuraciones comerciales.

</div>

---

## 📋 Descripción del proyecto

**Imperio Drinks** permite calcular de manera rápida y ordenada el valor de un servicio para eventos.

El usuario puede seleccionar un plan, indicar la cantidad de personas, agregar costos adicionales y generar un presupuesto detallado.

El sistema calcula automáticamente:

* Precio del plan.
* Cantidad de personas.
* Descuento por cantidad.
* Productos o servicios adicionales.
* Gastos de traslado.
* Otros gastos.
* Descuentos manuales.
* Seña requerida.
* Saldo pendiente.
* Total final.

Además, permite generar un documento PDF preparado para descargar y compartir con el cliente.

---

## ✨ Funcionalidades principales

### Presupuestador general

* Carga de datos del cliente.
* Número automático de presupuesto.
* Fecha de emisión.
* Fecha del evento.
* Tipo de evento.
* Lugar del evento.
* Cantidad de invitados.
* Selección del plan.
* Visualización de lo que incluye cada plan.
* Cálculo automático del precio.
* Aplicación de descuentos por cantidad.
* Incorporación de adicionales.
* Gastos de traslado.
* Otros gastos.
* Descuento manual.
* Cálculo de seña.
* Cálculo del saldo restante.
* Campo para observaciones.
* Generación de PDF.
* Descarga del presupuesto.
* Resumen para compartir por WhatsApp.

### Panel administrativo

* Modificación del nombre de los planes.
* Modificación del precio por persona.
* Edición de los productos incluidos.
* Activación y desactivación de planes.
* Creación de nuevos planes.
* Eliminación de planes.
* Administración de productos adicionales.
* Modificación de precios.
* Organización de productos por categorías.
* Configuración de unidades de venta.
* Configuración del mínimo de invitados.
* Configuración del porcentaje de seña.
* Edición de rangos de descuento.
* Modificación de los datos comerciales.
* Configuración de las condiciones del presupuesto.
* Guardado automático de la información.
* Exportación e importación de copias de seguridad.

---

## 🥂 Planes cargados

Los precios se calculan por persona.

| Plan            | Precio inicial |
| --------------- | -------------: |
| Súper Económico |        $13.000 |
| Silver          |        $18.000 |
| Gold            |        $20.000 |
| Black           |        $25.000 |

> Los nombres, precios y productos incluidos pueden modificarse desde el panel administrativo.

### Plan Súper Económico

Incluye:

* Gin.
* Vodka.
* Fernet.
* Campari.
* Gancia.

### Plan Silver

Incluye:

* Fernet con Coca.
* Gancia.
* Vodka con Speed o jugo de naranja.
* Gin tonic.
* Agua mineral de 500 ml.

### Plan Gold

Incluye:

* Fernet con Coca.
* Fernet menta con Coca.
* Daiquiri de frutilla.
* Caipirinha.
* Aperol Citric.
* Campari.
* Champagne.
* Vodka con Speed o jugo de naranja.
* Gin tonic de frutos rojos o limón.
* Agua mineral de 500 ml.

### Plan Black

Incluye todo el contenido del Plan Gold más tres tragos exclusivos de la casa elegidos por el cliente.

---

## 🧮 Fórmula de cálculo

El presupuesto se calcula utilizando la siguiente lógica:

```text
Subtotal del plan =
Precio por persona × Cantidad de personas facturables
```

```text
Subtotal previo =
Subtotal del plan
+ Productos adicionales
+ Traslado
+ Otros gastos
```

```text
Total final =
Subtotal previo
- Descuento automático
- Descuento manual
```

```text
Seña =
Total final × Porcentaje de seña
```

```text
Saldo restante =
Total final - Seña
```

### Cantidad mínima

La contratación mínima configurada inicialmente es de:

```text
50 personas
```

Cuando se carga una cantidad inferior al mínimo, el sistema puede calcular utilizando el mínimo establecido.

### Descuentos automáticos iniciales

| Cantidad de personas | Descuento |
| -------------------- | --------: |
| De 50 a 100          |       0 % |
| De 101 a 150         |       5 % |
| Desde 151            |      10 % |

Los rangos y porcentajes pueden modificarse desde el administrador.

---

## 🛠️ Tecnologías utilizadas

El proyecto está desarrollado con tecnologías web simples y compatibles con la mayoría de los navegadores:

* HTML5.
* CSS3.
* JavaScript.
* Local Storage.
* Generación de PDF desde el navegador.
* Web Share API para compartir archivos en dispositivos compatibles.
* Vercel para publicación online.

No requiere compilación para funcionar en su versión actual.

---

## 📁 Estructura del proyecto

```text
imperio-drinks/
│
├── index.html
├── admin.html
├── vercel.json
├── README.md
│
├── assets/
│   └── logo-imperio-drinks.jpeg
│
├── css/
│   └── styles.css
│
├── js/
│   ├── app.js
│   ├── admin.js
│   ├── store.js
│   └── logo-data.js
│
└── .vscode/
    └── settings.json
```

### Archivos principales

| Archivo          | Función                                          |
| ---------------- | ------------------------------------------------ |
| `index.html`     | Página principal para crear presupuestos         |
| `admin.html`     | Panel para administrar precios y configuraciones |
| `css/styles.css` | Diseño visual de la aplicación                   |
| `js/app.js`      | Cálculos y funciones del presupuestador          |
| `js/admin.js`    | Funciones del panel administrativo               |
| `js/store.js`    | Administración y guardado de datos               |
| `assets/`        | Logo e imágenes del proyecto                     |
| `vercel.json`    | Configuración para publicar en Vercel            |

---

## 💻 Cómo ejecutar el proyecto localmente

### Requisitos

Solo es necesario tener instalado alguno de los siguientes programas:

* Python.
* Node.js.
* Visual Studio Code con Live Server.

---

## Opción 1: servidor local con Python

Abrir una terminal dentro de la carpeta del proyecto y ejecutar:

```bash
python -m http.server 5500
```

En Windows también puede utilizarse:

```bash
py -m http.server 5500
```

Luego abrir en el navegador:

### Presupuestador

```text
http://localhost:5500/
```

### Panel administrativo

```text
http://localhost:5500/admin.html
```

Para detener el servidor:

```text
Ctrl + C
```

---

## Opción 2: servidor con Node.js

Ejecutar dentro de la carpeta del proyecto:

```bash
npx serve . -l 5500
```

Luego ingresar a:

```text
http://localhost:5500/
```

```text
http://localhost:5500/admin.html
```

---

## Opción 3: Live Server en Visual Studio Code

1. Abrir la carpeta del proyecto en Visual Studio Code.
2. Instalar la extensión **Live Server**.
3. Abrir `index.html`.
4. Hacer clic derecho sobre el archivo.
5. Seleccionar **Open with Live Server**.

Para abrir el administrador:

```text
http://127.0.0.1:5500/admin.html
```

El puerto puede cambiar según la configuración de Live Server.

---

## 🚀 Publicación en Vercel

### Publicación desde el panel de Vercel

1. Crear una cuenta en Vercel.
2. Crear un nuevo proyecto.
3. Importar el repositorio de GitHub.
4. Seleccionar el proyecto.
5. No configurar ningún framework.
6. Dejar vacío el comando de compilación.
7. Publicar el proyecto.

Vercel detectará automáticamente `index.html` como página principal.

### Publicación con Vercel CLI

Instalar Vercel:

```bash
npm install -g vercel
```

Iniciar sesión:

```bash
vercel login
```

Publicar una versión de prueba:

```bash
vercel
```

Publicar en producción:

```bash
vercel --prod
```

---

## 📱 Uso del presupuestador

1. Abrir la página principal.
2. Completar los datos del cliente.
3. Indicar la cantidad de personas.
4. Seleccionar un plan.
5. Revisar los productos incluidos.
6. Agregar adicionales, traslado u otros gastos.
7. Aplicar un descuento manual cuando corresponda.
8. Revisar el resumen del presupuesto.
9. Descargar el PDF.
10. Compartirlo con el cliente.

---

## ⚙️ Uso del administrador

1. Abrir `admin.html`.
2. Ingresar a la sección que se desea editar.
3. Modificar precios, planes o productos.
4. Guardar los cambios.
5. Volver al presupuestador.
6. Actualizar la página para visualizar los nuevos datos.

Los cambios realizados en el administrador se reflejan en la página general cuando ambas páginas utilizan el mismo sistema de almacenamiento.

---

## 💾 Almacenamiento actual

La versión inicial utiliza:

```text
localStorage
```

Esto significa que los datos quedan guardados dentro del navegador utilizado.

### Ventajas

* No necesita una base de datos.
* Funciona sin conexión a internet después de cargar los archivos.
* Los cambios son rápidos.
* No requiere servidor backend.

### Limitaciones

* Los datos no se sincronizan automáticamente entre distintos dispositivos.
* Los cambios realizados en una computadora no aparecen en otro celular.
* Si se eliminan los datos del navegador, puede perderse la configuración.
* Cada navegador mantiene su propia copia.

Por este motivo, se recomienda descargar periódicamente una copia de seguridad desde el administrador.

---

## ☁️ Próxima integración con base de datos

Para sincronizar los precios entre celular, computadora y otros dispositivos, el proyecto puede conectarse a una base de datos online.

Opciones recomendadas:

* Supabase.
* Neon PostgreSQL.
* Firebase.
* Vercel Postgres.

La base de datos permitirá:

* Actualizar precios desde cualquier dispositivo.
* Compartir la misma información entre todos los usuarios.
* Mantener una carta digital siempre actualizada.
* Gestionar productos y disponibilidad en tiempo real.
* Guardar presupuestos.
* Consultar presupuestos anteriores.
* Crear usuarios administradores.
* Proteger el acceso al panel.

---

## 📲 Carta digital y código QR

La siguiente etapa del proyecto contempla una carta digital pública.

Ejemplo de dirección:

```text
https://imperio-drinks.vercel.app/carta
```

El código QR apuntará siempre a esa dirección.

Esto permite modificar productos, precios o disponibilidad sin necesidad de generar e imprimir un nuevo código QR.

### Funcionamiento esperado

```text
Panel administrador
        ↓
Base de datos
        ↓
Carta digital actualizada
        ↓
Código QR permanente
```

La carta podrá mostrar:

* Nombre del producto.
* Categoría.
* Descripción.
* Precio.
* Imagen.
* Disponibilidad.
* Productos destacados.
* Promociones.
* Información de contacto.

---

## 📄 Generación de PDF

El sistema genera un presupuesto con:

* Logo comercial.
* Número de presupuesto.
* Fecha de emisión.
* Vigencia.
* Datos del cliente.
* Datos del evento.
* Plan seleccionado.
* Cantidad de invitados.
* Precio por persona.
* Adicionales.
* Descuentos.
* Seña.
* Saldo.
* Total.
* Observaciones.
* Condiciones comerciales.
* Datos de contacto.

El archivo puede descargarse para enviarlo mediante WhatsApp, correo electrónico u otro servicio de mensajería.

---

## 📤 Compartir mediante WhatsApp

En celulares compatibles, el navegador puede mostrar el menú nativo para compartir el PDF.

En computadoras, los navegadores generalmente no permiten adjuntar automáticamente un archivo a WhatsApp Web.

En ese caso, el proceso es:

1. Descargar el PDF.
2. Abrir WhatsApp Web.
3. Seleccionar el cliente.
4. Adjuntar el documento descargado.
5. Enviar el presupuesto.

El sistema también puede generar un resumen de texto para copiar y pegar.

---

## 🎨 Personalización visual

Los estilos principales se encuentran en:

```text
css/styles.css
```

La identidad visual utiliza principalmente:

```css
--color-fondo: #050505;
--color-panel: #111111;
--color-turquesa: #17e4ed;
--color-dorado: #f2a62b;
--color-crema: #f5e5cc;
--color-texto: #ffffff;
```

Desde este archivo pueden modificarse:

* Colores.
* Tipografías.
* Tamaños.
* Espaciados.
* Bordes.
* Sombras.
* Botones.
* Formularios.
* Tarjetas.
* Diseño para dispositivos móviles.

---

## 🔐 Seguridad

Antes de publicar el proyecto definitivamente se recomienda:

* Proteger `admin.html` con autenticación.
* No almacenar contraseñas directamente en JavaScript.
* Utilizar variables de entorno.
* Aplicar políticas de acceso en la base de datos.
* Validar todos los datos ingresados.
* Limitar los permisos de los usuarios.
* Realizar copias de seguridad.
* No exponer claves privadas en GitHub.

> Ocultar el enlace del administrador no constituye una protección suficiente.

---

## 🧰 Solución de problemas

### La página muestra una lista de archivos

Verificar que `index.html` se encuentre directamente en la carpeta donde se inició el servidor.

```text
E:\Imperio-drink-proyecto\index.html
```

### El administrador no guarda cambios

Revisar:

* Que el navegador permita Local Storage.
* Que no se esté utilizando navegación privada.
* Que `index.html` y `admin.html` se abran desde el mismo dominio y puerto.
* Que no existan errores en la consola del navegador.

### Los cambios del administrador no aparecen

Actualizar la página general utilizando:

```text
Ctrl + F5
```

También puede verificarse que ambas páginas estén abiertas desde la misma dirección:

```text
http://localhost:5500/
```

y

```text
http://localhost:5500/admin.html
```

No conviene abrir una página con `localhost` y la otra con `127.0.0.1`, porque el navegador puede tratarlas como sitios diferentes.

### El CSS no se carga

Comprobar que la ruta dentro de los HTML sea:

```html
<link rel="stylesheet" href="./css/styles.css">
```

### El logo no aparece

Comprobar que el archivo exista en:

```text
assets/logo-imperio-drinks.jpeg
```

Y que la ruta utilizada sea:

```html
<img src="./assets/logo-imperio-drinks.jpeg" alt="Imperio Drinks">
```

### El puerto 5500 está ocupado

Utilizar otro puerto:

```bash
python -m http.server 8080
```

Luego abrir:

```text
http://localhost:8080/
```

---

## 🗺️ Hoja de ruta

### Versión actual

* [x] Presupuestador general.
* [x] Panel administrativo.
* [x] Planes editables.
* [x] Precios editables.
* [x] Productos adicionales.
* [x] Descuentos por cantidad.
* [x] Cálculo de seña y saldo.
* [x] Generación de PDF.
* [x] Diseño adaptable.
* [x] Guardado local.
* [x] Publicación compatible con Vercel.

### Próximas mejoras

* [ ] Base de datos online.
* [ ] Inicio de sesión para administradores.
* [ ] Carta digital.
* [ ] Código QR permanente.
* [ ] Sincronización entre dispositivos.
* [ ] Historial de presupuestos.
* [ ] Buscador de clientes.
* [ ] Gestión de disponibilidad.
* [ ] Carga de imágenes de productos.
* [ ] Panel de estadísticas.
* [ ] Exportación a Excel.
* [ ] Envío de presupuestos por correo.
* [ ] Numeración persistente de presupuestos.
* [ ] Tema claro y oscuro.
* [ ] Aplicación instalable PWA.

---

## 🤝 Contribuciones

Para realizar mejoras:

1. Crear una nueva rama.

```bash
git checkout -b mejora/nombre-de-la-mejora
```

2. Guardar los cambios.

```bash
git add .
git commit -m "Agrega nueva funcionalidad"
```

3. Subir la rama.

```bash
git push origin mejora/nombre-de-la-mejora
```

4. Crear un Pull Request desde GitHub.

---

## 📝 Licencia

Este proyecto fue desarrollado para uso de **Imperio Drinks**.

El código, el diseño, el logo y la identidad visual no deben ser utilizados comercialmente por terceros sin autorización de sus responsables.

---

## 📞 Contacto

**Imperio Drinks**

* WhatsApp: completar número.
* Instagram: completar usuario.
* Correo electrónico: completar correo.
* Ubicación: completar ciudad.

---

<div align="center">

### 👑 Imperio Drinks

**Presupuestos claros, rápidos y personalizados para cada evento.**

---
* Usuario: imperiodrinks
* Contraseña: Bassi2026
---

</div>
