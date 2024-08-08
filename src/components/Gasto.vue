<script setup>

    import IconoAhorro from '../assets/img/icono_ahorro.svg'
    import IconoCasa from '../assets/img/icono_casa.svg'
    import IconoComida from '../assets/img/icono_comida.svg'
    import IconoGastos from '../assets/img/icono_gastos.svg'
    import IconoOcio from '../assets/img/icono_ocio.svg'
    import IconoSalud from '../assets/img/icono_salud.svg'
    import IconoSuscripciones from '../assets/img/icono_suscripciones.svg'

    import {formatearCantidad, formatearFecha} from "../helpers"

    const props = defineProps({
        gasto: {
            type: Object,
            required: true,
        },
    })

    const diccionarioIconos = {
        ahorro : IconoAhorro,
        comida : IconoComida,
        casa : IconoCasa,
        gastos : IconoGastos,
        ocio : IconoOcio,
        salud : IconoSalud,
        suscripciones : IconoSuscripciones
    }

</script>
<template>
    <div class="gasto sombra">
        <div class="contenido">
            <img 
                class="icono"
                style="width: 5rem"
                :src="diccionarioIconos[gasto.categoria]" 
                alt="Icono gasto"
            >
            <div class="detalles">
                <p class="categoria">{{ gasto.categoria }}</p>
                <p class="nombre">{{ gasto.nombre }}</p>
                <p class="fecha">{{ formatearFecha(gasto.fecha) }}</p>
            </div>
        </div>
        <p class="cantidad">{{ formatearCantidad(gasto.cantidad) }}</p>
    </div>
</template>


<style lang="scss" scoped>

</style>