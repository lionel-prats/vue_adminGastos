export const formatearCantidad = cantidad => {
    // const moneda = "en-US"
    // const currency = "USD"
    const moneda = "es-AR"
    const currency = "ARS"
    return Number(cantidad).toLocaleString(moneda, {
        style: "currency",
        currency: currency
    })
}

export const generarId = () => {
    const fecha = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2)
    return random + fecha
}