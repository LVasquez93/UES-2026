import { useCotizacion } from './hooks/useCotizacion.js'
import ClienteForm from './components/ClienteForm.jsx'
import ConfigForm from './components/ConfigForm.jsx'
import ProductosTable from './components/ProductosTable.jsx'
import TotalesPanel from './components/TotalesPanel.jsx'

export default function App() {
  const c = useCotizacion()

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-ink">Cotizaciones</h1>
            <p className="text-xs text-ink/50">RETAIL El Salvador, S.A. de C.V.</p>
          </div>
          <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
            Nueva cotización
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Columna del formulario */}
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <ClienteForm cliente={c.cliente} setCliente={c.setCliente} />
              <ConfigForm config={c.config} setConfig={c.setConfig} />
            </div>
            <ProductosTable
              productos={c.productos}
              onAgregar={c.agregarProducto}
              onEliminar={c.eliminarProducto}
              onActualizar={c.actualizarProducto}
            />
          </div>

          {/* Columna de totales */}
          <TotalesPanel
            totales={c.totales}
            valido={c.valido}
            enviando={c.enviando}
            resultado={c.resultado}
            error={c.error}
            onGenerar={c.generar}
            onReiniciar={c.reiniciar}
          />
        </div>
      </main>
    </div>
  )
}
