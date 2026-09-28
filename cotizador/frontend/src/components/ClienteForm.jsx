export default function ClienteForm({ cliente, setCliente }) {
  const set = (campo) => (e) => setCliente((c) => ({ ...c, [campo]: e.target.value }))

  return (
    <section className="card p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink/70">
        Cliente
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="field-label">Nombre del contacto</label>
          <input className="field" value={cliente.nombre} onChange={set('nombre')}
                 placeholder="Ing. María Hernández" />
        </div>
        <div>
          <label className="field-label">Empresa</label>
          <input className="field" value={cliente.empresa} onChange={set('empresa')}
                 placeholder="Distribuidora del Pacífico" />
        </div>
        <div>
          <label className="field-label">Departamento</label>
          <input className="field" value={cliente.departamento} onChange={set('departamento')}
                 placeholder="Compras" />
        </div>
      </div>
    </section>
  )
}
