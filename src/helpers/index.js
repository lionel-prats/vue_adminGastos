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