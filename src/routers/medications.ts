import express from 'express';
import { Medications } from '../models/medications.js';
import { error } from 'node:console';

export const medicationsRouter = express.Router();

/**
 * Ruta POST para crear un nuevo medicamento. Recibe los datos del medicamento en el cuerpo de la solicitud, crea un nuevo medicamento en la base de datos y devuelve el medicamento creado.
 * Maneja errores de validación y devuelve el código de estado adecuado.
 */
medicationsRouter.post('/medications', async (req, res) => {
  const medication = new Medications(req.body);
  try {
    await medication.save();
    res.status(201).send(medication);
  } catch (error) {
    res.status(400).send(error);
  }
});

/**
 * Ruta GET para obtener medicamentos. Permite filtrar medicamentos por nombre comercial, principio activo o código nacional a través de query parameters.
 * Si no se proporcionan filtros, devuelve todos los medicamentos. Maneja errores de base de datos y devuelve el código de estado adecuado.
 */
medicationsRouter.get("/medications", async (req, res) => {
    const filter: any = {};

    if (req.query.commercialName) filter.commercialName = req.query.commercialName;
    if (req.query.activeIngredient) filter.activeIngredient = req.query.activeIngredient;
    if (req.query.nationalCode) filter.nationalCode = req.query.nationalCode;

    try {
        const medications = await Medications.find(filter);
        
        if (medications.length === 0) {
            return res.status(404).send({ error: 'No se encontraron medicamentos' });
        } else {
            res.status(200).send(medications);
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

/**
 * Ruta GET para obtener un medicamento por su ID. Recibe el ID del medicamento como parámetro en la URL, busca el medicamento en la base de datos y lo devuelve.
 * Si el medicamento no existe, devuelve un error 404. Maneja errores de base de datos y devuelve el código de estado adecuado.
 */
medicationsRouter.get("/medications/:id", async (req, res) => {
    try {
      const medication = await Medications.findById(req.params.id);
        if (!medication) {
          return res.status(404).send({ message: 'Medicamento no encontrado' });
        }
        res.status(200).send(medication);
    } catch (error) {
        res.status(500).send({ error : 'Error al obtener el medicamento' });
    }
});