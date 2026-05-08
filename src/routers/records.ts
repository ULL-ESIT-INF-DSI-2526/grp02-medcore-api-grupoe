import express from 'express';
import { Records } from '../models/records.js';
import { Patient } from '../models/patient.js';
import mongoose from 'mongoose';
import { verifyExistencePersons, verifyExistenceStock } from '../utils/utils.js';

export const recordsRouter = express.Router();

/**
 * @swagger
 * /records:
 *   post:
 *     summary: Crea un nuevo registro médico
 *     description: Recibe los datos del registro en el cuerpo de la solicitud (utilizando patientDni y staffColegiado). Verifica la existencia del paciente, del personal y del stock de medicamentos para calcular el coste total antes de guardarlo en la base de datos.
 *     tags:
 *       - Records
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RecordCreate'
 *     responses:
 *       201:
 *         description: Registro médico creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Record'
 *       400:
 *         description: Error de validación, falta de stock o entidades no encontradas (paciente/staff)
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

recordsRouter.post('/records', async (req, res) => {
  try {
    const { patientDni, staffColegiado, type, startDate, reason, diagnosis, medications, status } = req.body;
    const { patientId, staffId } = await verifyExistencePersons(patientDni, staffColegiado);
    const { processedMedications, total } = await verifyExistenceStock(medications);

    const record = new Records({
      patient: patientId,
      staff: staffId,
      type,
      startDate,
      reason,
      diagnosis,
      medications: processedMedications,
      totalCost: total,
      status
    });

    const saved = await record.save();
    res.status(201).send(saved);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).send({ error: error.message});
  }
});

/**
 * Ruta GET para obtener registros médicos. Permite filtrar registros por DNI del paciente o rango de fechas o con tipo específico a través de query parameters.
 * Si no se proporcionan filtros, devuelve todos los registros. Maneja errores de base de datos y devuelve el código de estado adecuado.
 */
recordsRouter.get("/records", async (req, res) => {
  try { 
    let resolvedPatientId: mongoose.Types.ObjectId | undefined;
    // Sacamos el ID con el DNI si se proporciona 
    if (req.query.patientDni) {
      const patient = await Patient.findOne({ idNumber: req.query.patientDni.toString() });
      if (!patient) {
        return res.status(404).send({ error: "Paciente no encontrado" });
      }
      resolvedPatientId = patient._id as mongoose.Types.ObjectId;
    }
    // Filtro
    const filter = req.query.patientDni
      ? { patient: resolvedPatientId } : req.query.startDate && req.query.endDate
      ? {
          startDate: {
            $gte: new Date(req.query.startDate.toString()),
            $lte: new Date(req.query.endDate.toString()),
          },
          ...(req.query.type ? { type: req.query.type.toString() as 'consulta ambulatoria' | 'ingreso hospitalario' } : {})
        }
      : {};
    // Busqueda
    const records = await Records.find(filter)
      .sort({ startDate: 1 })
      .populate("patient", "fullName idNumber")
      .populate("staff", "fullName collegiateNumber specialty")
      .populate("medications.medication", "commercialName nationalCode unitPrice");

    if (records.length !== 0) {
      res.send(records);
    } else {
      res.status(404).send({
        error: "Records not found",
      });
    }
  } catch (error) { 
    res.status(500).send(error);
  }
});


/**
 * Ruta GET para obtener un un registro médico por su ID. Recibe el ID del miembro como parámetro en la URL, busca el registro en la base de datos y lo devuelve.
 * Si el registro médico no existe, devuelve un error 404. Maneja errores de base de datos y devuelve el código de estado adecuado.
 */

/**
 * @swagger
 * /records/{id}:
 *   get:
 *     summary: Obtiene un registro médico por su ID
 *     description: Recibe el ID del registro como parámetro en la URL, lo busca en la base de datos y lo devuelve. Los datos devueltos incluyen información detallada (poblada) del paciente, personal médico y medicamentos asociados.
 *     tags:
 *       - Records
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del registro médico
 *     responses:
 *       200:
 *         description: Registro médico encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Record'
 *       404:
 *         description: Registro médico no encontrado
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

recordsRouter.get("/records/:id", async (req, res) => {
  try {
    // Usamos el populate para obtener los datos relacionados de paciente, staff y medicamentos en lugar de solo sus IDs (para dar mas info)
    const record = await Records.findById(req.params.id)
      .populate('patient', 'fullName idNumber contact')
      .populate('staff', 'fullName collegiateNumber specialty')
      .populate('medications.medication', 'commercialName activeIngredient unitPrice');

    if (record) {
      res.send(record);
    } else {
      res.status(404).send({
        error: "Record not found",
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});