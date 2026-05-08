import express from "express";
import "./db/mongoose.js";
import { patientRouter } from "./routers/patient.js";
import { staffRouter } from "./routers/staff.js";
import { medicationsRouter } from "./routers/medications.js";
import { defaultRouter } from "./routers/default.js";
import { recordsRouter } from "./routers/records.js";

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";

/**
 * Para pasarle nuestra aplicación Express a supertest, exportamos la instancia de Express. 
 * Esto nos permite importar esta aplicación en nuestros archivos de prueba y realizar solicitudes HTTP en las pruebas.
 */
export const app = express();
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(patientRouter);
app.use(staffRouter);
app.use(medicationsRouter);
app.use(recordsRouter);
app.use(defaultRouter);
