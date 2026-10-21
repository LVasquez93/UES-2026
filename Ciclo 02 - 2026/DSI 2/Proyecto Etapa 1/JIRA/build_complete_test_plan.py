import openpyxl
from openpyxl.styles import PatternFill, Font, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# Load the base workbook
wb = openpyxl.load_workbook('PLAN_DE_PRUEBAS_PLANTILLA (1).xlsx')

# Remove placeholder sheets
for sheetname in ['HU002', 'Copia de HU002 1', 'Copia de HU002', 'PBI-AdminTi-06']:
    if sheetname in wb.sheetnames:
        del wb[sheetname]

# Define styles
fill_header = PatternFill(start_color="FFBDD6EE", end_color="FFBDD6EE", fill_type="solid")
fill_role = PatternFill(start_color="FFD9E1F2", end_color="FFD9E1F2", fill_type="solid")
font_title = Font(name="Calibri", size=11, bold=True, color="000000")
font_role = Font(name="Calibri", size=11, bold=True, color="1F497D")
font_regular = Font(name="Calibri", size=10, color="000000")
font_code = Font(name="Calibri", size=10, bold=True, color="002060")

border_side = Side(border_style="thin", color="D9D9D9")
cell_border = Border(left=border_side, right=border_side, top=border_side, bottom=border_side)
align_center_wrap = Alignment(horizontal="center", vertical="center", wrap_text=True)
align_left_wrap = Alignment(horizontal="left", vertical="top", wrap_text=True)

# 1. Update DEFINICION
ws_def = wb['DENIFICION']
ws_def['B12'] = 35

