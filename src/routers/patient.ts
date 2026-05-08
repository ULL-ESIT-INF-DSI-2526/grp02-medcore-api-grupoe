import express from 'express';
import { Patient } from '../models/patient.js';

export const patientRouter = express.Router();

/**
 * Ruta POST para crear un nuevo paciente. Recibe los datos del paciente en el cuerpo de la solicitud, crea un nuevo paciente en la base de datos y devuelve el paciente creado.
 * Maneja errores de validación y devuelve el código de estado adecuado.
 */

/**
 * @swagger
 * /patients:
 *   post:
 *     summary: Crea un nuevo paciente
 *     description: Recibe los datos del paciente en el cuerpo de la solicitud, crea un nuevo paciente en la base de datos y devuelve el paciente creado. Maneja errores de validación.
 *     tags:
 *       - Patients
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatientCreate'
 *     responses:
 *       201:
 *         description: Paciente creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patient'
 *       400:
 *         description: Error de validación o datos incorrectos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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

/**
 * @swagger
 * /patients:
 *   get:
 *     summary: Obtiene la lista de pacientes
 *     description: Permite filtrar pacientes por nombre completo (fullName) o número de identificación (idNumber) a través de query parameters. Si no se proporcionan filtros, devuelve todos los pacientes.
 *     tags:
 *       - Patients
 *     parameters:
 *       - in: query
 *         name: fullName
 *         schema:
 *           type: string
 *         description: Filtrar por el nombre completo del paciente
 *       - in: query
 *         name: idNumber
 *         schema:
 *           type: string
 *         description: Filtrar por el número de identificación del paciente
 *     responses:
 *       200:
 *         description: Lista de pacientes obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Patient'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

patientRouter.get('/patients', async (req, res) => {
  const filter = req.query.fullName
  ? { fullName: req.query.fullName.toString() }
  : req.query.idNumber
  ? { idNumber: req.query.idNumber.toString() }
  : {};
  
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

/**
 * @swagger
 * /patients/{id}:
 *   get:
 *     summary: Obtiene un paciente por su ID
 *     description: Recibe el ID del paciente como parámetro en la URL, busca el paciente en la base de datos y lo devuelve.
 *     tags:
 *       - Patients
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del paciente
 *     responses:
 *       200:
 *         description: Paciente encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patient'
 *       404:
 *         description: Paciente no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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

/**
 * @swagger
 * /patients:
 *   patch:
 *     summary: Actualiza un paciente usando query parameters
 *     description: Permite actualizar un paciente filtrando por nombre completo o número de identificación. Se requiere al menos un parámetro.
 *     tags:
 *       - Patients
 *     parameters:
 *       - in: query
 *         name: idNumber
 *         schema:
 *           type: string
 *         description: Número de identificación del paciente a actualizar
 *       - in: query
 *         name: fullName
 *         schema:
 *           type: string
 *         description: Nombre completo del paciente a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatientUpdate'
 *     responses:
 *       200:
 *         description: Paciente actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patient'
 *       400:
 *         description: Bad request, faltan query parameters requeridos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Paciente no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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

/**
 * @swagger
 * /patients/{id}:
 *   patch:
 *     summary: Actualiza un paciente específico por su ID
 *     description: Recibe el ID del paciente en la URL y los datos a actualizar en el cuerpo de la solicitud.
 *     tags:
 *       - Patients
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del paciente a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatientUpdate'
 *     responses:
 *       200:
 *         description: Paciente actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patient'
 *       404:
 *         description: Paciente no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
    res.status(500).send(error);
  }
});

/**
 * Ruta DELETE para eliminar un paciente utilizando filtros en query parameters. Permite eliminar un paciente filtrando por nombre completo o número de identificación a través de query parameters.
 * Si no se proporcionan filtros, devuelve un error 400. Si el paciente no existe, devuelve un error 404. Maneja errores de base de datos y devuelve el código de estado adecuado.
 */

/**
 * @swagger
 * /patients:
 *   delete:
 *     summary: Elimina un paciente usando query parameters
 *     description: Permite eliminar un paciente filtrando por nombre completo o número de identificación. Se requiere al menos un parámetro de búsqueda.
 *     tags:
 *       - Patients
 *     parameters:
 *       - in: query
 *         name: idNumber
 *         schema:
 *           type: string
 *         description: Número de identificación del paciente a eliminar
 *       - in: query
 *         name: fullName
 *         schema:
 *           type: string
 *         description: Nombre completo del paciente a eliminar
 *     responses:
 *       200:
 *         description: Paciente eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Paciente eliminado correctamente
 *       400:
 *         description: Bad request, faltan query parameters requeridos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Paciente no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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

/**
 * @swagger
 * /patients/{id}:
 *   delete:
 *     summary: Elimina un paciente por su ID
 *     description: Recibe el ID del paciente como parámetro en la URL, busca el paciente en la base de datos y lo elimina.
 *     tags:
 *       - Patients
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del paciente a eliminar
 *     responses:
 *       200:
 *         description: Paciente eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Paciente eliminado correctamente
 *       404:
 *         description: Paciente no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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