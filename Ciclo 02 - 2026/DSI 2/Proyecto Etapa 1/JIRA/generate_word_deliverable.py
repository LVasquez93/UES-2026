import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

doc = docx.Document()

# Page setup: Letter, 1 inch margins
for section in doc.sections:
    section.top_margin = Inches(1)
    section.bottom_margin = Inches(1)
    section.left_margin = Inches(1)
    section.right_margin = Inches(1)

# Helper functions for styling
def set_cell_background(cell, hex_color):
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def add_custom_heading(doc, text, level):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.font.name = 'Calibri'
    run.bold = True
    if level == 1:
        run.font.size = Pt(16)
        run.font.color.rgb = RGBColor(31, 78, 121) # Dark Blue
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(6)
    elif level == 2:
        run.font.size = Pt(13)
        run.font.color.rgb = RGBColor(47, 84, 150)
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
    elif level == 3:
        run.font.size = Pt(11)
        run.font.color.rgb = RGBColor(89, 89, 89)
        p.paragraph_format.space_before = Pt(6)
        p.paragraph_format.space_after = Pt(2)
    return p

# --- 1. PORTADA ---
p_title_uni = doc.add_paragraph()
p_title_uni.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = p_title_uni.add_run("UNIVERSIDAD DE EL SALVADOR EN LÍNEA\nFACULTAD DE INGENIERÍA Y ARQUITECTURA\nESCUELA DE INGENIERÍA DE SISTEMAS INFORMÁTICOS\nDISEÑO DE SISTEMAS II (DSI215) — CICLO II-2026\n\n")
r.font.name = 'Calibri'
r.font.size = Pt(12)
r.bold = True
r.font.color.rgb = RGBColor(31, 78, 121)

p_proy = doc.add_paragraph()
p_proy.alignment = WD_ALIGN_PARAGRAPH.CENTER
r_proy = p_proy.add_run("ENTREGABLE I EVALUADO (20%)\nAVANCE DE SOFTWARE (50%+) Y PLAN DE PRUEBAS DE QA\n")
r_proy.font.name = 'Calibri'
r_proy.font.size = Pt(18)
r_proy.bold = True
r_proy.font.color.rgb = RGBColor(192, 0, 0) # Accent Red

p_sub = doc.add_paragraph()
p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
r_sub = p_sub.add_run("Sistema Informático para la Gestión de Servicios Médicos en la Clínica Odontológica DentalCare\n\n\n")
r_sub.font.name = 'Calibri'
r_sub.font.size = Pt(14)
r_sub.bold = True

p_info = doc.add_paragraph()
p_info.alignment = WD_ALIGN_PARAGRAPH.CENTER
r_info = p_info.add_run(
    "GRUPO DE TRABAJO N°: [Grupo #]\n\n"
    "INTEGRANTES (CARNET - NOMBRE):\n"
    "[CARNET 1] - [NOMBRE COMPLETO DEL ESTUDIANTE 1]\n"
    "[CARNET 2] - [NOMBRE COMPLETO DEL ESTUDIANTE 2]\n"
    "[CARNET 3] - [NOMBRE COMPLETO DEL ESTUDIANTE 3]\n"
    "[CARNET 4] - [NOMBRE COMPLETO DEL ESTUDIANTE 4]\n"
    "[CARNET 5] - [NOMBRE COMPLETO DEL ESTUDIANTE 5]\n\n"
    "DOCENTE DIRECTOR / TUTOR: [Nombre del Docente Tutor]\n\n"
    "FECHA DE ENTREGA: Domingo 25 de Octubre de 2026\n"
    "San Salvador, El Salvador, Centroamérica"
)
r_info.font.name = 'Calibri'
r_info.font.size = Pt(11)

doc.add_page_break()

