import express from 'express';
import { Patient } from '../models/patient.js';

export const patientRouter = express.Router();

/**
 * Ruta POST para crear un nuevo paciente.
 * Recibe los datos del paciente en el cuerpo de la solicitud, crea una nueva instancia del modelo Patient y la guarda en la base de datos.
 */
patientRouter.post('/patients', async (req, res) => {
  const patient = new Patient(req.body);

  try {
    await patient.save();
    res.status(201).send(patient);
  } catch (error) {
    res.status(400).send(error);
  }
});

patientRouter.get('/patients', async (req, res) => {
  try {
    const patients = await Patient.find();
    res.status(200).send(patients);
  } catch (error) {
    res.status(500).send(error);
  }
});