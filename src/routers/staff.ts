import express from 'express';
import { Staff } from '../models/staff.js';

export const staffRouter = express.Router();


/**
 * Ruta POST para crear un nuevo miembro del personal médico. Recibe los datos en el cuerpo de la solicitud, crea un nuevo personal en la base de datos y devuelve el personal creado.
 * Maneja errores de validación y devuelve el código de estado adecuado.
 */
staffRouter.post('/staff', async (req, res) => {
  const personal = new Staff(req.body);

  try {
    await personal.save();
    res.status(201).send(personal);
  } catch (error) {
    res.status(400).send(error);
  }
});