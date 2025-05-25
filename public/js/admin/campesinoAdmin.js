import { getCookie } from "../expresiones.js";
console.log("Campesinos");

// Configuración base
const API_BASE_URL = '/MercadilloBucaramanga';
const ADMIN_USUARIOS_URL = `${API_BASE_URL}/Admin/Usuarios`;
const MERCADILLOS_URL = `${API_BASE_URL}/api/mercadillos`;

// Elementos del DOM
const btnConfirmarEliminar = document.getElementById("btnConfirmarEliminar");
const btnGuardarCampesino = document.getElementById("btnGuardarCampesino");

// Modales
const modalEliminar = new bootstrap.Modal(document.getElementById("eliminarModal"));
const modalActualizar = new bootstrap.Modal(document.getElementById('actualizarModal'));
const modalCrear = new bootstrap.Modal(document.getElementById('crearCampesinoModal'));

// Variables de estado
let idUsuarioAEliminar = null;
let mercadillosCache = [];

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = "success", contenedorId) {
    const notificacion = document.getElementById(contenedorId);
    if (!notificacion) {
        console.error(`Contenedor de notificación ${contenedorId} no encontrado`);
        console.log(mensaje);
        return;
    }
    notificacion.textContent = mensaje;
    notificacion.className = `alert alert-${tipo}`;
    notificacion.classList.remove("d-none");
    setTimeout(() => {
        notificacion.classList.add("d-none");
        notificacion.textContent = "";
    }, 3000);
}

// Función para limpiar notificaciones
function limpiarNotificacion(contenedorId) {
    const notificacion = document.getElementById(contenedorId);
    if (notificacion) {
        notificacion.className = "alert d-none";
        notificacion.textContent = "";
    }
}

