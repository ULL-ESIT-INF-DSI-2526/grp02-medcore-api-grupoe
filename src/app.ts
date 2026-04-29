import express from "express";
import "./db/mongoose.js";
import { patientRouter } from "./routers/patient.js";
import { defaultRouter } from "./routers/default.js";

/**
 * Para pasarle nuestra aplicación Express a supertest, exportamos la instancia de Express. 
 * Esto nos permite importar esta aplicación en nuestros archivos de prueba y realizar solicitudes HTTP en las pruebas.
 */
export const app = express();
app.use(express.json());
app.use(patientRouter);
app.use(defaultRouter);