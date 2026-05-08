import express from 'express';
import { Medications } from '../models/medications.js';
import { error } from 'node:console';

export const medicationsRouter = express.Router();

/**
 * Ruta POST para crear un nuevo medicamento. Recibe los datos del medicamento en el cuerpo de la solicitud, crea un nuevo medicamento en la base de datos y devuelve el medicamento creado.
 * Maneja errores de validación y devuelve el código de estado adecuado.
 */

/**
 * @swagger
 * /medications:
 *   post:
 *     summary: Creates a new medication
 *     tags:
 *       - Medications
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedicationCreate'
 *     responses:
 *       201:
 *         description: Medication successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medication'
 *       400:
 *         description: Bad request (e.g., validation errors)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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

/**
 * @swagger
 * /medications:
 *   get:
 *     summary: Retrieves a list of medications
 *     description: Returns an array of medications. It can be filtered by commercialName, activeIngredient, or nationalCode using query parameters.
 *     tags:
 *       - Medications
 *     parameters:
 *       - in: query
 *         name: commercialName
 *         schema:
 *           type: string
 *         description: Filter medications by their commercial name
 *       - in: query
 *         name: activeIngredient
 *         schema:
 *           type: string
 *         description: Filter medications by their active ingredient
 *       - in: query
 *         name: nationalCode
 *         schema:
 *           type: string
 *         description: Filter medications by their national code
 *     responses:
 *       200:
 *         description: A list of medications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Medication'
 *       404:
 *         description: No medications found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server internal error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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

/**
 * @swagger
 * /medications/{id}:
 *   get:
 *     summary: Retrieves a specific medication by its ID
 *     tags:
 *       - Medications
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the medication
 *     responses:
 *       200:
 *         description: Medication successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medication'
 *       404:
 *         description: Medication not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server internal error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 * @swagger
 * /medications:
 *   patch:
 *     summary: Updates a medication using query parameters
 *     description: Updates a single medication by matching its nationalCode, commercialName, or activeIngredient. At least one query parameter is required.
 *     tags:
 *       - Medications
 *     parameters:
 *       - in: query
 *         name: nationalCode
 *         schema:
 *           type: string
 *         description: The national code of the medication to update
 *       - in: query
 *         name: commercialName
 *         schema:
 *           type: string
 *         description: The commercial name of the medication to update
 *       - in: query
 *         name: activeIngredient
 *         schema:
 *           type: string
 *         description: The active ingredient of the medication to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedicationUpdate'
 *     responses:
 *       200:
 *         description: Medication successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medication'
 *       400:
 *         description: Bad request, missing query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Medication not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server internal error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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

/**
 * @swagger
 * /medications/{id}:
 *   patch:
 *     summary: Updates a specific medication by its ID
 *     tags:
 *       - Medications
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the medication to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedicationUpdate'
 *     responses:
 *       200:
 *         description: Medication successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medication'
 *       404:
 *         description: Medication not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server internal error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

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

/**
 * @swagger
 * /medications:
 *   delete:
 *     summary: Deletes a medication using query parameters
 *     description: Deletes a single medication by matching its nationalCode, commercialName, or activeIngredient. At least one query parameter is required.
 *     tags:
 *       - Medications
 *     parameters:
 *       - in: query
 *         name: nationalCode
 *         schema:
 *           type: string
 *         description: The national code of the medication to delete
 *       - in: query
 *         name: commercialName
 *         schema:
 *           type: string
 *         description: The commercial name of the medication to delete
 *       - in: query
 *         name: activeIngredient
 *         schema:
 *           type: string
 *         description: The active ingredient of the medication to delete
 *     responses:
 *       200:
 *         description: Medication successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medication'
 *       400:
 *         description: Bad request, missing query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Medication not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server internal error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

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

/**
 * @swagger
 * /medications/{id}:
 *   delete:
 *     summary: Deletes a specific medication by its ID
 *     tags:
 *       - Medications
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the medication to delete
 *     responses:
 *       200:
 *         description: Medication successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medication'
 *       404:
 *         description: Medication not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server internal error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

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