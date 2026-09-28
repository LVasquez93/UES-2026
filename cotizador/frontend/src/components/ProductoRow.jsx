import { useState } from 'react'
import { formatoDinero } from '../utils/formato.js'

export default function ProductoRow({ indice, producto, onChange, onEliminar, puedeEliminar }) {
  const [nuevaCar, setNuevaCar] = useState('')

  const set = (campo) => (e) => onChange(producto.id, campo, e.target.value)
  const totalLinea = (Number(producto.cantidad) || 0) * (Number(producto.precio) || 0)

  const agregarCar = () => {
    const v = nuevaCar.trim()
    if (!v) return
    onChange(producto.id, 'caracteristicas', [...producto.caracteristicas, v])
    setNuevaCar('')
  }
  const quitarCar = (i) =>
    onChange(producto.id, 'caracteristicas', producto.caracteristicas.filter((_, idx) => idx !== i))

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
          {indice}
        </span>
        <button type="button" onClick={() => onEliminar(producto.id)} disabled={!puedeEliminar}
                className="text-xs font-medium text-ink/40 transition hover:text-rose-500 disabled:opacity-30">
          Eliminar
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-12">
        <div className="sm:col-span-12">
          <label className="field-label">Descripción</label>
          <input className="field" value={producto.descripcion} onChange={set('descripcion')}
                 placeholder="Aire acondicionado tipo split 24,000 BTU" />
        </div>
        <div className="sm:col-span-3">
          <label className="field-label">Cantidad</label>
          <input className="field tnum" type="number" min="1" value={producto.cantidad}
                 onChange={set('cantidad')} />
        </div>
        <div className="sm:col-span-4">
          <label className="field-label">Precio unitario</label>
          <input className="field tnum" type="number" min="0" step="0.01" value={producto.precio}
                 onChange={set('precio')} placeholder="0.00" />
        </div>
        <div className="sm:col-span-5">
          <label className="field-label">Entrega</label>
          <input className="field" value={producto.entrega} onChange={set('entrega')}
                 placeholder="De 6 a 8 semanas" />
        </div>
      </div>

      {/* Características */}
      <div className="mt-3">
        <label className="field-label">Características</label>
        <div className="flex flex-wrap gap-2">
          {producto.caracteristicas.map((c, i) => (
            <span key={i} className="inline-flex items-center gap-1 rounded-md bg-line/70 px-2 py-1 text-xs text-ink/80">
              {c}
              <button type="button" onClick={() => quitarCar(i)}
                      className="text-ink/40 hover:text-rose-500">×</button>
            </span>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input className="field" value={nuevaCar} onChange={(e) => setNuevaCar(e.target.value)}
                 onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregarCar() } }}
                 placeholder="Agregar característica y presiona Enter" />
          <button type="button" onClick={agregarCar} className="btn-ghost shrink-0">Agregar</button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end border-t border-line pt-3 text-sm">
        <span className="text-ink/50">Total línea:&nbsp;</span>
        <span className="tnum font-semibold text-ink">${formatoDinero(totalLinea)}</span>
      </div>
    </div>
  )
}
