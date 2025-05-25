import { getCookie } from "../expresiones.js";
console.log("Categorias");

// Configuración base
const API_BASE_URL = 'http://18.223.102.119:8080/api-REST';
const CATEGORIAS_URL = `${API_BASE_URL}/categories`;

// Elementos del DOM
const btnGuardarNuevo = document.getElementById("btnGuardarNuevo");
const btnGuardarEdicion = document.getElementById("btnGuardarEdicion");
const btnConfirmarEliminar = document.getElementById("btnConfirmarEliminar");

// Modales
const modalCrear = new bootstrap.Modal(document.getElementById('crearModal'));
const modalEditar = new bootstrap.Modal(document.getElementById('editarModal'));
const modalEliminar = new bootstrap.Modal(document.getElementById('eliminarModal'));

// Función para mostrar notificaciones en el modal especificado
function mostrarNotificacion(mensaje, tipo = "success", contenedorId) {
    const notificacion = document.getElementById(contenedorId);
    if (!notificacion) {
        console.error(`Contenedor de notificación ${contenedorId} no encontrado`);
        return;
    }
    notificacion.textContent = mensaje;
    notificacion.className = `alert alert-${tipo} visible`;
    setTimeout(() => {
        notificacion.classList.add("fade");
        setTimeout(() => {
            notificacion.className = "alert d-none";
            notificacion.textContent = "";
        }, 500);
    }, 3000);
}

// Función para limpiar notificaciones al cerrar un modal
function limpiarNotificacion(contenedorId) {
    const notificacion = document.getElementById(contenedorId);
    if (notificacion) {
        notificacion.className = "alert d-none";
        notificacion.textContent = "";
    }
}

// Helper function to get existing category names from DataTable
function getExistingCategoryNames(table, excludeId = null) {
    return table
        .rows()
        .data()
        .toArray()
        .filter(row => {
            if (!excludeId) return true;
            const rowId = $(row[2]).find('.btn-editar').data('id');
            return rowId != excludeId;
        })
        .map(row => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(row[1], 'text/html');
            return doc.body.textContent.toLowerCase();
        });
}

