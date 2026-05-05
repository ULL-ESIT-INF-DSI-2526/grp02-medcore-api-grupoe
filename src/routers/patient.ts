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
  const filter: any = {};

  if (req.query.fullName) {
    filter.fullName = req.query.fullName;
  }
  if (req.query.idNumber) {
    filter.idNumber = req.query.idNumber;
  }
  if (req.query.socialSecurityNumber) {
    filter.socialSecurityNumber = req.query.socialSecurityNumber;
  }

  try {
    const patients = await Patient.find(filter);
    res.status(200).send(patients);
  } catch (error) {
    res.status(500).send(error);
  }
});

patientRouter.get('/patients/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).send({ message: 'Paciente no encontrado' });
    }
    res.status(200).send(patient);
  } catch (error) {
    res.status(500).send(error);
  }
});