// Función para cargar los mercadillos (para selects)
async function cargarMercadillos(selectId) {
    try {
        if (mercadillosCache.length === 0) {
            const response = await fetch(MERCADILLOS_URL, {
                headers: {
                    'Authorization': `Bearer ${getCookie("token")}`
                }
            });
            
            if (!response.ok) throw new Error('Error al cargar mercadillos');
            mercadillosCache = await response.json();
        }
        
        const select = document.getElementById(selectId);
        if (!select) {
            console.error(`Select con ID ${selectId} no encontrado`);
            return;
        }
        select.innerHTML = '<option value="">Seleccione un mercadillo</option>';
        mercadillosCache.forEach(mercadillo => {
            const option = document.createElement('option');
            option.value = mercadillo.Id;
            option.textContent = mercadillo.Nombre;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar mercadillos:', error);
        console.log('Error al cargar la lista de mercadillos');
    }
}

// Función para obtener el próximo puesto disponible
function obtenerProximoPuesto(idMercadillo) {
    console.log(`Calculando próximo puesto para mercadillo ID: ${idMercadillo}`);
    const table = $('#dataTable').DataTable();
    const puestosExistentes = table
        .rows()
        .nodes()
        .toArray()
        .filter(node => Number(node.getAttribute('data-id-mercadillo')) === idMercadillo)
        .map(node => Number(node.querySelector('.puesto')?.textContent))
        .sort((a, b) => a - b);
    
    console.log('Puestos existentes:', puestosExistentes);
    
    if (puestosExistentes.length === 0) {
        return 1; // Si no hay puestos, asignar 1
    }
    
    // Buscar el primer hueco en la secuencia
    for (let i = 0; i < puestosExistentes.length; i++) {
        if (puestosExistentes[i] !== i + 1) {
            return i + 1; // Retornar el primer número faltante
        }
    }
    
    // Si no hay huecos, asignar el siguiente número después del máximo
    return puestosExistentes[puestosExistentes.length - 1] + 1;
}

// Función para cargar los campesinos desde la API
async function cargarCampesinos() {
    try {
        console.log('Cargando campesinos...');
        const response = await fetch(`/MercadilloBucaramanga/api/usuarios`, {
            headers: {
                'Authorization': `Bearer ${getCookie("token")}`
                }
        });
       
        if (!response.ok) {
            throw new Error(`Error al cargar campesinos: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Datos recibidos:', data);
        if (!data || !Array.isArray(data)) {
            throw new Error('Formato de datos inválido: data no es un arreglo');
        }

        // Cargar mercadillos para selects
        await cargarMercadillos('mercadilloActualizar');
        mostrarCampesinosEnTabla(data);
    } catch (error) {
        console.error('Error en cargarCampesinos:', error);
        console.log(error.message);
    }
}

// Función para mostrar los campesinos en la tabla
function mostrarCampesinosEnTabla(campesinos) {
    console.log('Mostrando campesinos en tabla:', campesinos);
    const table = $('#dataTable');
    const tbody = table.find('tbody');
    tbody.empty(); // Limpiar el contenido del tbody
    console.log("campesinos " , campesinos)
    campesinos.forEach((campesino) => {
        const mercadilloNombre = campesino.mercadillo?.Nombre || 'Sin mercadillo';
        const estado = campesino.Estado ? 'activo' : 'inactivo';
        const btnEstadoClase = campesino.Estado ? 'btn-warning' : 'btn-success';
        const btnEstadoTexto = campesino.Estado ? 'Desactivar' : 'Activar';
        const tr = document.createElement('tr');
        tr.setAttribute('data-id-mercadillo', campesino.Id_Mercadillo || '');
        tr.classList.toggle('table-secondary', !campesino.Estado);
        tr.innerHTML = `
            <td>${campesino.Id}</td>
            <td><span class="nombre">${campesino.Nombres}</span></td>
            <td><span class="apellidos">${campesino.Apellidos}</span></td>
            <td><span class="email">${campesino.Email}</span></td>
            <td><span class="celular">${campesino.Celular}</span></td>
            <td><span class="cedula">${campesino.Cedula}</span></td>
            <td><span class="mercadillo">${mercadilloNombre}</span></td>
            <td><span class="puesto">${campesino.Puesto}</span></td>
            <td>
                <button class="btn btn-outline-primary btn-sm btn-actualizar-usuario" data-id="${campesino.Id}">
                    <i class="bi bi-pencil"></i> Editar
                </button>
                <button class="btn btn-outline-danger btn-sm btn-eliminar-usuario" data-id="${campesino.Id}">
                    <i class="bi bi-trash"></i> Eliminar
                </button>
                <button class="btn btn-sm btn-toggle-estado ${btnEstadoClase}" data-id="${campesino.Id}" data-estado="${estado}">
                    ${btnEstadoTexto}
                </button>
            </td>
        `;
        tbody.append(tr);
    });

    // Destruir DataTables si ya está inicializado
    if ($.fn.DataTable.isDataTable(table)) {
        console.log('Destruyendo DataTables existente...');
        table.DataTable().clear().destroy();
    }

    // Inicializar DataTables con configuración estática en español
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

// Función para crear un nuevo campesino
async function crearCampesino(event) {
    event.preventDefault(); // Prevenir comportamiento por defecto del formulario
    console.log('Iniciando creación de campesino...');

    const campesino = {
        Nombres: document.getElementById('nombresNuevo').value.trim(),
        Apellidos: document.getElementById('apellidosNuevo').value.trim(),
        Email: document.getElementById('emailNuevo').value.trim(),
        Celular: document.getElementById('celularNuevo').value.trim(),
        Cedula: document.getElementById('cedulaNuevo').value.trim(),
        Id_Mercadillo: Number(document.getElementById('mercadilloNuevo').value),
        Puesto: Number(document.getElementById('puestoNuevo').value),
        Password: document.getElementById('passwordNuevo').value.trim(),
        Roles: 2 // Rol para campesinos
    };

    if (!campesino.Nombres || !campesino.Apellidos || !campesino.Cedula || !campesino.Email || !campesino.Id_Mercadillo || !campesino.Password) {
        mostrarNotificacion('Todos los campos son requeridos', 'warning', 'notificacionCrear');
        return;
    }

    if (!campesino.Puesto || campesino.Puesto <= 0) {
        mostrarNotificacion('El puesto debe ser un número mayor que 0', 'warning', 'notificacionCrear');
        return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(campesino.Email)) {
        mostrarNotificacion('El email no es válido', 'warning', 'notificacionCrear');
        return;
    }

    // Verificar si el email ya existe
    const table = $('#dataTable').DataTable();
    const emailsExistentes = table
        .rows()
        .nodes()
        .toArray()
        .map(node => node.querySelector('.email')?.textContent.toLowerCase());
    
    if (emailsExistentes.includes(campesino.Email.toLowerCase())) {
        mostrarNotificacion('Ya existe un campesino con este email', 'warning', 'notificacionCrear');
        return;
    }

    // Verificar si la cédula ya existe
    const cedulasExistentes = table
        .rows()
        .nodes()
        .toArray()
        .map(node => node.querySelector('.cedula')?.textContent.trim());
    
    if (cedulasExistentes.includes(campesino.Cedula.trim())) {
        mostrarNotificacion('Ya existe un campesino con esta cédula', 'warning', 'notificacionCrear');
        return;
    }

    // Verificar si el puesto ya existe para el mercadillo seleccionado
    const puestosExistentes = table
        .rows()
        .nodes()
        .toArray()
        .filter(node => Number(node.getAttribute('data-id-mercadillo')) === campesino.Id_Mercadillo)
        .map(node => Number(node.querySelector('.puesto')?.textContent));
    
    if (puestosExistentes.includes(campesino.Puesto)) {
        mostrarNotificacion('Ya existe un campesino con este puesto en el mercadillo seleccionado', 'warning', 'notificacionCrear');
        return;
    }

    try {
        console.log('Creando campesino:', campesino);
        const response = await fetch(`${ADMIN_USUARIOS_URL}/Registrar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getCookie("token")}`
            },
            body: JSON.stringify(campesino)
        });

        const dataMercadillo = await response.json();
        console.log('Respuesta completa de la API:', JSON.stringify(dataMercadillo, null, 2));

        if (!response.ok) {
            throw new Error(dataMercadillo.message || 'Error al crear campesino');
        }

        const nuevoCampesino = dataMercadillo.newUser;
        if (!nuevoCampesino || !nuevoCampesino.Id) {
            throw new Error('Respuesta de la API inválida: falta newUser o Id');
        }

        console.log('Nuevo campesino:', nuevoCampesino);
        mostrarNotificacion(dataMercadillo.message || 'Campesino creado exitosamente', 'success', 'notificacionCrear');

        // Agregar la nueva fila a la tabla
        const mercadilloNombre = nuevoCampesino.mercadillo?.Nombre || 
            mercadillosCache.find(m => m.Id == nuevoCampesino.Id_Mercadillo)?.Nombre || 
            'Sin mercadillo';
        
        try {
            console.log('Agregando fila a DataTables:', nuevoCampesino);
            const newRow = table.row.add([
                nuevoCampesino.Id,
                `<span class="nombre">${nuevoCampesino.Nombres || ''}</span>`,
                `<span class="apellidos">${nuevoCampesino.Apellidos || ''}</span>`,
                `<span class="email">${nuevoCampesino.Email || ''}</span>`,
                `<span class="celular">${nuevoCampesino.Celular || ''}</span>`,
                `<span class="cedula">${nuevoCampesino.Cedula || ''}</span>`,
                `<span class="mercadillo">${mercadilloNombre}</span>`,
                `<span class="puesto">${nuevoCampesino.Puesto}</span>`,
                `
                <button class="btn btn-outline-primary btn-sm btn-actualizar-usuario" data-id="${nuevoCampesino.Id}">
                    <i class="bi bi-pencil"></i> Editar
                </button>
                <button class="btn btn-outline-danger btn-sm btn-eliminar-usuario" data-id="${nuevoCampesino.Id}">
                    <i class="bi bi-trash"></i> Eliminar
                </button>
                <button class="btn btn-sm btn-toggle-estado btn-warning" data-id="${nuevoCampesino.Id}" data-estado="activo">
                    Desactivar
                </button>
                `
            ]).draw(false).node();
            newRow.setAttribute('data-id-mercadillo', nuevoCampesino.Id_Mercadillo || '');
            console.log('Fila agregada exitosamente');
        } catch (error) {
            console.error('Error al agregar fila a DataTables:', error);
            mostrarNotificacion('Campesino creado, pero no se pudo actualizar la tabla. Recargando datos...', 'warning', 'notificacionCrear');
            await cargarCampesinos();
        }
    } catch (error) {
        console.error('Error al crear campesino:', error);
        mostrarNotificacion(error.message, 'danger', 'notificacionCrear');
    } finally {
        console.log('Cerrando modal de creación...');
        modalCrear.hide();
        document.getElementById('formCrearCampesino').reset();
        // Forzar eliminación del backdrop
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
        document.body.classList.remove('modal-open');
        document.body.style = '';
    }
}

// Función para actualizar un campo individual
async function actualizarCampoIndividual(id, campo, valor, btn) {
    try {
        if (campo === 'Password' && !valor) {
            mostrarNotificacion('No se proporcionó nueva contraseña', 'info', 'notificacionActualizar');
            return;
        }

        if (campo === 'Puesto') {
            const puestoNum = Number(valor);
            if (!puestoNum || puestoNum <= 0) {
                mostrarNotificacion('El puesto debe ser un número mayor que 0', 'warning', 'notificacionActualizar');
                return;
            }
            valor = puestoNum;
        }

        if (campo === 'Email' || campo === 'Cedula') {
            const table = $('#dataTable').DataTable();
            const row = table.rows((idx, data, node) => {
                return $(node).find('.btn-actualizar-usuario').data('id') == id;
            }).nodes()[0];

            if (campo === 'Email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(valor)) {
                    mostrarNotificacion('El email no es válido', 'warning', 'notificacionActualizar');
                    return;
                }

                const emailsExistentes = table
                    .rows()
                    .nodes()
                    .toArray()
                    .map(node => node.querySelector('.email')?.textContent.toLowerCase());
                const currentEmail = row.querySelector('.email')?.textContent.toLowerCase();

                if (emailsExistentes.includes(valor.toLowerCase()) && valor.toLowerCase() !== currentEmail) {
                    mostrarNotificacion('Ya existe un campesino con este email', 'warning', 'notificacionActualizar');
                    return;
                }
            } else if (campo === 'Cedula') {
                const cedulasExistentes = table
                    .rows()
                    .nodes()
                    .toArray()
                    .map(node => node.querySelector('.cedula')?.textContent.trim());
                const currentCedula = row.querySelector('.cedula')?.textContent.trim();

                if (cedulasExistentes.includes(valor.trim()) && valor.trim() !== currentCedula) {
                    mostrarNotificacion('Ya existe un campesino con esta cédula', 'warning', 'notificacionActualizar');
                    return;
                }
            }
        }

        const datos = { [campo]: valor };
        console.log('Actualizando campo:', { id, campo, valor });

        const response = await fetch(`${ADMIN_USUARIOS_URL}/edit/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getCookie("token")}`
            },
            body: JSON.stringify(datos)
        });

        const data = await response.json();
        console.log('Respuesta de actualizar campo:', data);

        if (response.ok) {
            mostrarNotificacion(`Campo ${campo} actualizado exitosamente`, 'success', 'notificacionActualizar');

            // Actualizar la fila en la tabla
            const table = $('#dataTable').DataTable();
            const row = table.rows((idx, data, node) => {
                return $(node).find('.btn-actualizar-usuario').data('id') == id;
            }).nodes()[0];

            try {
                const rowData = table.row(row).data();
                const updatedRowData = [...rowData];
                switch (campo) {
                    case 'Nombres':
                        updatedRowData[1] = `<span class="nombre">${valor}</span>`;
                        break;
                    case 'Apellidos':
                        updatedRowData[2] = `<span class="apellidos">${valor}</span>`;
                        break;
                    case 'Email':
                        updatedRowData[3] = `<span class="email">${valor}</span>`;
                        break;
                    case 'Celular':
                        updatedRowData[4] = `<span class="celular">${valor}</span>`;
                        break;
                    case 'Cedula':
                        updatedRowData[5] = `<span class="cedula">${valor}</span>`;
                        break;
                    case 'Id_Mercadillo':
                        const mercadillo = mercadillosCache.find(m => m.Id == valor) || { Nombre: 'Sin mercadillo' };
                        updatedRowData[6] = `<span class="mercadillo">${mercadillo.Nombre}</span>`;
                        row.setAttribute('data-id-mercadillo', valor);
                        break;
                    case 'Puesto':
                        updatedRowData[7] = `<span class="puesto">${valor}</span>`;
                        break;
                }
                table.row(row).data(updatedRowData).draw(false);
                console.log('Fila actualizada exitosamente');
            } catch (error) {
                console.error('Error al actualizar fila en DataTables:', error);
                mostrarNotificacion('Campo actualizado, pero no se pudo actualizar la tabla. Recargando datos...', 'warning', 'notificacionActualizar');
                await cargarCampesinos();
            }
        } else {
            mostrarNotificacion(`Error al actualizar campo ${campo} verifica que el puesto no se repita`, 'danger', 'notificacionActualizar');
        }
    } catch (error) {
        console.error(`Error al actualizar campo ${campo}:`, error);
        mostrarNotificacion(error.message, 'danger', 'notificacionActualizar');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-check"></i> Actualizar';
        }
    }
}

// Función para eliminar un usuario
async function eliminarUsuario() {
    if (!idUsuarioAEliminar) {
        console.error("No hay ID de usuario para eliminar");
        mostrarNotificacion('ID de usuario no válido', 'warning', 'notificacionEliminar');
        return;
    }

    try {
        console.log(`Eliminando usuario con ID: ${idUsuarioAEliminar}`);
        console.log('Token:', getCookie("token"));
        const response = await fetch(`${ADMIN_USUARIOS_URL}/delete/${idUsuarioAEliminar}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getCookie("token")}`
            }
        });

        console.log('Estado de respuesta:', response.status, response.statusText);
        const data = await response.json();
        console.log('Respuesta de eliminar usuario:', data);

        if (response.ok) {
            mostrarNotificacion(data.message || 'Campesino eliminado exitosamente', 'success', 'notificacionEliminar');
            modalEliminar.hide();

            // Eliminar la fila de la tabla
            const table = $('#dataTable').DataTable();
            const row = table.rows((idx, data, node) => {
                const id = $(node).find('.btn-eliminar-usuario').data('id');
                console.log('Comparando ID:', id, idUsuarioAEliminar, typeof id, typeof idUsuarioAEliminar);
                return id == idUsuarioAEliminar;
            }).nodes()[0];

            if (!row) {
                console.error('No se encontró la fila para ID:', idUsuarioAEliminar);
                mostrarNotificacion('Campesino eliminado, pero no se encontró la fila en la tabla. Recargando datos...', 'warning', 'notificacionEliminar');
                await cargarCampesinos();
                return;
            }

            try {
                table.row(row).remove().draw();
                console.log('Fila eliminada exitosamente');
            } catch (error) {
                console.error('Error al eliminar fila en DataTables:', error);
                mostrarNotificacion('Campesino eliminado, pero no se pudo actualizar la tabla. Recargando datos...', 'warning', 'notificacionEliminar');
                await cargarCampesinos();
            }
        } else {
            throw new Error(data.message || `Error al eliminar campesino: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error al eliminar campesino:', error);
        mostrarNotificacion(error.message, 'danger', 'notificacionEliminar');
    } finally {
        idUsuarioAEliminar = null;
        modalEliminar.hide();
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
        document.body.classList.remove('modal-open');
        document.body.style = '';
    }
}

// Función para cambiar el estado de un usuario
async function toggleEstadoUsuario(id, nuevoEstado) {
    try {
        console.log('Cambiando estado del usuario:', { id, nuevoEstado });
        const response = await fetch(`${ADMIN_USUARIOS_URL}/edit/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getCookie("token")}`
            },
            body: JSON.stringify({ Estado: nuevoEstado })
        });

        const data = await response.json();
        console.log('Respuesta de cambiar estado:', data);

        if (response.ok) {
            mostrarNotificacion(`Campesino ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`, 'success', 'notificacionActualizar');
            return true;
        } else {
            throw new Error(data.message || 'Error al cambiar estado');
        }
    } catch (error) {
        console.error('Error al cambiar estado:', error);
        mostrarNotificacion(error.message, 'danger', 'notificacionActualizar');
        return false;
    }
}