# --- 2. ÍNDICE Y ESTRUCTURA ---
add_custom_heading(doc, "ÍNDICE GENERAL", 1)
p_toc = doc.add_paragraph()
p_toc.add_run(
    "1. INTRODUCCIÓN ........................................................................................................................ 3\n"
    "2. OBJETIVOS DEL ENTREGABLE ................................................................................................. 4\n"
    "   2.1 Objetivo General ................................................................................................................... 4\n"
    "   2.2 Objetivos Específicos .............................................................................................................. 4\n"
    "3. ALCANCE Y ESTADO GENERAL DEL AVANCE DEL SOFTWARE .............................................. 5\n"
    "   3.1 Resumen Ejecutivo del Proyecto DentalCare ........................................................................... 5\n"
    "   3.2 Métrica de Cumplimiento de Avance (HDU Desarrolladas vs Planeadas) ................................ 5\n"
    "   3.3 Solvencia de Observaciones de Laboratorio 3 ........................................................................... 6\n"
    "4. SECCIONES POR SPRINT FINALIZADO Y DEFINICIÓN DE TERMINADO (DOD) ......................... 7\n"
    "   4.1 Sprint 1: Módulos de Seguridad, Gestión de Usuarios, Pacientes y Agenda ........................... 7\n"
    "       4.1.1 Historias de Usuario Finalizadas ................................................................................... 7\n"
    "       4.1.2 Definición de Terminado (DOD) - Sprint 1 ................................................................... 8\n"
    "   4.2 Sprint 2: Módulo de Consulta Odontológica, Odontograma e Historial ..................................... 9\n"
    "       4.2.1 Historias de Usuario Finalizadas ................................................................................... 9\n"
    "       4.2.2 Definición de Terminado (DOD) - Sprint 2 ................................................................... 10\n"
    "   4.3 Sprint 3: Módulos de Tratamientos Odontológicos y Prescripción Médica ............................... 11\n"
    "       4.3.1 Historias de Usuario Finalizadas ................................................................................... 11\n"
    "       4.3.2 Definición de Terminado (DOD) - Sprint 3 ................................................................... 12\n"
    "   4.4 Planificación de Sprints Próximos (Sprint 4 y Sprint 5) ............................................................ 13\n"
    "5. PLAN DE PRUEBAS DE CALIDAD (QA) ...................................................................................... 14\n"
    "   5.1 Estrategia de Calidad y Objetivos de Pruebas ......................................................................... 14\n"
    "   5.2 Tipos de Pruebas Adoptados .................................................................................................. 14\n"
    "   5.3 Roles y Responsabilidades de QA ........................................................................................... 15\n"
    "   5.4 Criterios de Entrada y Criterios de Salida ................................................................................ 15\n"
    "   5.5 Gestión de Riesgos y Contingencias ....................................................................................... 16\n"
    "   5.6 Herramientas y Ambiente de Pruebas .................................................................................... 16\n"
    "6. CASOS DE PRUEBA DEL SISTEMA DENTALCARE ..................................................................... 17\n"
    "   6.1 Resumen y Cobertura de Pruebas de Alto Nivel por Rol ........................................................ 17\n"
    "   6.2 Casos de Prueba Detallados Procedimentales (35 Casos) ....................................................... 18\n"
    "7. GESTIÓN DE CONTROL DE VERSIONES Y ENLACES DE ACCESO ............................................. 24\n"
    "   7.1 Repositorio de Control de Versiones (Git) y Flujo de Ramas ................................................. 24\n"
    "   7.2 Evidencia de Participación y Commits Continuos ................................................................. 24\n"
    "   7.3 Enlace a Carpeta Compartida en la Nube ............................................................................... 25\n"
    "   7.4 Despliegue en Entorno Cloud / Servidor Remoto (No Local) ................................................. 25\n"
    "8. CONCLUSIONES Y RECOMENDACIONES ................................................................................. 26\n"
    "9. ANEXOS ....................................................................................................................................... 27"
)

doc.add_page_break()