# 2. Update REQUERIMIENTO
ws_req = wb['REQUERIMIENTO']
ws_req['A1'] = """DEFINICIÓN DE REQUERIMIENTOS DEL SISTEMA DENTALCARE

1. Requerimientos Funcionales (RF):
- RF01 [AdminTI]: Autenticación y gestión centralizada de inicio de sesión seguro (PBI-AdminTi-06).
- RF02 [AdminTI]: Creación, activación y gestión de perfiles de usuario del personal clínico (PBI-AdminTi-01).
- RF03 [AdminTI]: Asignación y control de roles y privilegios RBAC (PBI-AdminTi-02).
- RF04 [AdminTI]: Auditoría, revisión de accesos e intentos fallidos de autenticación (PBI-AdminTi-04).
- RF05 [AdminTI]: Restablecimiento asistido de credenciales con clave temporal y cambio obligatorio (PBI-AdminTI-06).
- RF06 [AdminTI]: Ejecución y verificación de respaldos de base de datos en caliente (PBI-AdminTi-03).
- RF07 [AdminTI]: Restauración controlada de la base de datos ante incidentes (PBI-AdminTi-05).
- RF08 [Recepcionista]: Registro integral de pacientes y creación de expediente clínico inicial (PBI-Secret-01).
- RF09 [Recepcionista]: Búsqueda y consulta de fichas de pacientes por nombre o DUI (PBI-Secret-02).
- RF10 [Recepcionista]: Actualización y mantenimiento de datos demográficos y de contacto de pacientes (PBI-Secret-03).
- RF11 [Recepcionista]: Agendamiento de citas con validación de cubículo, odontólogo y horario (PBI-Secret-04/05).
- RF12 [Recepcionista]: Visualización de agenda interactiva diaria, semanal y mensual (PBI-Secret-06).
- RF13 [Recepcionista]: Filtrado multicriterio de citas médicas por rango de fechas (PBI-Secret-07).
- RF14 [Recepcionista]: Detección preventiva y bloqueo de colisiones de horarios/citas duplicadas (PBI-Secret-08).
- RF15 [Recepcionista]: Reprogramación asistida de citas con validación de disponibilidad y confirmación (PBI-Secret-10/11/12).
- RF16 [Recepcionista]: Cancelación de citas con captura obligatoria de justificación clínica (PBI-Secret-13/14).
- RF17 [Recepcionista]: Registro de asistencia y confirmación de llegada de paciente a sala (PBI-Secret-15).
- RF18 [Odontólogo]: Consulta de agenda personalizada del día con estados de atención (PBI-ODO-01).
- RF19 [Odontólogo]: Verificación de identidad y consulta de alertas médicas preexistentes (PBI-ODO-02/03).
- RF20 [Odontólogo]: Apertura formal y captura de tiempo de consulta médica (PBI-ODO-04).
- RF21 [Odontólogo]: Evaluación clínica bucal con registro gráfico en odontograma interactivo FDI (PBI-ODO-06).
- RF22 [Odontólogo]: Registro, vinculación y sellado digital irreversible de diagnóstico clínico (PBI-ODO-07/08).
- RF23 [Odontólogo]: Planificación y ejecución de tratamientos odontológicos con costeo automático (PBI-ODO-09/10/11).
- RF24 [Odontólogo]: Emisión digital de receta médica en PDF con posología completa y firma (PBI-ODO-12/13/14).
- RF25 [Odontólogo]: Cierre formal de consulta clínica con validación de diagnóstico asentado (PBI-ODO-05).
- RF26 [Odontólogo]: Consulta cronológica de historial clínico multidisciplinario por paciente (PBI-ODO-15/16).
- RF27 [Asistente Dental]: Catálogo y registro técnico de materiales e insumos odontológicos (PBI-AsisDent-01).
- RF28 [Asistente Dental]: Consulta y búsqueda en tiempo real de existencias en almacén (PBI-AsisDent-02).
- RF29 [Asistente Dental]: Confirmación de consumo de materiales por procedimientos con descuento automático (PBI-AsisDent-03).
- RF30 [Asistente Dental]: Registro de entradas e ingresos de medicamentos con código y lote (PBI-AsisDent-04).
- RF31 [Asistente Dental]: Monitor reactivo de alertas de stock crítico y exportación a Excel (PBI-AsisDent-05).
- RF32 [Gerencia]: Visualización ejecutiva de reportes de consumo de insumos y atenciones clínicas (PBI-Gerencia-01/04).
- RF33 [Gerencia]: Filtrado multicriterio avanzado de reportes por fechas, odontólogo y especialidad (PBI-Gerencia-02).
- RF34 [Gerencia]: Monitor en modo 'Solo Lectura' de stock crítico ordenable por nivel de urgencia (PBI-Gerencia-03).
- RF35 [Gerencia]: Parametrización de umbrales porcentuales para alertas automáticas de rendimiento (PBI-Gerencia-05).

2. Requerimientos No Funcionales (RNF):
- RNF01 [Seguridad]: Control de acceso basado en roles (RBAC) con tokens JWT y cifrado de credenciales con Bcrypt/Argon2.
- RNF02 [Rendimiento]: Respuestas del sistema en menos de 2.0 segundos para consultas estándar y menos de 3.5 segundos para generación de reportes analíticos.
- RNF03 [Usabilidad]: Interfaz responsiva adaptada a resoluciones de escritorio y tabletas clínicas, con accesibilidad y diseño centrado en el usuario.
- RNF04 [Integridad]: Manejo estricto de transacciones ACID en base de datos relational para evitar inconsistencias en inventario y citas médicas."""

# 3. Update NOMENCLATURA
ws_nom = wb['NOMENCLATURA']
ws_nom['A2'] = 'CP-XXX-###'
ws_nom['B2'] = 'Código identificador único del Caso de Prueba (ej: CP-ADM-001, CP-REC-001, CP-ODO-001, CP-ASD-001, CP-GER-001)'
ws_nom['A3'] = 'PBI-Rol-##'
ws_nom['B3'] = 'Product Backlog Item / Historia de Usuario según actor principal (AdminTi, Secret, ODO, AsisDent, Gerencia)'
ws_nom['A4'] = 'DOD'
ws_nom['B4'] = 'Definition of Done (Definición de Terminado para cada incremento de software)'
ws_nom['A5'] = 'AC'
ws_nom['B5'] = 'Acceptance Criteria (Criterios de Aceptación especificados en Jira)'

wb.save('Grupo#_CARNETSINTEGRANTES_PlandePruebas.xlsx')
print('Base sheets updated.')