// Función para cargar las categorías desde la API
async function cargarCategorias() {
    try {
        console.log('Cargando categorías...');
        console.log('Token:', getCookie("token"));
        const response = await fetch(CATEGORIAS_URL, {
            headers: {
                'Authorization': `Bearer ${getCookie("token")}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error al cargar categorías: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Datos recibidos:', data);
        if (!data.data || !Array.isArray(data.data)) {
            throw new Error('Formato de datos inválido: data.data no es un arreglo');
        }

        mostrarCategoriasEnTabla(data.data);
    } catch (error) {
        console.error('Error en cargarCategorias:', error);
        console.log(error.message);
    }
}

// Función para mostrar las categorías en la tabla
function mostrarCategoriasEnTabla(categorias) {
    console.log('Mostrando categorías en tabla:', categorias);
    const table = $('#dataTable');
    const tbody = table.find('tbody');
    tbody.empty();

    categorias.forEach((categoria, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td><span class="nombre">${categoria.Name}</span></td>
            <td>
                <button class="btn btn-outline-primary btn-sm btn-editar" data-id="${categoria.Id}">
                    <i class="bi bi-pencil"></i> Editar
                </button>
                <button class="btn btn-outline-danger btn-sm btn-eliminar ml-1" data-id="${categoria.Id}">
                    <i class="bi bi-trash"></i> Eliminar
                </button>
            </td>
        `;
        tbody.append(tr);
    });

    if ($.fn.DataTable.isDataTable(table)) {
        console.log('Destruyendo DataTables existente...');
        table.DataTable().clear().destroy();
    }

    console.log('Inicializando DataTables...');
    table.DataTable({
        language: {
            decimal: "",
            emptyTable: "No hay datos disponibles en la tabla",
            info: "Mostrando _START_ a _END_ de _TOTAL_ entradas",
            infoEmpty: "Mostrando 0 a 0 de 0 entradas",
            infoFiltered: "(filtrado de _MAX_ entradas totales)",
            infoPostFix: "",
            thousands: ",",
            lengthMenu: "Mostrar _MENU_ entradas",
            loadingRecords: "Cargando...",
            processing: "Procesando...",
            search: "Buscar:",
            zeroRecords: "No se encontraron registros coincidentes",
            paginate: {
                first: "Primero",
                last: "Último",
                next: "Siguiente",
                previous: "Anterior"
            },
            aria: {
                sortAscending: ": activar para ordenar la columna de manera ascendente",
                sortDescending: ": activar para ordenar la columna de manera descendente"
            }
        },
        destroy: true
    });
}

// Función para crear una nueva categoría
async function crearCategoria() {
    const nombre = document.getElementById('nombreNuevo').value.trim();

    if (!nombre) {
        mostrarNotificacion('El nombre de la categoría es requerido', 'warning', 'notificacionCrear');
        return;
    }

    const table = $('#dataTable').DataTable();
    const nombresExistentes = getExistingCategoryNames(table);
    
    if (nombresExistentes.includes(nombre.toLowerCase())) {
        mostrarNotificacion('Ya existe una categoría con este nombre', 'warning', 'notificacionCrear');
        return;
    }

    try {
        console.log('Creando categoría:', nombre);
        const response = await fetch(`${CATEGORIAS_URL}/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getCookie("token")}`
            },
            body: JSON.stringify({ Name: nombre })
        });

        const dataCategory = await response.json();
        const data = dataCategory.category;
        console.log('Respuesta de crear categoría:', JSON.stringify(data, null, 2));
        if (response.ok) {
            if (!data || !data.Id || !data.Name) {
                console.error('Respuesta de la API inválida:', data);
                throw new Error('Respuesta de la API inválida: no se devolvió la categoría creada');
            }

            mostrarNotificacion('Categoría creada exitosamente', 'success', 'notificacionCrear');
            modalCrear.hide();
            document.getElementById('formCrear').reset();

            const nuevaCategoria = data;
            const rowCount = table.rows().count() + 1;

            try {
                console.log('Agregando fila a DataTables:', {
                    rowCount,
                    Name: nuevaCategoria.Name,
                    Id: nuevaCategoria.Id
                });
                table.row.add([
                    rowCount,
                    `<span class="nombre">${nuevaCategoria.Name}</span>`,
                    `
                    <button class="btn btn-outline-primary btn-sm btn-editar" data-id="${nuevaCategoria.Id}">
                        <i class="bi bi-pencil"></i> Editar
                    </button>
                    <button class="btn btn-outline-danger btn-sm btn-eliminar ml-1" data-id="${nuevaCategoria.Id}">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                    `
                ]).draw();
                console.log('Fila agregada exitosamente');
            } catch (error) {
                console.error('Error al agregar fila a DataTables:', error);
                mostrarNotificacion('Categoría creada, pero no se pudo actualizar la tabla. Recargando datos...', 'warning', 'notificacionCrear');
                await cargarCategorias();
            }
        } else {
            throw new Error(data.message || `Error al crear categoría: ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error en crearCategoria:', error);
        mostrarNotificacion(error.message, 'danger', 'notificacionCrear');
    }
}

// Función para cargar datos en el modal de edición
function cargarDatosEdicion(btn) {
    console.log('Cargando datos para edición...');
    const id = btn.getAttribute('data-id');
    const fila = btn.closest('tr');
    const nombreElement = fila.querySelector('.nombre');

    if (!nombreElement) {
        console.error('No se encontró la clase .nombre en la fila:', fila);
        mostrarNotificacion('Error al cargar datos de la categoría: estructura de la tabla inválida', 'danger', 'notificacionEditar');
        return;
    }

    const nombre = nombreElement.textContent;
    document.getElementById('idEditar').value = id;
    document.getElementById('nombreEditar').value = nombre;
    modalEditar.show();
}

// Función para actualizar una categoría
async function actualizarCategoria() {
    const id = document.getElementById('idEditar').value;
    const nombre = document.getElementById('nombreEditar').value.trim();

    if (!nombre) {
        mostrarNotificacion('El nombre de la categoría es requerido', 'warning', 'notificacionEditar');
        return;
    }

    const table = $('#dataTable').DataTable();
    const nombresExistentes = getExistingCategoryNames(table, id);
    
    if (nombresExistentes.includes(nombre.toLowerCase())) {
        mostrarNotificacion('Ya existe una categoría con este nombre', 'warning', 'notificacionEditar');
        return;
    }

    try {
        console.log('Actualizando categoría:', { id, nombre });
        const response = await fetch(`${CATEGORIAS_URL}/edit/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getCookie("token")}`
            },
            body: JSON.stringify({ Name: nombre })
        });

        const data = await response.json();
        console.log('Respuesta de actualizar categoría:', data);

        if (response.ok) {
            console.log('Mostrando notificación de éxito para actualización');
            mostrarNotificacion('Categoría actualizada exitosamente', 'success', 'notificacionEditar');

            const row = table.rows((idx, data, node) => {
                return $(node).find('.btn-editar').data('id') == id;
            }).nodes()[0];

            if (!row) {
                console.error('Fila no encontrada para ID:', id);
                mostrarNotificacion('Categoría actualizada, pero no se pudo encontrar la fila. Recargando datos...', 'warning', 'notificacionEditar');
                await cargarCategorias();
                return;
            }

            try {
                const rowIndex = table.row(row).data()[0];
                console.log('Actualizando fila en DataTables:', {
                    rowIndex,
                    Name: nombre,
                    Id: id
                });
                table.row(row).data([
                    rowIndex,
                    `<span class="nombre">${nombre}</span>`,
                    `
                    <button class="btn btn-outline-primary btn-sm btn-editar" data-id="${id}">
                        <i class="bi bi-pencil"></i> Editar
                    </button>
                    <button class="btn btn-outline-danger btn-sm btn-eliminar ml-1" data-id="${id}">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                    `
                ]).draw(false);
                console.log('Fila actualizada exitosamente');
                // Delay modal hide to ensure notification is visible
                setTimeout(() => {
                    modalEditar.hide();
                }, 3500);
            } catch (error) {
                console.error('Error al actualizar fila en DataTables:', error);
                mostrarNotificacion('Categoría actualizada, pero no se pudo actualizar la tabla. Recargando datos...', 'warning', 'notificacionEditar');
                setTimeout(() => {
                    modalEditar.hide();
                }, 3500);
                await cargarCategorias();
            }
        } else {
            throw new Error(data.message || `Error al actualizar categoría: ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error en actualizarCategoria:', error);
        mostrarNotificacion(error.message, 'danger', 'notificacionEditar');
    }
}

// Función para eliminar una categoría
async function eliminarCategoria() {
    const id = document.getElementById('idEliminar').value;
    if (!id) {
        mostrarNotificacion('ID de categoría no válido', 'warning', 'notificacionEliminar');
        return;
    }

    try {
        console.log('Eliminando categoría con ID:', id);
        const response = await fetch(`${CATEGORIAS_URL}/delete/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getCookie("token")}`
            }
        });

        const data = await response.json();
        console.log('Respuesta de eliminar categoría:', data);

        if (response.ok) {
            mostrarNotificacion('Categoría eliminada exitosamente', 'success', 'notificacionEliminar');
            modalEliminar.hide();

            const table = $('#dataTable').DataTable();
            const row = table.rows((idx, data, node) => {
                return $(node).find('.btn-eliminar').data('id') == id;
            }).nodes()[0];

            try {
                table.row(row).remove().draw();
                console.log('Fila eliminada exitosamente');
            } catch (error) {
                console.error('Error al eliminar fila en DataTables:', error);
                mostrarNotificacion('Categoría eliminada, pero no se pudo actualizar la tabla. Recargando datos...', 'warning', 'notificacionEliminar');
                await cargarCategorias();
            }
        } else {
            throw new Error(data.message || `Error al eliminar categoría: ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error en eliminarCategoria:', error);
        mostrarNotificacion(error.message, 'danger', 'notificacionEliminar');
    }
}

// Manejadores de eventos
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando página...');
    cargarCategorias();

    btnGuardarNuevo.addEventListener('click', crearCategoria);
    btnGuardarEdicion.addEventListener('click', actualizarCategoria);
    btnConfirmarEliminar.addEventListener('click', eliminarCategoria);

    document.addEventListener('click', function(e) {
        const btnEditar = e.target.closest('.btn-editar');
        const btnEliminar = e.target.closest('.btn-eliminar');

        if (btnEditar) {
            cargarDatosEdicion(btnEditar);
        }

        if (btnEliminar) {
            const id = btnEliminar.getAttribute('data-id');
            document.getElementById('idEliminar').value = id;
            modalEliminar.show();
        }
    });

    $('#crearModal').on('hidden.bs.modal', () => {
        console.log('Modal de creación cerrado');
        document.getElementById('formCrear').reset();
        limpiarNotificacion('notificacionCrear');
    });

    $('#editarModal').on('hidden.bs.modal', () => {
        console.log('Modal de edición cerrado');
        limpiarNotificacion('notificacionEditar');
    });

    $('#eliminarModal').on('hidden.bs.modal', () => {
        console.log('Modal de eliminación cerrado');
        limpiarNotificacion('notificacionEliminar');
    });
});