// Función para actualizar la fila después de cambiar el estado
function actualizarFilaEstado(fila, nuevoEstado) {
    fila.classList.toggle('table-secondary', !nuevoEstado);
    const btn = fila.querySelector('.btn-toggle-estado');
    
    if (nuevoEstado) {
        btn.classList.replace('btn-success', 'btn-warning');
        btn.textContent = 'Desactivar';
        btn.setAttribute('data-estado', 'activo');
    } else {
        btn.classList.replace('btn-warning', 'btn-success');
        btn.textContent = 'Activar';
        btn.setAttribute('data-estado', 'inactivo');
    }
}

// Función para abrir el modal de actualización
async function abrirModalActualizar(campesino) {
    try {
        await cargarMercadillos('mercadilloActualizar');
        document.getElementById('idActualizar').value = campesino.id;
        document.getElementById('nombresActualizar').value = campesino.nombres;
        document.getElementById('apellidosActualizar').value = campesino.apellidos;
        document.getElementById('emailActualizar').value = campesino.email;
        document.getElementById('celularActualizar').value = campesino.celular;
        document.getElementById('cedulaActualizar').value = campesino.cedula;
        document.getElementById('puestoActualizar').value = Number(campesino.puesto);
        document.getElementById('passwordActualizar').value = '';
        if (campesino.idMercadillo) {
            document.getElementById('mercadilloActualizar').value = campesino.idMercadillo;
        }
        modalActualizar.show();
    } catch (error) {
        console.error('Error al abrir modal de actualización:', error);
        mostrarNotificacion('Error al preparar formulario de edición', 'danger', 'notificacionActualizar');
    }
}

