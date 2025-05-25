import { Router } from "express";
import { RenderDashboardAdmin, MostrarUsuarios, EliminarUsuario, getPuestoSugerido, getUsuariosJson } from '../controllers/ControllerAuthAdmin.js'
import { authRequired } from '../MiddleWares/ValidateToken.js'
import { createMercadillo, deleteMercadillo, getAllMercadillos, getMercadilloById, getMercadillosJson, updateMercadillo } from "../controllers/ControllerMercadillos.js";
import { UpdateVendedor } from "../controllers/ControllerAuthSalesman.js";
import { Register } from "../controllers/ControllerRegister.js";
import { noCache } from "../MiddleWares/cache.js";
import { getCategorias } from "../controllers/controllerCategorias.js"
import { getProductosBase } from "../controllers/ControllerProductosBase.js";
const router = Router()

router.get('/Admin', authRequired, noCache, RenderDashboardAdmin);
//router.put('/Admin/:id_admin',authRequired, ActualizarAdmin);

router.get('/Admin/Usuarios', authRequired, noCache, MostrarUsuarios);
router.get('/api/usuarios', authRequired, getUsuariosJson);
router.delete('/Admin/Usuarios/delete:id_usuario', authRequired, noCache, EliminarUsuario)
router.patch('/Admin/Usuarios/edit/:id_vendedor', authRequired, noCache, UpdateVendedor)
router.post("/Admin/Usuarios/Registrar", Register)
router.get('/Admin/Usuarios/puesto-sugerido', getPuestoSugerido, noCache)

// Productos

router.get('/Admin/Productos/create', noCache);
router.get('/Admin/Productos/edit', noCache);
router.get('/Admin/Productos/', noCache, getProductosBase);

// Categorias

router.get('/Admin/Categorias/create', noCache);
router.get('/Admin/Categorias/edit', noCache);
router.get('/Admin/Categorias', noCache, getCategorias);

// Mercadillos

router.get('/Admin/Mercadillos', authRequired, noCache, getAllMercadillos)
router.get('/api/mercadillos', authRequired,noCache, getMercadillosJson);

router.get('/Admin/Mercadillos/:id_mercadillo', authRequired, noCache, getMercadilloById)
router.post('/Admin/Mercadillos/create', authRequired, noCache, createMercadillo)
router.patch('/Admin/Mercadillos/:id_mercadillo', authRequired, noCache, updateMercadillo)
router.delete('/Admin/Mercadillos/:id_mercadillo', authRequired, noCache, deleteMercadillo)


export default router