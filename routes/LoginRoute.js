import { Router } from "express";
import { Register } from '../controllers/ControllerRegister.js'
import { Login, LogOut } from '../controllers/ControllerLogin.js'
import { Ingresar, IngresarFormRegistroUsuario } from '../controllers/ControllerLogin.js'
import { EnviarCorreo, FromCambiarPassword, RestablecerPassword, ActualizarPassword } from "../controllers/ControllerAuthSalesman.js";
import { loginRequestLimiter } from "../MiddleWares/ReqLimiter.js";


const router = Router()
router.get("/Login", Ingresar)
router.post("/Login", loginRequestLimiter, Login)

router.post("/LogOut", LogOut)

router.get("/Restablecer", FromCambiarPassword)
router.post("/Restablecer/:email", EnviarCorreo)

router.get("/Restablecer/:token", RestablecerPassword)
router.put("/Restablecer", ActualizarPassword)



export default router