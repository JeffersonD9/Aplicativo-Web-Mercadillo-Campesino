import express from "express";
import Login from "./routes/LoginRoute.js";
import morgan from "morgan";
import Salesman from "./routes/DashBoardSalesman.js";
import Admin from "./routes/DashBoardAdmin.js";
import path from "path";
import { fileURLToPath } from 'url';
import { PORT, NODE_ENV } from "./config.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import Products from "./routes/IndexLadingPage.js";
import { upload } from "./configMulter/multer.js";
import { RenderIndex } from "./controllers/ControllerMain.js";
import { verifyUser } from "./MiddleWares/VerifyUserLogged.js";
const app = express();

// Path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(verifyUser);

// Configuración de vistas
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Carpeta pública para archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/MercadilloBucaramanga", (req, res) => {
  res.redirect(302, "/MercadilloBucaramanga/Inicio");
});
app.get("/MercadilloBucaramanga/Inicio", RenderIndex);
app.use("/MercadilloBucaramanga", Products);
app.use("/MercadilloBucaramanga", Login, Admin, Salesman);

// Puerto
app.set("port", PORT);

export default app;