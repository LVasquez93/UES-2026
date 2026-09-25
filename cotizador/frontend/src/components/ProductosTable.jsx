import ProductoRow from './ProductoRow.jsx'

export default function ProductosTable({ productos, onAgregar, onEliminar, onActualizar }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/70">
          Productos
        </h2>
        <button type="button" onClick={onAgregar} className="btn-ghost">
          + Agregar producto
        </button>
      </div>

      <div className="space-y-3">
        {productos.map((p, i) => (
          <ProductoRow
            key={p.id}
            indice={i + 1}
            producto={p}
            onChange={onActualizar}
            onEliminar={onEliminar}
            puedeEliminar={productos.length > 1}
          />
        ))}
      </div>
    </section>
  )
}
