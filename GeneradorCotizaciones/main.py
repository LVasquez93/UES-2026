import os
import sys
import tempfile
from datetime import datetime
from docxtpl import DocxTemplate
from docx2pdf import convert
from num2words import num2words

# ==========================================
# --- CONFIGURACIÓN DE RUTAS ---
# ==========================================

# 1. Ruta de la plantilla (Se lee desde adentro del EXE temporal)
if getattr(sys, 'frozen', False):
    RUTA_INTERNA = sys._MEIPASS
else:
    RUTA_INTERNA = os.path.dirname(os.path.abspath(__file__))

NOMBRE_PLANTILLA = "Machote_Cotizaciones.docx"
RUTA_PLANTILLA = os.path.join(RUTA_INTERNA, NOMBRE_PLANTILLA)

# 2. Ruta del Correlativo (Se guarda en Documentos de forma permanente)
CARPETA_DOCUMENTOS = os.path.join(os.path.expanduser('~'), 'Documents')
CARPETA_APP = os.path.join(CARPETA_DOCUMENTOS, 'Cotizaciones_RetailSV')
os.makedirs(CARPETA_APP, exist_ok=True) # Crea la carpeta si no existe
RUTA_CORRELATIVO = os.path.join(CARPETA_APP, "correlativo.txt")

# 3. Ruta temporal para los PDFs (Se borra sola cuando Windows hace limpieza)
CARPETA_TEMP = tempfile.gettempdir()


def verificar_plantilla():
    if not os.path.exists(RUTA_PLANTILLA):
        print(f"\n[ERROR] No se encontró la plantilla: {NOMBRE_PLANTILLA}")
        print("Asegúrate de que esté adjunta al compilar el ejecutable.")
        input("Presiona Enter para salir...")
        sys.exit()


# --- GENERAR NUMERO DE COTIZACION ---
def generar_numero_cotizacion():
    hoy = datetime.now().strftime("%Y%m%d")
    correlativo = 1

    if os.path.exists(RUTA_CORRELATIVO):
        with open(RUTA_CORRELATIVO, "r") as f:
            contenido = f.read().strip()
            if contenido:
                try:
                    fecha_guardada, numero = contenido.split("-")
                    if fecha_guardada == hoy:
                        correlativo = int(numero) + 1
                except ValueError:
                    pass # Si el archivo está corrupto, reinicia el correlativo

    with open(RUTA_CORRELATIVO, "w") as f:
        f.write(f"{hoy}-{correlativo}")

    return f"{hoy}{correlativo:03d}"


# --- NUMERO A LETRAS ---
def numero_a_letras(numero):
    entero = int(numero)
    decimal = int(round((numero - entero) * 100))
    letras = num2words(entero, lang='es').upper()
    return f"{letras} DOLARES CON {decimal:02d}/100"


# --- CAPITALIZAR SOLO PRIMERA LETRA ---
def capitalizar_oracion(texto):
    texto = texto.strip().lower()
    if not texto:
        return ""
    return texto[0].upper() + texto[1:]


