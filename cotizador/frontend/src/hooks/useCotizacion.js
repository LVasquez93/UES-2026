import { useMemo, useState } from 'react'
import { crearCotizacion } from '../api/cotizaciones.js'

const IVA = 0.13

function productoVacio() {
  return {
    id: crypto.randomUUID(),
    descripcion: '',
    cantidad: 1,
    precio: '',
    entrega: '',
    caracteristicas: [],
  }
}

export function useCotizacion() {
  const [cliente, setCliente] = useState({ nombre: '', empresa: '', departamento: '' })
  const [config, setConfig] = useState({ usuario: '', formaPago: '', nota: '' })
  const [productos, setProductos] = useState([productoVacio()])
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState(null)

  // --- Totales recalculados en vivo ---
  const totales = useMemo(() => {
    const subtotal = productos.reduce((acc, p) => {
      const cant = Number(p.cantidad) || 0
      const precio = Number(p.precio) || 0
      return acc + cant * precio
    }, 0)
    const iva = subtotal * IVA
    return { subtotal, iva, total: subtotal + iva }
  }, [productos])

  // --- Mutaciones de productos ---
  const agregarProducto = () => setProductos((ps) => [...ps, productoVacio()])
  const eliminarProducto = (id) =>
    setProductos((ps) => (ps.length > 1 ? ps.filter((p) => p.id !== id) : ps))
  const actualizarProducto = (id, campo, valor) =>
    setProductos((ps) => ps.map((p) => (p.id === id ? { ...p, [campo]: valor } : p)))

  // --- Validación mínima antes de enviar ---
  const valido =
    cliente.nombre.trim() &&
    cliente.empresa.trim() &&
    config.usuario.trim() &&
    productos.every((p) => p.descripcion.trim() && Number(p.cantidad) > 0 && Number(p.precio) >= 0)

  const generar = async () => {
    setError(null)
    setResultado(null)
    setEnviando(true)
    try {
      const payload = {
        usuario: config.usuario,
        clienteNombre: cliente.nombre,
        clienteEmpresa: cliente.empresa,
        clienteDepartamento: cliente.departamento,
        formaPago: config.formaPago,
        nota: config.nota,
        items: productos.map((p) => ({
          descripcion: p.descripcion,
          cantidad: Number(p.cantidad),
          precio: Number(p.precio),
          entrega: p.entrega,
          caracteristicas: p.caracteristicas,
        })),
      }
      const data = await crearCotizacion(payload)
      setResultado(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setEnviando(false)
    }
  }

  const reiniciar = () => {
    setCliente({ nombre: '', empresa: '', departamento: '' })
    setProductos([productoVacio()])
    setResultado(null)
    setError(null)
  }

  return {
    cliente, setCliente,
    config, setConfig,
    productos, agregarProducto, eliminarProducto, actualizarProducto,
    totales, valido, enviando, resultado, error,
    generar, reiniciar,
  }
}