# --- 3. CONTENIDO COMPLETO ---
add_custom_heading(doc, "1. INTRODUCCIÓN", 1)
p_intro = doc.add_paragraph(
    "El presente documento técnico constituye el Entregable I Evaluado de la asignatura Diseño de Sistemas II "
    "(Ciclo II-2026), cuyo objetivo primordial es evidenciar el avance significativo del desarrollo del software "
    "y formalizar el Plan de Pruebas de Aseguramiento de Calidad (QA) para el Sistema Informático de la Clínica "
    "Odontológica DentalCare.\n\n"
    "DentalCare es una solución web integral diseñada bajo un enfoque de arquitectura por capas y desarrollo "
    "ágil Scrum, orientada a optimizar la gestión clínica, médica y administrativa. El sistema centraliza la "
    "información de los pacientes, facilita el agendamiento asistido de citas, permite el registro visual interactivo "
    "en odontogramas bajo la norma FDI, garantiza el sellado de diagnósticos clínicos, agiliza la prescripción de "
    "fármacos con generación digital de recetas en PDF, y administra el inventario de materiales e indicadores gerenciales.\n\n"
    "Conforme a los criterios de evaluación establecidos en la guía académica oficial, este entregable certifica un avance "
    "físico funcional superior al 50% de las Historias de Usuario (HDU) totales del backlog general (alcanzando 34 historias "
    "completadas de 52, correspondientes al 65.4%), consolida los criterios de Definición de Terminado (DOD) para los "
    "Sprints 1, 2 y 3 finalizados, y presenta un Plan de Pruebas riguroso con 35 casos de prueba formalizados sin ejecución, "
    "cubriendo todos los roles y tipos de pruebas exigidos por el estándar de calidad de software."
)

add_custom_heading(doc, "2. OBJETIVOS DEL ENTREGABLE", 1)
add_custom_heading(doc, "2.1 Objetivo General", 2)
doc.add_paragraph(
    "Demostrar y documentar el avance funcional del sistema informático DentalCare superior al 50% de las historias "
    "de usuario del proyecto, estructurando un Plan Maestro de Pruebas de QA y Definiciones de Terminado (DOD) consistentes "
    "que garanticen la calidad, seguridad, mantenibilidad y alineación con las necesidades del personal de la clínica."
)
add_custom_heading(doc, "2.2 Objetivos Específicos", 2)
doc.add_paragraph(
    "• Consolidar el estado de desarrollo de los Sprints 1, 2 y 3 finalizados, verificando el cumplimiento estricto de los "
    "Criterios de Aceptación (AC) y la solvencia de observaciones emitidas en el Laboratorio 3.\n"
    "• Definir criterios de Definición de Terminado (DOD) estandarizados, coherentes y aplicables para cada incremento de software entregado.\n"
    "• Diseñar una matriz diversificada de 35 casos de prueba de QA que contemple pruebas funcionales, validación de datos, "
    "casos límite/borde, control de accesos/seguridad (RBAC) y manejo de errores para los 5 roles identificados.\n"
    "• Evidenciar el correcto versionamiento colaborativo en Git, la actualización de repositorios en la nube y la disponibilidad "
    "operativa del software en un entorno de pruebas remoto desplegado en la nube (no local)."
)

add_custom_heading(doc, "3. ALCANCE Y ESTADO GENERAL DEL AVANCE DEL SOFTWARE", 1)
doc.add_paragraph(
    "El backlog del proyecto DentalCare, gestionado en Jira bajo la clave de proyecto DENTALCARE (DENTALCAREAPP), consta de "
    "52 Historias de Usuario (PBI). A la fecha de presentación del Entregable I, los Sprints 1, 2 y 3 se encuentran 100% "
    "finalizados, sumando un total de 34 Historias de Usuario desarrolladas y desplegadas en ambiente de pruebas."
)

# Table summary
table_sp = doc.add_table(rows=6, cols=5)
table_sp.alignment = WD_TABLE_ALIGNMENT.CENTER
headers_sp = ["Sprint", "Enfoque / Módulos", "HDU Planeadas", "HDU Finalizadas", "Estado Actual"]
for idx, h in enumerate(headers_sp):
    cell = table_sp.cell(0, idx)
    cell.text = h
    set_cell_background(cell, "BDD6EE")
    cell.paragraphs[0].runs[0].font.bold = True
    cell.paragraphs[0].runs[0].font.size = Pt(10)

