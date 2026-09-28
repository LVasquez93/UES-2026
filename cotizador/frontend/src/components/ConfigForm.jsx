export default function ConfigForm({ config, setConfig }) {
  const set = (campo) => (e) => setConfig((c) => ({ ...c, [campo]: e.target.value }))

  return (
    <section className="card p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink/70">
        Datos de la cotización
      </h2>
      <div className="grid gap-4">
        <div>
          <label className="field-label">Usuario que cotiza</label>
          <input className="field" value={config.usuario} onChange={set('usuario')}
                 placeholder="Tu nombre o código" />
        </div>
        <div>
          <label className="field-label">Forma de pago</label>
          <input className="field" value={config.formaPago} onChange={set('formaPago')}
                 placeholder="Crédito 30 días, transferencia bancaria o cheque" />
          <p className="mt-1 text-xs text-ink/40">Déjalo vacío para usar el texto estándar.</p>
        </div>
        <div>
          <label className="field-label">Nota</label>
          <textarea className="field min-h-[72px] resize-y" value={config.nota} onChange={set('nota')}
                    placeholder="Tiempos de entrega y precios sujetos a cambios en inventario" />
        </div>
      </div>
    </section>
  )
}
