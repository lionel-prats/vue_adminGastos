<script setup>
  import {ref, reactive, watch, computed, onMounted} from "vue"
  
  import {gastosFake} from "./data/gastosFake" // import fake para carga rapida de gastos inyectandolo en el state gastos (v141)

  import Presupuesto from "./components/Presupuesto.vue"
  import ControlPresupuesto from "./components/ControlPresupuesto.vue"
  import Modal from "./components/Modal.vue"
  import Filtros from "./components/Filtros.vue"
  import Gasto from "./components/Gasto.vue"

  import {generarId} from "./helpers"

  import iconoNuevoGasto from "./assets/img/nuevo-gasto.svg"

  const modal = reactive({
    mostrar: false,
    animar: false,
  })
  const presupuesto = ref(0) // state
  const disponible = ref(0) // state
  const gastado = ref(0) // state
  const filtro = ref("") // state (v141)

  const gasto = reactive({  // state
    nombre: "",
    cantidad: "",
    categoria: "",
    id: null,
    fecha: Date.now(), // número de milisegundos transcurridos desde las 00:00:00 UTC del 1 de enero de 1970 (v120)
  })

  const gastos = ref([]) // state
  // const gastos = ref(gastosFake) // state

  // este watch va a estar excuchando permanentemente por cambios en el state gastos, y el callback que le pasamos como segundo parametro se va a ejecutar cada vez que se modifique este state (v131)
  watch(gastos, () => { 
    const totalGastado = gastos.value.reduce( (total, gasto) => total + (gasto.cantidad), 0)
    gastado.value = totalGastado;
    disponible.value = presupuesto.value - gastado.value

    localStorage.setItem("gastos", JSON.stringify(gastos.value))
  }, {
      deep: true 
  })
  
  // watch para resetear el state gasto cada vez que se cierre el form modal para agregar un nuevo gasto (v135)
  watch(modal, () => { 
    if(!modal.mostrar) {
      reiniciarStateGasto()
    }
  }, {
      deep: true // deep solo es necesario cuando aplicamos un watch a un array u objeto
  })

  watch(presupuesto, () => {
    localStorage.setItem("presupuesto", presupuesto.value)
  })

  onMounted(() => {
    const presupuestoStorage = localStorage.getItem("presupuesto")
    if(presupuestoStorage) {
      presupuesto.value = +presupuestoStorage
      disponible.value = Number(presupuestoStorage)
    }
    
    const gastosStorage = localStorage.getItem("gastos")
    if(gastosStorage) {
      gastos.value = JSON.parse(gastosStorage)
    }
  })
  
  const definirPresupuesto = cantidad => {
    presupuesto.value = cantidad
    disponible.value = cantidad
  }

  const mostrarModal = () => {
    modal.mostrar = true
    setTimeout(() => {
      modal.animar = true
    }, 300);
  }
  
  const ocultarModal = () => {
    modal.animar = false
    setTimeout(() => {
      modal.mostrar = false
    }, 300);
  }

  const reiniciarStateGasto = () => {
    Object.assign(gasto, {
      nombre: "",
      cantidad: "",
      categoria: "",
      id: null,
      fecha: Date.now(),
    })
  }

  const guardarGasto = () => {
    if(gasto.id){ // editando gasto existente (v136)
      const {id} = gasto
      const i = gastos.value.findIndex(gasto => gasto.id === id)
      gastos.value[i] = {...gasto};
    } else { // agregando gasto nuevo (v136)
      gastos.value.push({
        ...gasto,
        id: generarId(),
      })
    }
    ocultarModal()
  }

  const seleccionarGasto = id => { // custom event (v134)
    const gastoEditar = gastos.value.filter( gasto => gasto.id === id)[0];
    Object.assign(gasto, gastoEditar)
    mostrarModal()
  }

  const eliminarGasto = id => { // custom event (v140)
    if(confirm("Eliminar?")) {
      gastos.value = gastos.value.filter( gastoState => gastoState.id !== id);
      ocultarModal()
    }
  }

  const gastosFiltrados = computed( () => {
    if(filtro.value) {
      return gastos.value.filter( gastoState => gastoState.categoria === filtro.value);
    }
    return gastos.value
  })
  
  const resetearApp = () => { // custom event (v145)
    if(confirm("Deseas reiniciar presupuesto y gastos?")) {
      gastos.value = []
      presupuesto.value = 0
      // localStorage.removeItem('presupuesto');
      // localStorage.removeItem('gastos');
    }
  }

