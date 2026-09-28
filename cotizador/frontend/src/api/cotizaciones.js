const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

async function manejar(resp) {
  if (!resp.ok) {
    let mensaje = `Error ${resp.status}`
    try {
      const data = await resp.json()
      mensaje = data.error || mensaje
    } catch { /* respuesta sin cuerpo JSON */ }
    throw new Error(mensaje)
  }
  return resp.json()
}

export async function crearCotizacion(payload) {
  const resp = await fetch(`${BASE}/cotizaciones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return manejar(resp)
}

export async function listarCotizaciones() {
  return manejar(await fetch(`${BASE}/cotizaciones`))
}

export function urlPdf(id) {
  return `${BASE}/cotizaciones/${id}/pdf`
}