data_sp = [
    ["Sprint 1", "Seguridad, Usuarios, Roles, Pacientes y Agenda", "17", "17", "FINALIZADO (100%)"],
    ["Sprint 2", "Consulta Odontológica, Odontograma FDI e Historial", "10", "10", "FINALIZADO (100%)"],
    ["Sprint 3", "Tratamientos Odontológicos y Prescripción Médica", "6", "6", "FINALIZADO (100%)"],
    ["Sprint 4", "Inventario, Consumo, Respaldos y Horarios", "10", "1 (Retro lab)", "POR HACER / EN PLANIFICACIÓN"],
    ["Sprint 5", "Reportes Gerenciales, Alertas Stock y Espera", "9", "0", "POR HACER / EN PLANIFICACIÓN"]
]
for row_idx, row_data in enumerate(data_sp, 1):
    for col_idx, val in enumerate(row_data):
        cell = table_sp.cell(row_idx, col_idx)
        cell.text = val
        cell.paragraphs[0].runs[0].font.size = Pt(9.5)
        if col_idx == 4 and "FINALIZADO" in val:
            cell.paragraphs[0].runs[0].font.bold = True
            cell.paragraphs[0].runs[0].font.color.rgb = RGBColor(0, 128, 0)

doc.add_paragraph(
    "\nMétrica de Cumplimiento: 34 HDU Finalizadas / 52 HDU Totales = 65.38% de avance funcional global. "
    "Con ello se supera ampliamente el umbral del 50% requerido en la rúbrica institucional para optar a la nota máxima (20%)."
)

add_custom_heading(doc, "3.3 Solvencia de Observaciones de Laboratorio 3", 2)
doc.add_paragraph(
    "En concordancia con los requerimientos de la rúbrica, el equipo solventó íntegramente las observaciones señaladas "
    "en el Laboratorio 3 y retroalimentaciones previas (incidencia DENTALCARE-97):\n"
    "1. Sustitución de selectores estáticos por componentes dinámicos SearchableSelect con filtrado y autocompletado en tiempo real en la selección de pacientes y odontólogos.\n"
    "2. Fortalecimiento de las validaciones de entrada en formularios de citas y pacientes con máscaras para DUI y teléfono.\n"
    "3. Refuerzo de las políticas de expiración de sesión y bloqueo de rutas directas para roles no privilegiados.\n"
    "4. Despliegue continuo en servidor remoto (Cloud/PaaS) garantizando disponibilidad 24/7 sin dependencias locales."
)

add_custom_heading(doc, "4. SECCIONES POR SPRINT FINALIZADO Y DEFINICIÓN DE TERMINADO (DOD)", 1)

# Sprint 1
add_custom_heading(doc, "4.1 Sprint 1: Módulos de Seguridad, Gestión de Usuarios, Pacientes y Agenda", 2)
doc.add_paragraph(
    "El Sprint 1 sentó las bases operativas del sistema DentalCare, abarcando la autenticación, seguridad RBAC y la "
    "gestión integral de admisión y citas médicas. Incluye 17 historias de usuario finalizadas:\n"
    "• PBI-AdminTi-01: Crear Usuario (DENTALCARE-50)\n"
    "• PBI-AdminTi-02: Asignar Roles (DENTALCARE-51)\n"
    "• PBI-AdminTi-04: Revisar Accesos (DENTALCARE-61)\n"
    "• PBI-AdminTi-06: Iniciar Sesión (DENTALCARE-91)\n"
    "• PBI-Secret-01 al 07: Registrar, Consultar y Actualizar Pacientes; Seleccionar Paciente, Fecha/Hora, Ver Agenda y Filtrar por Fecha (DENTALCARE-52 a 59)\n"
    "• PBI-Secret-10 al 15: Buscar Cita, Modificar Horario, Confirmar Cambios, Registrar Motivo de Cancelación, Confirmar Cancelación y Registrar Confirmación de Cita (DENTALCARE-63 a 69)."
)