</script>

<template>

  <!-- inyecto una clase css de forma condicional (v130) vvv -->
  <div 
    :class="{fijar: modal.mostrar}"
  >
    
    <header>
      <h1>Planificador de gastos</h1>
      <div class="contenedor-header contenedor sombra">
        <Presupuesto 
          v-if="presupuesto === 0"
          @definir-presupuesto="definirPresupuesto"
        />
        <ControlPresupuesto 
          v-else
          :presupuesto="presupuesto"
          :disponible="disponible"
          :gastado="gastado"
          @resetear-app="resetearApp"
        />
      </div>
    </header>
    <main v-if="presupuesto">
      <Filtros 
        v-if="gastos.length"
        v-model:filtro="filtro"
      />
      <div class="listado-gastos contenedor">
        <h2>{{ gastosFiltrados.length > 0 ? "Gastos" : "No hay gastos"}}</h2>
        <Gasto 
          v-for="gasto in gastosFiltrados"
          :key="gasto.id"
          :gasto="gasto"
          @seleccionar-gasto="seleccionarGasto"
        />
        <!-- @mostrar-modal="mostrarModal" -->

      </div>

      <div class="crear-gasto">
        <img 
          :src="iconoNuevoGasto" 
          alt="icono nuevo gasto"
          @click="mostrarModal"
        />
      </div>

      <Modal 
        v-if="modal.mostrar"
        @ocultar-modal="ocultarModal"
        @guardar-gasto="guardarGasto"  
        @eliminar-gasto="eliminarGasto"
        :modal="modal"
        :disponible="disponible"
        :id="gasto.id"
        v-model:nombre="gasto.nombre"
        v-model:cantidad="gasto.cantidad"
        v-model:categoria="gasto.categoria"
      />
    </main>
  </div>
</template>

<style>
  :root {
    --azul: #3b82f6;
    --blanco: #FFF;
    --gris-claro: #F5F5F5;
    --gris: #94a3b8;
    --gris-oscuro: #64748b;
    --negro: #000;
  }
  html {
    font-size: 62.5%;
    box-sizing: border-box;
  }
  *,
  *:before,
  *:after {
    box-sizing: inherit;
  }
  body {
    font-size: 1.6rem;
    font-family: "Lato", sans-serif; /* fuente importada en index.html en el v102 */
    background-color: var(--gris-claro);
  }
  h1 {
    font-size: 4rem;
  }
  h2 {
    font-size: 3rem;
  }

  /* estilos paar el modal de crear nuevo gasto (v130) */
  .fijar { 
    overflow: hidden;
    height: 100vh;
  }

  header {
    background-color: var(--azul);
  }
  header h1 {
    padding: 3rem 0;
    margin: 0;
    text-align: center;
    color: var(--blanco);
  }
  .contenedor {
    width: 90%;
    max-width: 80rem;
    margin: 0 auto;
  }
  .contenedor-header {
    margin-top: -5rem;
    transform: translateY(5rem);
    padding: 5rem;
  }
  .sombra {
    box-shadow: 0px 10px 15px -3px rgba(0,0,0,0.1);
    background-color: var(--blanco);
    border-radius: 1.2rem;
    padding: 5rem;
  }
  .crear-gasto {
    position: fixed;
    bottom: 5rem;
    right: 5rem;
  }
  .crear-gasto img {
    width: 5rem;
    cursor: pointer;
  }
  .listado-gastos {
    margin-top: 10rem;

  }
  .listado-gastos h2 {
    font-weight: 900;
    color: var(--gris-oscuro);
  }
</style>