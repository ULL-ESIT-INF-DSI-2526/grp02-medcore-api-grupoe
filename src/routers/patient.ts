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

/**
 * Ruta GET para obtener pacientes. Permite filtrar por nombre completo, número de identificación o número de seguridad social a través de query parameters.
 * Si no se proporcionan filtros, devuelve todos los pacientes.
 * Maneja errores de base de datos y devuelve el código de estado adecuado.
 */
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

/**
 * Ruta GET para obtener un paciente por su ID. Recibe el ID del paciente como parámetro en la URL, busca el paciente en la base de datos y lo devuelve.
 * Si el paciente no existe, devuelve un error 404. Maneja errores de base de datos y devuelve el código de estado adecuado.
 */
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

/**
 * Ruta PATCH para actualizar un paciente. Recibe el ID del paciente como query parameter o como parámetro en la URL, y los datos a actualizar en el cuerpo de la solicitud.
 * Busca el paciente en la base de datos, lo actualiza con los nuevos datos y devuelve el paciente actualizado.
 * Si el paciente no existe, devuelve un error 404. Si no se proporciona el ID del paciente, devuelve un error 400. Maneja errores de base de datos y devuelve el código de estado adecuado.
 */
patientRouter.patch('/patients/', async (req, res) => {
  if (!req.query.id) {
    return res.status(400).send({ message: 'ID del paciente es requerido' });
  }

  const id = req.query.id as string;
  const updateData = req.body;

  try {
    const patient = await Patient.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!patient) {
      return res.status(404).send({ message: 'Paciente no encontrado' });
    }
    res.status(200).send(patient);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Ruta PATCH para actualizar un paciente utilizando el ID como parámetro en la URL. Recibe el ID del paciente como parámetro en la URL, y los datos a actualizar en el cuerpo de la solicitud.
 * Busca el paciente en la base de datos, lo actualiza con los nuevos datos y devuelve el paciente actualizado.
 * Si el paciente no existe, devuelve un error 404. Maneja errores de base de datos y devuelve el código de estado adecuado.
 */
patientRouter.patch('/patients/:id', async (req, res) => {
  const id = req.params.id;
  const updateData = req.body;

  try {
    const patient = await Patient.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!patient) {
      return res.status(404).send({ message: 'Paciente no encontrado' });
    }
    res.status(200).send(patient);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Ruta DELETE para eliminar un paciente. Recibe el ID del paciente como query parameter o como parámetro en la URL, busca el paciente en la base de datos y lo elimina.
 * Si el paciente no existe, devuelve un error 404. Si no se proporciona el ID del paciente, devuelve un error 400. Maneja errores de base de datos y devuelve el código de estado adecuado.
 */
patientRouter.delete('/patients/', async (req, res) => {
  if (!req.query.id) {
    return res.status(400).send({ message: 'ID del paciente es requerido' });
  }

  const id = req.query.id as string;

  try {
    const patient = await Patient.findByIdAndDelete(id);
    if (!patient) {
      return res.status(404).send({ message: 'Paciente no encontrado' });
    }
    res.status(200).send({ message: 'Paciente eliminado correctamente' });
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Ruta DELETE para eliminar un paciente utilizando el ID como parámetro en la URL. Recibe el ID del paciente como parámetro en la URL, busca el paciente en la base de datos y lo elimina.
 * Si el paciente no existe, devuelve un error 404. Maneja errores de base de datos y devuelve el código de estado adecuado.
 */
patientRouter.delete('/patients/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const patient = await Patient.findByIdAndDelete(id);
    if (!patient) {
      return res.status(404).send({ message: 'Paciente no encontrado' });
    }
    res.status(200).send({ message: 'Paciente eliminado correctamente' });
  } catch (error) {
    res.status(500).send(error);
  }
});