# --- GENERAR COTIZACION ---
def generar_cotizacion_automatizada(cliente, empresa, departamento, lista_productos, usuario, forma_pago, nota):
    print("\n[Sistema] Generando cotización... Por favor espera.")

    id_cotizacion = generar_numero_cotizacion()
    items_procesados = []
    subtotal = 0.0

    for indice, producto in enumerate(lista_productos, start=1):
        total_producto = producto['cantidad'] * producto['precio']
        subtotal += total_producto

        items_procesados.append({
            "numero": str(indice),
            "descripcion": producto['descripcion'],
            "entrega": producto['entrega'],
            "cantidad": str(producto['cantidad']),
            "precio": f"{producto['precio']:,.2f}",
            "total": f"{total_producto:,.2f}",
            "caracteristicas": producto.get("caracteristicas", [])
        })

    iva = subtotal * 0.13
    total_inversion = subtotal + iva

    fecha_actual = datetime.now()
    meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio",
             "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]

    fecha_formateada = f"San Salvador, {fecha_actual.day} de {meses[fecha_actual.month - 1]} de {fecha_actual.year}"

    datos_plantilla = {
        "cotizacion_id": id_cotizacion,
        "usuario": usuario,
        "fecha": fecha_formateada,
        "cliente_nombre": cliente,
        "cliente_empresa": empresa,
        "cliente_departamento": departamento,
        "items": items_procesados,
        "subtotal": f"{subtotal:,.2f}",
        "iva": f"{iva:,.2f}",
        "total_inversion": f"{total_inversion:,.2f}",
        "total_letras": numero_a_letras(total_inversion),
        "forma_pago": forma_pago,
        "nota": nota
    }

    # Usamos la carpeta temporal para el Word y el PDF
    nombre_archivo = "".join([c for c in empresa if c.isalnum() or c == ' ']).rstrip()
    ruta_temp_docx = os.path.join(CARPETA_TEMP, f"Temp_{id_cotizacion}.docx")
    ruta_pdf = os.path.join(CARPETA_TEMP, f"Cotizacion_{nombre_archivo.replace(' ', '_')}_{id_cotizacion}.pdf")

    doc = DocxTemplate(RUTA_PLANTILLA)
    doc.render(datos_plantilla)
    doc.save(ruta_temp_docx)

    try:
        convert(ruta_temp_docx, ruta_pdf)
        print(f"\n[OK] Cotización generada y abriéndose...")
        
        # Abre el PDF automáticamente con el programa predeterminado de Windows
        os.startfile(ruta_pdf)
        
    except Exception as e:
        print(f"\n[ERROR] Al generar PDF: {e}")
    finally:
        # Eliminamos el archivo de Word temporal para no dejar basura
        if os.path.exists(ruta_temp_docx):
            os.remove(ruta_temp_docx)


# --- MAIN ---
if __name__ == "__main__":
    verificar_plantilla()

    print("=========================================")
    print("   GENERADOR DE COTIZACIONES RETAIL EL SALVADOR    ")
    print("=========================================\n")
    print(" DATOS DEL CLIENTE Y COTIZACIÓN...\n")

    usuario = input("Ingrese su Nombre de Usuario: ").upper()
    cliente = input("Ingrese el Nombre del Cliente: ").upper()
    empresa = input("Ingrese el Nombre de la Empresa: ").upper()
    departamento = input("Departamento al que va dirigida la cotización: ").upper()

    # --- FORMA DE PAGO ---
    forma_pago = input("Forma de pago (Enter = Crédito 30 días): ")
    if not forma_pago.strip():
        forma_pago = "CRÉDITO 30 DÍAS, TRANSFERENCIA BANCARIA O CHEQUE"
    else:
        forma_pago = forma_pago.upper()

    # --- NOTA ---
    nota = input("Nota (Enter = estándar): ")
    if not nota.strip():
        nota = "TIEMPOS DE ENTREGA Y PRECIOS SUJETOS A CAMBIOS EN INVENTARIO"
    else:
        nota = nota.upper()

    productos = []
    contador = 1
    print(" DATOS DEL PRODUCTO...\n")
    while True:
        print(f"\n> Producto {contador}")

        desc = input("Descripción: ").upper()

        while True:
            try:
                cant = int(input("Cantidad: "))
                break
            except ValueError:
                print("Número inválido")

        while True:
            try:
                precio = float(input("Precio: "))
                break
            except ValueError:
                print("Número inválido")

        entrega = input("Entrega (Enter = 6 a 8 semanas): ")
        if not entrega.strip():
            entrega = "DE 6 A 8 SEMANAS"
        else:
            entrega = entrega.upper()

        # --- CARACTERISTICAS ---
        caracteristicas = []
        print("Ingrese características (enter vacío para terminar):")
        while True:
            car = input(" - ")
            if not car.strip():
                break
            caracteristicas.append(capitalizar_oracion(car))

        productos.append({
            "descripcion": desc,
            "cantidad": cant,
            "precio": precio,
            "entrega": entrega,
            "caracteristicas": caracteristicas
        })

        seguir = input("¿Agregar otro producto? (s/n): ").lower()
        if seguir != 's':
            break

        contador += 1

    generar_cotizacion_automatizada(
        cliente=cliente,
        empresa=empresa,
        departamento=departamento,
        lista_productos=productos,
        usuario=usuario,
        forma_pago=forma_pago,
        nota=nota
    )
    
    # Pausa final para que la consola no se cierre de golpe antes de ver que se abrió el PDF
    print("\nProceso finalizado. Puedes cerrar esta ventana.")
    input("Presiona Enter para salir...")