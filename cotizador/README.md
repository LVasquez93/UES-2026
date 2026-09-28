# Generador de Cotizaciones · RETAIL El Salvador

Migración del script Python a una aplicación web: **Spring Boot** (backend) + **React + Vite + Tailwind** (frontend). El backend rellena tu machote `.docx` con Apache POI y lo convierte a PDF usando el **Microsoft Word del servidor** vía documents4j.

```
cotizador/
├── backend/    Spring Boot 3 · POI · documents4j · ICU4J · JPA/H2
└── frontend/   React 18 · Vite · Tailwind v3
```

## Requisitos

- **Java 17+** y **Maven**
- **Node 18+**
- **Microsoft Word instalado en el servidor** (lo usa documents4j para el PDF)

## Cómo correrlo

### Backend
```bash
cd backend
mvn spring-boot:run
```
Levanta en `http://localhost:8080`. Crea automáticamente:
- `./data/cotizaciones.mv.db` — base H2 con correlativo e historial
- `./data/pdfs/` — PDFs generados

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Abre `http://localhost:5173`. La URL del backend se configura en `frontend/.env` (`VITE_API_URL`).

## API

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/cotizaciones` | Crea la cotización, genera el PDF, devuelve el resumen |
| GET  | `/api/cotizaciones` | Historial (más recientes primero) |
| GET  | `/api/cotizaciones/{id}` | Detalle |
| GET  | `/api/cotizaciones/{id}/pdf` | Descarga el PDF |

## Qué cambió respecto al script Python

- **Correlativo en base de datos**, no en `correlativo.txt`: se calcula dentro de la transacción que guarda la cotización, así dos usuarios concurrentes no chocan.
- **Dinero en `BigDecimal`** con `ROUND_HALF_UP` (sin errores de flotante).
- **Número a letras con ICU4J** (reemplaza `num2words`).
- **Historial persistido** de cada cotización con sus items.
- **UI editable**: tabla de productos con agregar/eliminar, características como chips, y totales + monto en letras recalculándose en vivo.

## Punto a verificar primero: el renderizado del .docx

`PlantillaService` interpreta los tags de tu machote (`{{ ... }}`, `{% for %}`) como
marcadores de texto, **sin que tengas que reescribir la plantilla**. Detecta la fila
de la tabla que contiene `{{ i.* }}`, la clona por producto y limpia los marcadores
de control sobrantes.

Según cómo queden ubicados los `{% for %}` / `{% endfor %}` en tu tabla, puede aparecer
alguna fila o línea vacía residual. Genera una cotización de prueba y revisa el PDF;
si hay que afinar el espaciado o el manejo de las características, es un ajuste pequeño
en `PlantillaService`.

## Si algún día mueves a Linux sin Word

documents4j necesita Word. Para un servidor Linux, cambia `PdfService` por LibreOffice
headless:

```java
Path docxTmp = Files.createTempFile("cot", ".docx");
Files.write(docxTmp, docx);
new ProcessBuilder("libreoffice", "--headless", "--convert-to", "pdf",
    "--outdir", carpetaSalida.toString(), docxTmp.toString())
    .inheritIO().start().waitFor();
```

(documents4j también tiene un módulo para LibreOffice si prefieres mantener su API.)

## Migrar a MySQL (como DentalCare)

En `application.properties` cambia la `url`, `driverClassName` y `database-platform`,
y agrega `mysql-connector-j` al `pom.xml`. El resto del código no cambia.
