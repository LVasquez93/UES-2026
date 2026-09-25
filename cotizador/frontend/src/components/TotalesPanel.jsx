import { formatoDinero, numeroALetras } from '../utils/formato.js'
import { urlPdf } from '../api/cotizaciones.js'

function Linea({ etiqueta, valor, fuerte }) {
  return (
    <div className="flex items-baseline justify-between py-1">
      <span className={fuerte ? 'text-sm font-semibold text-ink' : 'text-sm text-ink/60'}>
        {etiqueta}
      </span>
      <span className={`tnum ${fuerte ? 'text-lg font-bold text-ink' : 'text-sm text-ink/80'}`}>
        ${formatoDinero(valor)}
      </span>
    </div>
  )
}

export default function TotalesPanel({ totales, valido, enviando, resultado, error, onGenerar, onReiniciar }) {
  return (
    <aside className="lg:sticky lg:top-6">
      <div className="card overflow-hidden">
        <div className="bg-ink px-5 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-white/80">
            Resumen
          </h2>
        </div>

        <div className="px-5 py-4">
          <Linea etiqueta="Subtotal" valor={totales.subtotal} />
          <Linea etiqueta="IVA (13%)" valor={totales.iva} />
          <div className="my-2 border-t border-line" />
          <Linea etiqueta="Total inversión" valor={totales.total} fuerte />

          <p className="mt-3 rounded-lg bg-page px-3 py-2 text-[11px] leading-snug text-ink/60">
            {numeroALetras(totales.total)}
          </p>
        </div>

        <div className="border-t border-line px-5 py-4">
          {!resultado && (
            <button className="btn-primary w-full" disabled={!valido || enviando} onClick={onGenerar}>
              {enviando ? 'Generando…' : 'Generar cotización'}
            </button>
          )}

          {resultado && (
            <div className="space-y-3">
              <div className="rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent-dark">
                Cotización <span className="font-bold">{resultado.numero}</span> generada.
              </div>
              <a className="btn-primary w-full" href={urlPdf(resultado.id)} target="_blank" rel="noreferrer">
                Abrir PDF
              </a>
              <button className="btn-ghost w-full justify-center" onClick={onReiniciar}>
                Crear otra
              </button>
            </div>
          )}

          {error && (
            <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
          )}

          {!valido && !resultado && (
            <p className="mt-3 text-center text-xs text-ink/40">
              Completa cliente, usuario y al menos un producto.
            </p>
          )}
        </div>
      </div>
    </aside>
  )
}
