import express from "express";
import Login from "./routes/LoginRoute.js";
import Task from "./routes/TaskRoutes.js";
import morgan from "morgan";
import Salesman from "./routes/DashBoardSalesman.js";
import Admin from "./routes/DashBoardAdmin.js";
import Main from "./routes/DashBoardMain.js"
import path from "path";
import { PORT,NODE_ENV } from "./config.js";
import cors from "cors";
import cookieParser from "cookie-parser";

import multer from "multer";
const app = express();
app.use(cors());
app.use(morgan("dev"));

// if (NODE_ENV === "production") {
//     console.log = function () {}; 
//   }

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public"))); //Identificar la carpeta public
app.use( "/imagenes", express.static(path.join(__dirname, "imagenes"))); //Identificar la carpeta imagenes

const uploadPath = path.join(__dirname, 'public', 'Image_Products');
//console.log(uploadPath)
const upload = multer({dest: uploadPath})

app.set("port", PORT);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());


// Routes
app.get("/",(res,req)=>{
    return req.redirect("/MercadilloBucaramanga")
})
app.use("/MercadilloBucaramanga",Main,Login, Admin, Salesman);
//app.use('/MercarilloBucaramanga',Admin)

export default app;
