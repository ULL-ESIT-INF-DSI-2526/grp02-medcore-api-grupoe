import express from 'express';
import { Patient } from '../models/patient.js';

export const patientRouter = express.Router();

/**
 * Ruta POST para crear un nuevo paciente. Recibe los datos del paciente en el cuerpo de la solicitud, crea un nuevo paciente en la base de datos y devuelve el paciente creado.
 * Maneja errores de validación y devuelve el código de estado adecuado.
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
 * Ruta GET para obtener pacientes. Permite filtrar pacientes por nombre completo o número de identificación a través de query parameters.
 * Si no se proporcionan filtros, devuelve todos los pacientes. Maneja errores de base de datos y devuelve el código de estado adecuado.
 */
patientRouter.get('/patients', async (req, res) => {
  const filter: any = {};

  if (req.query.fullName) filter.fullName = req.query.fullName;
  if (req.query.idNumber) filter.idNumber = req.query.idNumber;

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
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).send({ message: 'Paciente no encontrado' });
    }
    res.status(200).send(patient);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Ruta PATCH para actualizar un paciente utilizando filtros en query parameters. Permite actualizar un paciente filtrando por nombre completo o número de identificación a través de query parameters.
 * Si no se proporcionan filtros, devuelve un error 400. Si el paciente no existe, devuelve un error 404. Maneja errores de base de datos y devuelve el código de estado adecuado.
 */
patientRouter.patch('/patients', async (req, res) => {
  if (!req.query.idNumber && !req.query.fullName) {
    return res.status(400).send({ message: 'Se requiere idNumber o fullName para actualizar' });
  }

  const filter: any = {};
  if (req.query.idNumber) filter.idNumber = req.query.idNumber as string;
  if (req.query.fullName) filter.fullName = req.query.fullName as string;

  const updateData = req.body;

  try {
    const patient = await Patient.findOneAndUpdate(filter, updateData, { new: true, runValidators: true });
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
  const updateData = req.body;

  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!patient) {
      return res.status(404).send({ message: 'Paciente no encontrado' });
    }
    res.status(200).send(patient);
  } catch (error) {
    res.status(4500).send(error);
  }
});

/**
 * Ruta DELETE para eliminar un paciente utilizando filtros en query parameters. Permite eliminar un paciente filtrando por nombre completo o número de identificación a través de query parameters.
 * Si no se proporcionan filtros, devuelve un error 400. Si el paciente no existe, devuelve un error 404. Maneja errores de base de datos y devuelve el código de estado adecuado.
 */
patientRouter.delete('/patients', async (req, res) => {
  if (!req.query.idNumber && !req.query.fullName) {
    return res.status(400).send({ message: 'Se requiere idNumber o fullName para borrar' });
  }

  const filter: any = {};
  if (req.query.idNumber) filter.idNumber = req.query.idNumber as string;
  if (req.query.fullName) filter.fullName = req.query.fullName as string;

  try {
    const patient = await Patient.findOne(filter);
    if (!patient) {
      return res.status(404).send({ message: 'Paciente no encontrado' });
    }

    // Faltaría añadir la lógica de borrado cuando tengamos lo de los registros médicos

    await Patient.findByIdAndDelete(patient._id);
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
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).send({ message: 'Paciente no encontrado' });
    }

  // Faltaría añadir la lógica de borrado cuando tengamos lo de los registros médicos

    await Patient.findByIdAndDelete(req.params.id);
    res.status(200).send({ message: 'Paciente eliminado correctamente' });
  } catch (error) {
    res.status(500).send(error);
  }
});