# DOD Table Sprint 1
p_dod1 = doc.add_paragraph()
r_dod1 = p_dod1.add_run("Definición de Terminado (Definition of Done - DOD) — Sprint 1:")
r_dod1.bold = True
table_dod1 = doc.add_table(rows=6, cols=3)
table_dod1.alignment = WD_TABLE_ALIGNMENT.CENTER
headers_dod = ["Criterio DOD", "Descripción del Estándar", "Verificación / Evidencia"]
for idx, h in enumerate(headers_dod):
    cell = table_dod1.cell(0, idx)
    cell.text = h
    set_cell_background(cell, "D9E1F2")
    cell.paragraphs[0].runs[0].font.bold = True
    cell.paragraphs[0].runs[0].font.size = Pt(9.5)

data_dod1 = [
    ["Criterios de Aceptación (AC)", "100% de los AC definidos en Jira para las 17 HDU cumplidos y comprobados.", "Validado en pruebas funcionales."],
    ["Estándares de Código y Nomenclatura", "Código fuente estructurado bajo convenciones del proyecto y arquitectura MVC.", "Revisión de pull requests aprobada."],
    ["Validación y Seguridad", "Validación de formatos en cliente/servidor; contraseñas cifradas con hash y sesiones tokenizadas.", "Pruebas de inyección y contraseñas."],
    ["Control de Versiones (Git)", "Commits atómicos por cada miembro, pull requests con revisión de pares y merge en develop.", "Historial de commits activo en Git."],
    ["Despliegue y Pruebas", "Módulos integrados y operativos en ambiente de staging remoto sin errores críticos abiertos.", "Verificado en servidor cloud."]
]
for row_idx, row_data in enumerate(data_dod1, 1):
    for col_idx, val in enumerate(row_data):
        cell = table_dod1.cell(row_idx, col_idx)
        cell.text = val
        cell.paragraphs[0].runs[0].font.size = Pt(9)

# Sprint 2
add_custom_heading(doc, "4.2 Sprint 2: Módulo de Consulta Odontológica, Odontograma e Historial", 2)
doc.add_paragraph(
    "El Sprint 2 implementó el núcleo clínico para el rol Odontólogo, permitiendo la atención en sala, registro "
    "gráfico en odontograma interactivo y blindaje de diagnósticos médicos. Incluye 10 historias de usuario finalizadas:\n"
    "• PBI-ODO-01: Ver Citas del día (DENTALCARE-75)\n"
    "• PBI-ODO-02 / 03 / 04: Verificar Paciente, Revisar Detalles Preconsulta e Iniciar Consulta (DENTALCARE-76, 77, 78)\n"
    "• PBI-ODO-05: Cerrar Consulta (DENTALCARE-79)\n"
    "• PBI-ODO-06 / 07 / 08: Evaluar Paciente, Registrar Diagnóstico y Confirmar Diagnóstico (DENTALCARE-80, 81, 82)\n"
    "• PBI-ODO-15 / 16: Buscar Paciente y Revisar Historial Clínico Completo (DENTALCARE-89, 90)."
)

# DOD Table Sprint 2
p_dod2 = doc.add_paragraph()
r_dod2 = p_dod2.add_run("Definición de Terminado (Definition of Done - DOD) — Sprint 2:")
r_dod2.bold = True
table_dod2 = doc.add_table(rows=6, cols=3)
table_dod2.alignment = WD_TABLE_ALIGNMENT.CENTER
for idx, h in enumerate(headers_dod):
    cell = table_dod2.cell(0, idx)
    cell.text = h
    set_cell_background(cell, "D9E1F2")
    cell.paragraphs[0].runs[0].font.bold = True
    cell.paragraphs[0].runs[0].font.size = Pt(9.5)

data_dod2 = [
    ["Criterios de Aceptación (AC)", "100% de los AC de atención clínica, odontograma y diagnóstico verificados.", "Pruebas de aceptación por Odontólogo."],
    ["Odontograma Gráfico FDI", "Renderizado SVG/Canvas reactivo sin latencia, mapeo de caras y persistencia en BD.", "Validación visual y de base de datos."],
    ["Integridad y Sellado Legal", "Inmutabilidad de diagnósticos confirmados con firma digital del doctor (timestamp + ID).", "Bloqueo de edición y error HTTP 403."],
    ["Control de Versiones", "Ramas de feature integradas, revisiones de código cruzadas y commits descriptivos.", "Historial de Git verificado."],
    ["Despliegue", "Módulo clínico probado y sincronizado en tiempo real con recepción en servidor remoto.", "Pruebas end-to-end en staging."]
]
for row_idx, row_data in enumerate(data_dod2, 1):
    for col_idx, val in enumerate(row_data):
        cell = table_dod2.cell(row_idx, col_idx)
        cell.text = val
        cell.paragraphs[0].runs[0].font.size = Pt(9)

