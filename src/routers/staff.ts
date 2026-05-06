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

/**
 * Ruta GET para obtener personal médico. Permite filtrar personal por nombre completo o especialidad a través de query parameters.
 * Si no se proporcionan filtros, devuelve todo el personal. Maneja errores de base de datos y devuelve el código de estado adecuado.
 */
staffRouter.get("/staff", async (req, res) => {
  const filter = req.query.fullName
    ? { fullName: req.query.fullName.toString() }
    : req.query.specialty
    ? { specialty: req.query.specialty.toString() }
    : {};

  try {
    const staff = await Staff.find(filter);
    if (staff.length !== 0) {
      res.send(staff);
    } else {
      res.status(404).send({
        error: "Staff not found",
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

