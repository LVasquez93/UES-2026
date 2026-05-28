<div className="odontogram-container" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
              
              {/* RENDERIZADO CONDICIONAL: Si es Programado o Realizado, mostramos tabla de historial */}
              {activeFilter === 'Programado' || activeFilter === 'Realizado' ? (
                
                <div className="w-100 p-3 border rounded-3 bg-white" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <h6 className="fw-bold text-primary mb-3">
                    <i className="bi bi-clock-history me-2"></i>
                    {activeFilter === 'Realizado' ? 'Historial de Tratamientos' : 'Tratamientos Programados'}
                  </h6>
                  
                  <div className="alert alert-light border small text-muted">
                    <i className="bi bi-info-circle me-2"></i>
                    Aquí se visualizará el historial global de {cita.nombreCompletoPaciente}.
                  </div>

                  {/* Tabla temporal que luego llenaremos con el nuevo Endpoint de Spring Boot */}
                  <table className="table table-hover table-sm mt-2">
                    <thead className="table-light">
                      <tr>
                        <th>Fecha</th>
                        <th>Pieza</th>
                        <th>Tratamiento</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan="4" className="text-center text-muted py-4">
                          <i className="bi bi-folder2-open d-block mb-2" style={{ fontSize: '1.5rem' }}></i>
                          Conectando historial...
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              ) : (
                
                {/* DE LO CONTRARIO: Si es Hallazgos o Presupuestado, mostramos el gráfico interactivo */}
                <>
                  <Odontogram
                    onChange={handleOdontogramChange}
                    theme="light"
                    notation="FDI"
                    className="custom-odontogram"
                  />
                  <p className="text-center text-muted small mt-2">
                    Selecciona piezas en el grafico y registra el tratamiento en el panel derecho
                  </p>
                </>

              )}

            </div>