# Sprint 3
add_custom_heading(doc, "4.3 Sprint 3: Módulos de Tratamientos Odontológicos y Prescripción Médica", 2)
doc.add_paragraph(
    "El Sprint 3 completó el flujo médico-administrativo con la formulación de tratamientos, cálculo de costos "
    "y emisión oficial de recetas médicas digitales. Incluye 6 historias de usuario finalizadas:\n"
    "• PBI-ODO-09 / 10 / 11: Definir Tratamiento, Registrar Tratamiento y Confirmar Tratamiento (DENTALCARE-83, 84, 85)\n"
    "• PBI-ODO-12 / 13 / 14: Definir Medicamento, Registrar Indicaciones y Confirmar Prescripción (DENTALCARE-86, 87, 88)."
)

# DOD Table Sprint 3
p_dod3 = doc.add_paragraph()
r_dod3 = p_dod3.add_run("Definición de Terminado (Definition of Done - DOD) — Sprint 3:")
r_dod3.bold = True
table_dod3 = doc.add_table(rows=6, cols=3)
table_dod3.alignment = WD_TABLE_ALIGNMENT.CENTER
for idx, h in enumerate(headers_dod):
    cell = table_dod3.cell(0, idx)
    cell.text = h
    set_cell_background(cell, "D9E1F2")
    cell.paragraphs[0].runs[0].font.bold = True
    cell.paragraphs[0].runs[0].font.size = Pt(9.5)

data_dod3 = [
    ["Criterios de Aceptación (AC)", "100% de los AC de tratamientos, cálculo de subtotales y recetas PDF verificados.", "Validado en pruebas funcionales."],
    ["Generación de Recetas PDF", "Compilación de documentos PDF inalterables con membrete oficial, posología y descarga.", "Archivos PDF validados."],
    ["Cálculo Matemático y Facturación", "Sumatoria exacta de subtotales de procedimientos y notificación automática a caja.", "Pruebas de precisión numérica."],
    ["Control de Versiones", "Integración continua en rama develop, resolución de conflictos y tagging de release.", "Repositorio Git actualizado."],
    ["Despliegue y Aceptación", "Despliegue verificado en ambiente cloud y validación de usuario clave (Odontólogo).", "Aprobado por el Product Owner."]
]
for row_idx, row_data in enumerate(data_dod3, 1):
    for col_idx, val in enumerate(row_data):
        cell = table_dod3.cell(row_idx, col_idx)
        cell.text = val
        cell.paragraphs[0].runs[0].font.size = Pt(9)

add_custom_heading(doc, "4.4 Planificación de Sprints Próximos (Sprint 4 y Sprint 5)", 2)
doc.add_paragraph(
    "Para dar continuidad al ciclo de vida del proyecto, se han definido y priorizado las historias más críticas de "
    "los Sprints 4 y 5 en Jira:\n"
    "• Sprint 4: Módulos de Inventario y Consumo de Insumos (PBI-AsisDent-01 a 04), Políticas de Seguridad Avanzada y Respaldos (PBI-AdminTi-03, 05, 06) y Detección de Conflictos de Horario (PBI-Secret-08, 09).\n"
    "• Sprint 5: Tableros de Control y Reportes Gerenciales (PBI-Gerencia-01 a 05), Monitor de Alertas de Stock Crítico (PBI-AsisDent-05) y Gestión de Listas de Espera de Pacientes (PBI-Secret-14, 15, 16)."
)

