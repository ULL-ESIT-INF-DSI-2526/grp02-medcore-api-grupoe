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
    const filter = req.query.commercialName
    ? { commercialName: req.query.commercialName.toString() }
    : req.query.activeIngredient
    ? { activeIngredient: req.query.activeIngredient.toString() }
    : req.query.nationalCode
    ? { nationalCode: req.query.nationalCode.toString() }
    : {};

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

/**
 * 
 */

medicationsRouter.patch("/medications", async (req, res) => {
  if (!req.query.nationalCode && !req.query.commercialName && !req.query.activeIngredient) {
    return res.status(400).send({ message: 'Se requiere nationalCode o commercialName o activeIngredient para actualizar' });
  }
  
  const filter = req.query.nationalCode
    ? { nationalCode: req.query.nationalCode.toString() }
    : req.query.commercialName
    ? { commercialName: req.query.commercialName.toString() }
    : req.query.activeIngredient
    ? { activeIngredient: req.query.activeIngredient.toString() }
    : {};

  const updateData = req.body;

  try {
    const medication = await Medications.findOneAndUpdate(filter, updateData, { new: true, runValidators: true });
    if (!medication) {
      return res.status(404).send({ message: 'Medicamento no encontrado' });
    }
    res.status(200).send(medication);
  } catch (error) {
    res.status(500).send({ error : 'Error al actualizar el medicamento' });
  }
});

medicationsRouter.patch("/medications/:id", async (req, res) => {
  const updateData = req.body;

  try {
    const medication = await Medications.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!medication) {
      return res.status(404).send({ message: 'Medicamento no encontrado' });
    }
    res.status(200).send(medication);
  } catch (error) {
    res.status(500).send({ error : 'Error al actualizar el medicamento' });
  }
});

medicationsRouter.delete("/medications", async (req, res) => {
  if (!req.query.nationalCode && !req.query.commercialName && !req.query.activeIngredient) {
    return res.status(400).send({ message: 'Se requiere nationalCode o commercialName o activeIngredient para eliminar' });
  }
  
  const filter = req.query.nationalCode
    ? { nationalCode: req.query.nationalCode.toString() }
    : req.query.commercialName
    ? { commercialName: req.query.commercialName.toString() }
    : req.query.activeIngredient
    ? { activeIngredient: req.query.activeIngredient.toString() }
    : {};

  try {
    const medication = await Medications.findOne(filter);
    if (!medication) {
      return res.status(404).send({ message: 'Medicamento no encontrado' });
    } else {
      await Medications.findByIdAndDelete(medication._id);
      res.status(200).send(medication);
    }
  } catch (error) {
    res.status(500).send({ error : 'Error al eliminar el medicamento' });
  }
});

medicationsRouter.delete("/medications/:id", async (req, res) => {
    try {
        const medication = await Medications.findById(req.params.id);
        if (!medication) {
          return res.status(404).send({ message: 'Medicamento no encontrado' });
        } else {
          // Falta logica de borrado
          await Medications.findByIdAndDelete(medication._id);
          res.status(200).send(medication);
        }
    } catch (error) {
        res.status(500).send({ error : 'Error al eliminar el medicamento' });
    }
});