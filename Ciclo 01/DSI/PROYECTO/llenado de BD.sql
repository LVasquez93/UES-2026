INSERT INTO ROL (nombre_rol) 
VALUES ('ODONTOLOGO');

INSERT INTO PACIENTE (nombre_paciente, apellido_paciente, telefono_paciente, fecha_nacimiento_paciente, numero_identidad_paciente, email_paciente, contacto_emergencia) 
VALUES ('Roberto', 'Carlos', '7777-8888', '1990-05-15 00:00:00', '01234567-8', 'roberto.c@email.com', 'Maria Rosa 7777-9999');

INSERT INTO TRATAMIENTO (nombre_tratamiento, descripcion_tratamiento, costo_tratamiento) 
VALUES ('Resina Simple', 'Restauración con resina compuesta en una cara', 35.00);

INSERT INTO PROVEEDOR (razon_social, nit, nrc, telefono, email, nombre_contacto, es_activo) 
VALUES ('Distribuidora Dental S.A.', '0614-010190-101-1', '123456-7', '2222-3333', 'ventas@distribuidoradental.com', 'Ana Lopez', 1);

-- 2. Dependen del Nivel 1
-- USUARIO depende de ROL
INSERT INTO USUARIO (username_usuario, passwor_usuario, email_usuario, es_activo, nombre_usuario, apellido_usuario, id_rol) 
VALUES ('dr.perez', 'password_hash_123', 'dr.perez@dentalcare.com', 1, 'Juan', 'Perez', 1);

-- MEDICAMENTO depende de PROVEEDOR
INSERT INTO MEDICAMENTO (nombre_medicamento, componente_activo, concentracion, costo_medicamento, cantidad_inventario, id_proveedor) 
VALUES ('Amoxicilina 500mg', 'Amoxicilina', '500 mg', 0.25, 150, 1);

-- 3. Dependen del Nivel 2
-- ODONTOLOGO depende de USUARIO
INSERT INTO ODONTOLOGO (id_usuario, especialidad_odontologo, jvpo_id) 
VALUES (1, 'GENERAL', 'JVPO-9876');

-- MOVIMIENTO_INVENTARIO depende de USUARIO y MEDICAMENTO
INSERT INTO MOVIMIENTO_INVENTARIO (id_usuario, tipo_movimiento, cantidad, fecha_movimiento, motivo, id_medicamento) 
VALUES (1, 'INGRESO', 150, '2026-05-21 08:00:00', 'Compra inicial a proveedor', 1);

-- 4. Dependen del Nivel 3 (y anteriores)
-- CITA depende de ODONTOLOGO y PACIENTE
INSERT INTO CITA (id_odontologo, fecha_cita, hora_inicio_cita, hora_fin_cita, motivo_cancelacion, estado_cita, id_paciente) 
VALUES (1, '2026-05-22', '2026-05-22 10:00:00', '2026-05-22 11:00:00', NULL, 'PROGRAMADA', 1);

-- 5. Dependen de CITA
-- EVALUACION_CLINICA depende de CITA
INSERT INTO EVALUACION_CLINICA (id_cita, diagnostico, observaciones) 
VALUES (1, 'Caries incipiente en pieza 14', 'Paciente refiere ligera sensibilidad al frío');

-- PRESCRIPCION depende de CITA
INSERT INTO PRESCRIPCION (id_cita, fecha_prescripcion) 
VALUES (1, '2026-05-22 10:45:00');

-- 6. Dependen del Nivel 5 (y anteriores)
-- PLAN_TRATAMIENTO depende de TRATAMIENTO y EVALUACION_CLINICA
INSERT INTO PLAN_TRATAMIENTO (id_tratamiento, pieza_dental, estado_plan, id_evaluacion_clinica) 
VALUES (1, 14, 'PENDIENTE', 1);

-- DETALLE_PRESCRIPCION depende de PRESCRIPCION y MEDICAMENTO
INSERT INTO DETALLE_PRESCRIPCION (id_prescripcion, dosis_prescripcion, frecuencia_prescripcion, duracion_prescripcion, id_medicamento, indicaciones_prescripcion) 
VALUES (1, '1 cápsula', 'Cada 8 horas', 7, 1, 'Tomar después de las comidas');

-- 7. Dependen de PLAN_TRATAMIENTO y CITA
-- EVOLUCION_TRATAMIENTO depende de PLAN_TRATAMIENTO y CITA
INSERT INTO EVOLUCION_TRATAMIENTO (id_plan_tratamiento, estado_evolucion_tratamiento, fecha_tratamiento, notas_evolucion_tratamiento, id_cita) 
VALUES (1, 'EN_PROGRESO', '2026-05-22 10:30:00', 'Se realizó limpieza inicial, resina programada para próxima cita', 1);

select * from cita