add_custom_heading(doc, "5. PLAN DE PRUEBAS DE CALIDAD (QA)", 1)
doc.add_paragraph(
    "El Plan de Pruebas formaliza la estrategia de aseguramiento de calidad del software para validar que todas las "
    "funcionalidades satisfagan los requerimientos del sistema y los criterios de aceptación. El plan detallado se "
    "encuentra totalmente adaptado en la plantilla oficial de Excel adjunta: Grupo#_CARNETSINTEGRANTES_PlandePruebas.xlsx.\n\n"
    "A continuación se sintetizan los lineamientos rectores del plan:\n"
    "• Alcance: 35 casos de prueba de cobertura funcional, validación de datos, límites, seguridad y errores sobre 5 roles.\n"
    "• Roles de QA: QA Lead (planificación y métricas), Desarrolladores (soporte y corrección), Product Owner (aprobación) y Scrum Master.\n"
    "• Criterios de Entrada: HU con AC completos, software desplegado en staging y datos de prueba configurados.\n"
    "• Criterios de Salida: 100% de casos ejecutados, 0 defectos críticos/altos abiertos y aprobación formal del PO.\n"
    "• Herramientas: Jira (gestión de incidencias), Excel (matriz de pruebas), Postman (pruebas de API REST), Git (versionamiento) y navegadores web estándar (Chrome, Edge, Firefox)."
)

add_custom_heading(doc, "6. CASOS DE PRUEBA DEL SISTEMA DENTALCARE", 1)
doc.add_paragraph(
    "Se presentan 35 casos de prueba exhaustivos organizados por Rol de Usuario. El catálogo incluye la tabla de alto nivel "
    "y la especificación procedural detallada alineada con las columnas oficiales de la plantilla institucional:"
)

# Insert summary table in Word
table_cp_summary = doc.add_table(rows=36, cols=4)
table_cp_summary.alignment = WD_TABLE_ALIGNMENT.CENTER
headers_sum = ["CASO DE PRUEBA", "DESCRIPCIÓN (OBJETIVO)", "CRITERIO DE ACEPTACIÓN", "RESULTADO OBTENIDO"]
for idx, h in enumerate(headers_sum):
    cell = table_cp_summary.cell(0, idx)
    cell.text = h
    set_cell_background(cell, "BDD6EE")
    cell.paragraphs[0].runs[0].font.bold = True
    cell.paragraphs[0].runs[0].font.size = Pt(9.5)

# Load test cases from Excel to guarantee exact consistency
import openpyxl
wb_data = openpyxl.load_workbook('Grupo#_CARNETSINTEGRANTES_PlandePruebas.xlsx')
ws_an_data = wb_data['PRUEBAS DE ALTO NIVEL']
for r_idx in range(2, 37):
    cp_code = str(ws_an_data.cell(r_idx, 2).value or '')
    desc_val = str(ws_an_data.cell(r_idx, 3).value or '')
    ac_val = str(ws_an_data.cell(r_idx, 5).value or '')
    res_val = str(ws_an_data.cell(r_idx, 7).value or '')
    
    table_cp_summary.cell(r_idx - 1, 0).text = cp_code
    table_cp_summary.cell(r_idx - 1, 1).text = desc_val
    table_cp_summary.cell(r_idx - 1, 2).text = ac_val
    table_cp_summary.cell(r_idx - 1, 3).text = res_val
    
    for c_i in range(4):
        table_cp_summary.cell(r_idx - 1, c_i).paragraphs[0].runs[0].font.size = Pt(8.5)

doc.add_paragraph(
    "\nNota: Para consultar el detalle procedimental celda a celda con sus 12 columnas reglamentarias (Precondición, Tipo de Prueba, "
    "Requerimiento, Regla de Negocio, Alcance, Descripción Procedural, Prerrequisito, Criterio de Aceptación, Resultado Esperado y Resultado Obtenido), "
    "remitirse a las hojas 'Detalle_AdminTI', 'Detalle_Recepcionista', 'Detalle_Odontologo', 'Detalle_AsistenteDental' y 'Detalle_Gerencia' "
    "del archivo Excel complementario Grupo#_CARNETSINTEGRANTES_PlandePruebas.xlsx."
)