// Manejadores de eventos
document.addEventListener('DOMContentLoaded', function() {
    // Cargar campesinos al iniciar
    console.log('Inicializando página...');
    cargarCampesinos();

    // Botón crear nuevo campesino
    document.getElementById('btnNuevoCampesino')?.addEventListener('click', () => {
        cargarMercadillos('mercadilloNuevo');
        modalCrear.show();
    });

    // Evento para actualizar el puesto sugerido al cambiar el mercadillo
    document.getElementById('mercadilloNuevo')?.addEventListener('change', (e) => {
        const idMercadillo = Number(e.target.value);
        if (!idMercadillo) {
            document.getElementById('puestoNuevo').value = '';
            return;
        }

        const proximoPuesto = obtenerProximoPuesto(idMercadillo);
        document.getElementById('puestoNuevo').value = proximoPuesto;
        console.log(`Puesto asignado: ${proximoPuesto}`);
    });

    // Botones de formularios
    btnGuardarCampesino?.addEventListener('click', crearCampesino);
    btnConfirmarEliminar?.addEventListener("click", eliminarUsuario);
    document.getElementById('btnClose')?.addEventListener('click', () => modalEliminar.hide());

    // Manejador de eventos para botones de actualización individual
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-actualizar-campo')) {
            e.preventDefault(); // Prevenir comportamiento predeterminado
            const btn = e.target;
            const campo = btn.getAttribute('data-campo');
            const id = document.getElementById('idActualizar').value;
            
            let valor;
            if (campo === 'Id_Mercadillo') {
                valor = document.getElementById('mercadilloActualizar').value;
            } else {
                valor = document.getElementById(`${campo.toLowerCase()}Actualizar`).value;
            }

            if (!valor && campo !== 'Password') {
                mostrarNotificacion(`El campo ${campo} no puede estar vacío`, 'warning', 'notificacionActualizar');
                return;
            }

            btn.disabled = true;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Actualizando...';

            actualizarCampoIndividual(id, campo, valor, btn);
        }
    });

    // Manejadores de eventos para botones
    document.addEventListener('click', (e) => {
        // Eliminar
        if (e.target.classList.contains('btn-eliminar-usuario')) {
            const fila = e.target.closest('tr');
            idUsuarioAEliminar = Number(fila.querySelector('td:first-child').textContent);
            
            const nombre = fila.querySelector('.nombre')?.textContent || 'este campesino';
            document.querySelector('#eliminarModal .modal-title').textContent = 
                `¿Eliminar al campesino ${nombre}?`;
            
            modalEliminar.show();
        }
        // Editar
        else if (e.target.classList.contains('btn-actualizar-usuario')) {
            const fila = e.target.closest('tr');
            const campesino = {
                id: fila.querySelector('td:first-child').textContent,
                nombres: fila.querySelector('.nombre')?.textContent || '',
                apellidos: fila.querySelector('.apellidos')?.textContent || '',
                email: fila.querySelector('.email')?.textContent || '',
                celular: fila.querySelector('.celular')?.textContent || '',
                cedula: fila.querySelector('.cedula')?.textContent || '',
                idMercadillo: fila.getAttribute('data-id-mercadillo'),
                puesto: fila.querySelector('.puesto')?.textContent
            };
            abrirModalActualizar(campesino);
        }
        // Cambiar estado
        else if (e.target.classList.contains('btn-toggle-estado')) {
            const btn = e.target;
            const fila = btn.closest('tr');
            const id = fila.querySelector('td:first-child').textContent;
            const nuevoEstado = btn.getAttribute('data-estado') === 'activo' ? false : true;
            
            if (confirm(`¿Estás seguro de ${nuevoEstado ? 'activar' : 'desactivar'} este campesino?`)) {
                toggleEstadoUsuario(id, nuevoEstado).then(success => {
                    if (success) {
                        actualizarFilaEstado(fila, nuevoEstado);
                    }
                });
            }
        }
    });

    // Limpiar formulario y notificaciones al cerrar modales
    $('#crearCampesinoModal').on('hidden.bs.modal', () => {
        console.log('Modal de creación cerrado');
        document.getElementById('formCrearCampesino').reset();
        limpiarNotificacion('notificacionCrear');
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
        document.body.classList.remove('modal-open');
        document.body.style = '';
    });
 
    $('#actualizarModal').on('hidden.bs.modal', () => {
        console.log('Modal de actualización cerrado');
        limpiarNotificacion('notificacionActualizar');
    });

    $('#eliminarModal').on('hidden.bs.modal', () => {
        console.log('Modal de eliminación cerrado');
        limpiarNotificacion('notificacionEliminar');
    });
});