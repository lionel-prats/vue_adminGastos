<script setup>
    import {ref, computed} from "vue"

    import cerrarModal from "../assets/img/cerrar.svg"
    import Alerta from "./Alerta.vue"

    const error = ref("")

    const emit = defineEmits(["ocultar-modal", "guardar-gasto", "update:nombre", "update:cantidad", "update:categoria", "eliminar-gasto"])

    const props = defineProps({
        modal: {
            type: Object,
            required: true,
        },
        nombre: {
            type: String,
            required: true,
        },
        cantidad: {
            type: [String, Number],
            required: true,
        },
        categoria: {
            type: String,
            required: true,
        },
        disponible: {
            type: Number,
            required: true,
        },
        id: {
            type: [String, null],
            required: true,
        },
    })

    const gastoCantidadAnterior = props.cantidad
    const agregarGasto = () => {
        const {nombre, cantidad, categoria, disponible, id} = props
        if([nombre, cantidad, categoria].includes("")){
            error.value = "Todos los campos son obligatorios"
            setTimeout(() => {
                error.value = ""
            }, 3000);
            return 
        } 
        if(cantidad <= 0){
            error.value = "Cantidad no válida"
            setTimeout(() => {
                error.value = ""
            }, 3000);
            return 
        } 

        // bloque para validar que el usuario no pueda asignar a un gasto mas dinero del presupuesto disponible (tanto si es un nuevo gasto como si esta editanto uno ya existente)
        if(id) { 
            // si id != null, se esta editando un gasto existente 
            // entonces consideramos la cantidad previa del gasto para validar si el usuario se esta excediendo del saldo disponible en caso de que quiera actualizar el valor (v137)
            if(cantidad > gastoCantidadAnterior + disponible){
                error.value = `Saldo insuficuente. Disponible $${disponible + gastoCantidadAnterior}.`
                setTimeout(() => {
                    error.value = ""
                }, 3000);
                return 
            } 
        } else {
            // si id === null, se trata de un gasto nuevo, por lo que no hace falta considerar la camtidad anterior (el gasto es nuevo, gastoCantidadAnterior = "") (v137)
            if(cantidad > disponible){
                error.value = `Saldo insuficuente. Disponible $${disponible}.`
                setTimeout(() => {
                    error.value = ""
                }, 3000);
                return 
            } 
        }
        emit("guardar-gasto")
    }

    // computedProperty para renderizar de forma dinamica la leyenda del <legend> y del <input type="submit"> del form (v138)
    const isEditing = computed( () => {
        return props.id
    })

</script>

<template>
    <div class="modal">
        <div class="cerrar-modal">
            <img 
                :src="cerrarModal" 
                alt="icono cerrar modal"
                @click="$event => $emit('ocultar-modal')"
            />
        </div>
        <div 
            class="contenedor contenedor-formulario"
            :class="[modal.animar ? 'animar' : 'cerrar']"    
        >
            <form 
                class="nuevo-gasto"
                @submit.prevent="agregarGasto"        
            >
                <legend>{{ isEditing ? 'Editar Registro' : 'Crear Nuevo Registro' }}</legend>
                <!-- <legend>{{ id ? 'Editar Registro' : 'Crear Nuevo Registro' }}</legend> -->

                <Alerta v-if="error">
                    {{error}}
                </Alerta>
                <div class="campo">
                    <label for="nombre">Nombre Gasto:</label>
                    <input 
                        type="text"
                        id="nombre"
                        placeholder="Añade el Nombre del Gasto"
                        :value="nombre"
                        @input="$emit('update:nombre', $event.target.value)"
                    />
                </div>
                <div class="campo">
                    <label for="cantidad">Cantidad:</label>
                    <input 
                        type="number"
                        id="cantidad"
                        placeholder="Añade la cantidad del Gasto, ej. 300"
                        :value="cantidad"
                        @input="$emit('update:cantidad', +$event.target.value)"
                    />
                    <!-- con "+$event.target.value" estoy casteando el String a Number (funcionalidad nativa de JS) (v121) -->
                </div>
                <div class="campo">
                    <label for="categoría">Categoría:</label>
                    <select 
                        id="categoría"
                        :value="categoria"    
                        @input="$emit('update:categoria', $event.target.value)"
                    >
                        <option value="">-- Seleccione --</option>
                        <option value="ahorro">Ahorro</option>
                        <option value="comida">Comida</option>
                        <option value="casa">Casa</option>
                        <option value="gastos">Gastos Varios</option>
                        <option value="ocio">Ocio</option>
                        <option value="salud">Salud</option>
                        <option value="suscripciones">Suscripciones</option>
                    </select>
                </div>
                <input 
                    type="submit" 
                    :value="[isEditing ? 'Guardar Cambios' : 'Añadir Gasto']"           
                />
                <!-- :value="[id ? 'Guardar Cambios' : 'Añadir Gasto']"            -->
            </form>

            <button
                type="button"
                class="btn-eliminar"
                v-if="isEditing"
                @click="$emit('eliminar-gasto', id)"
            >
                Eliminar Gasto
            </button>

        </div>
    </div>
</template>

<style scoped>
    .modal {
        position: absolute;
        background-color: rgb(0 0 0 / .9);
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
    }

    .cerrar-modal {
        position: absolute;
        top: 3rem;
        right: 3rem;
    }
    .cerrar-modal img {
        width: 3rem;
        cursor: pointer;
    }

    .contenedor-formulario {
        transition-property: all;
        transition-duration: 300ms;
        transition-timing-function: ease-in;
        opacity: 0;
    }
    .contenedor-formulario.animar {
        opacity: 1; 
    }
    
    .contenedor-formulario.cerrar {
        opacity: 0; 
    }

    .nuevo-gasto {
        margin: 10rem auto 0 auto;
        display: grid;
        gap: 2rem;
    }
    .nuevo-gasto legend {
        text-align: center;
        color: var(--blanco);
        font-size: 3rem;
        font-weight: 700;
    }
    .campo {
        display: grid;
        gap: 1rem;
    }
    .nuevo-gasto input,
    .nuevo-gasto select {
        background-color: var(--gris-claro);
        border-radius: 1rem;
        padding: 1rem;
        border: none;
        font-size: 2.2rem;
    }
    .nuevo-gasto label{
        color: var(--blanco);
        font-size: 3rem;
    }
    .nuevo-gasto input[type="submit"] {
        background-color: var(--azul);
        color: var(--blanco);
        font-weight: 700;
        cursor: pointer;
    }
    .btn-eliminar {
        border: none;
        padding: 1rem;
        width: 100%;
        background-color: #ef4444;
        font-weight: 700;
        font-size: 1.6rem;
        color: var(--blanco);
        margin-top: 10rem;
        cursor: pointer;
    }
</style>