add_custom_heading(doc, "7. GESTIÓN DE CONTROL DE VERSIONES Y ENLACES DE ACCESO", 1)
doc.add_paragraph(
    "En estricto apego al criterio de evaluación de Versionamiento (10%) y las normativas de la cátedra de Diseño de Sistemas II, "
    "a continuación se documentan los repositorios, ramas y accesos del sistema:\n\n"
    "1. Repositorio de Control de Versiones (Git):\n"
    "   • Enlace al Repositorio: [https://github.com/tu-organizacion/DentalCare-Repo-DSI215]\n"
    "   • Modelo de Ramificación: GitFlow (ramas main para releases estables, develop para integración y feature/sprint-X por funcionalidad).\n"
    "   • Evidencia de Commits: Registro de commits diarios y bien distribuidos entre todos los miembros del equipo, reflejando autoría y trabajo continuo.\n\n"
    "2. Carpeta Compartida en la Nube:\n"
    "   • Enlace a la Carpeta Compartida: [https://drive.google.com/drive/folders/ENLACE_CARPETA_COMPARTIDA_GRUPO]\n"
    "   • Contenido: Prototipos de UI/UX, diagramas de casos de uso aprobados, diccionario de datos y actas de sprint.\n\n"
    "3. Entorno de Despliegue en la Nube (Ambiente Remoto - No Local):\n"
    "   • URL de Acceso al Software: [https://dentalcare-app-dsi215.onrender.com] (o Railway / Azure / AWS)\n"
    "   • Base de Datos Remota: Instancia de base de datos relacional alojada en la nube (PostgreSQL/MySQL Cloud).\n"
    "   • Credenciales de Prueba para Evaluación:\n"
    "     - Administrador TI: admin@dentalcare.com / Admin2026*!\n"
    "     - Recepcionista: secretaria@dentalcare.com / Secre2026*!\n"
    "     - Odontólogo: dr.martinez@dentalcare.com / Doctor2026*!\n"
    "     - Asistente Dental: asistente@dentalcare.com / Asist2026*!\n"
    "     - Gerente: gerente@dentalcare.com / Gerente2026*!\n\n"
    "4. Tablero de Gestión Ágil en Jira:\n"
    "   • URL del Tablero Jira: [https://tu-dominio.atlassian.net/jira/software/projects/DENTALCARE/boards/1]"
)

add_custom_heading(doc, "8. CONCLUSIONES Y RECOMENDACIONES", 1)
doc.add_paragraph(
    "1. El proyecto DentalCare ha cumplido satisfactoriamente las metas establecidas para el primer período evaluado, "
    "superando la meta mínima del 50% de funcionalidades desarrolladas y funcionales con un 65.38% de avance (34 HDU finalizadas de 52).\n"
    "2. La definición formal de los DOD (Definición de Terminado) para cada sprint ha permitido elevar el estándar de calidad "
    "del software, evitando la acumulación de deuda técnica y garantizando que cada incremento cuente con diseño, pruebas y despliegue verificados.\n"
    "3. La formulación de un Plan de Pruebas de QA con 35 casos estructurados y diversificados asegura una cobertura holística "
    "de los flujos clínicos y administrativos, mitigando riesgos de seguridad, inconsistencias de datos y solapamientos de citas.\n"
    "4. Se recomienda para los Sprints 4 y 5 mantener el ritmo de commits en Git, implementar pruebas automatizadas para "
    "la exportación de reportes analíticos y realizar pruebas de carga con volumen simulado de consultas para monitorear el desempeño del servidor remoto."
)

add_custom_heading(doc, "9. ANEXOS Y REFERENCIAS", 1)
doc.add_paragraph(
    "• Anexo A: Archivo de Plan de Pruebas de QA en formato de hoja de cálculo: Grupo#_CARNETSINTEGRANTES_PlandePruebas.xlsx.\n"
    "• Anexo B: Matriz de Trazabilidad entre Requerimientos de Software, Historias de Jira y Casos de Prueba de QA.\n"
    "• Anexo C: Guía de Usuario Rápida para el Tutor Evaluador con credenciales de acceso para la defensa virtual."
)

doc.save('Grupo#_CARNETSINTEGRANTES_ProyI.docx')
print('Word document Grupo#_CARNETSINTEGRANTES_ProyI.docx created successfully!')
