// Formato de moneda igual al backend: 1.234,56 -> "1,234.56"
export function formatoDinero(n) {
  const num = Number.isFinite(n) ? n : 0
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Número a letras en español (para la vista previa; el valor oficial lo calcula el backend).
const UNIDADES = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
  'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve',
  'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis',
  'veintisiete', 'veintiocho', 'veintinueve']
const DECENAS = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa']
const CENTENAS = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos',
  'seiscientos', 'setecientos', 'ochocientos', 'novecientos']

function menorMil(n) {
  if (n === 0) return ''
  if (n === 100) return 'cien'
  let texto = ''
  const c = Math.floor(n / 100)
  const resto = n % 100
  if (c > 0) texto += CENTENAS[c] + ' '
  if (resto > 0) {
    if (resto < 30) texto += UNIDADES[resto]
    else {
      const d = Math.floor(resto / 10)
      const u = resto % 10
      texto += DECENAS[d] + (u > 0 ? ' y ' + UNIDADES[u] : '')
    }
  }
  return texto.trim()
}

function enteroALetras(n) {
  if (n === 0) return 'cero'
  let texto = ''
  const millones = Math.floor(n / 1_000_000)
  const miles = Math.floor((n % 1_000_000) / 1000)
  const resto = n % 1000
  if (millones > 0) texto += (millones === 1 ? 'un millón' : menorMil(millones) + ' millones') + ' '
  if (miles > 0) texto += (miles === 1 ? 'mil' : menorMil(miles) + ' mil') + ' '
  if (resto > 0) texto += menorMil(resto)
  return texto.trim()
}

export function numeroALetras(monto) {
  const entero = Math.floor(monto)
  const centavos = Math.round((monto - entero) * 100)
  const letras = enteroALetras(entero).toUpperCase()
  return `${letras} DÓLARES CON ${String(centavos).padStart(2, '0')}/100`
}
