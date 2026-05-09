import express from 'express';
import { Records } from '../models/records.js';
import { Patient } from '../models/patient.js';
import mongoose from 'mongoose';
import { verifyExistencePersons, verifyExistenceStock } from '../utils/utils.js';
import { Medications } from '../models/medications.js';

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
    const { patientDni, staffColegiado, type, startDate, reason, medications, status } = req.body;
    const { patientId, staffId } = await verifyExistencePersons(patientDni, staffColegiado);
    const { processedMedications, total } = await verifyExistenceStock(medications);

    const record = new Records({
      patient: patientId,
      staff: staffId,
      type,
      startDate,
      reason,
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
 * Ruta GET para obtener registros médicos. Permite filtrar registros por DNI del paciente a través de query parameters.
 * Si no se proporcionan filtros, devuelve todos los registros. Maneja errores de base de datos y devuelve el código de estado adecuado.
 */

/**
 * @swagger
 * /records:
 *   get:
 *     summary: Obtiene la lista de registros médicos
 *     description: Permite obtener todos los registros o filtrarlos. Puede filtrar por el DNI del paciente (`patientDni`), o por un rango de fechas (`startDate` y `endDate`) opcionalmente combinado con el tipo de registro (`type`). Los resultados incluyen datos poblados del paciente, personal y medicamentos.
 *     tags:
 *       - Records
 *     parameters:
 *       - in: query
 *         name: patientDni
 *         schema:
 *           type: string
 *         description: DNI del paciente para buscar todos sus registros médicos
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio para el filtrado por rango (debe usarse junto a endDate)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin para el filtrado por rango (debe usarse junto a startDate)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: ['consulta ambulatoria', 'ingreso hospitalario']
 *         description: Tipo de registro médico para filtrar
 *     responses:
 *       200:
 *         description: Lista de registros médicos obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Record'
 *       404:
 *         description: No se encontraron registros o el paciente no existe
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

recordsRouter.get("/records", async (req, res, next) => {
  // Si no viene el DNI en la query, saltamos al siguiente GET
  if (!req.query.patientDni) {
    return next();
  }
  try {
    const patient = await Patient.findOne({ idNumber: req.query.patientDni.toString() });
    if (!patient) {
      return res.status(404).send({ error: "Paciente no encontrado" });
    }

    const records = await Records.find({ patient: patient._id })
      .sort({ startDate: 1 }) 
      .populate("patient", "fullName idNumber")
      .populate("staff", "fullName collegiateNumber specialty")
      .populate("medications.medication", "commercialName nationalCode unitPrice");
    if (records.length !== 0) {
      res.send(records);
    } else {
      res.status(404).send({ error: "Records not found" });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Ruta GET para obtener registros médicos. Permite filtrar registros por rango de fechas o con tipo específico a través de query parameters.
 * Si no se proporcionan filtros, devuelve todos los registros. Maneja errores de base de datos y devuelve el código de estado adecuado.
 */
recordsRouter.get("/records", async (req, res) => {
  try {
    const filter = req.query.startDate && req.query.endDate ? {
      startDate: {
        $gte: new Date(req.query.startDate.toString()),
        $lte: new Date(req.query.endDate.toString()),
      },
      ...(req.query.type 
            ? { type: req.query.type.toString() as 'consulta ambulatoria' | 'ingreso hospitalario' } 
            : {})
    } : {};

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

/**
 * Ruta PATCH para actualizar un registro médico por su ID.
 * Si se modifican los medicamentos, restaura el stock anterior, verifica el nuevo stock disponible y actualiza el coste total.
 */

/**
 * @swagger
 * /records/{id}:
 *   patch:
 *     summary: Actualiza un registro médico específico por su ID
 *     description: Permite actualizar campos de un registro. Si se actualizan los medicamentos, gestiona automáticamente la reposición y descuento del stock en el inventario. En caso de error de stock, revierte los cambios.
 *     tags:
 *       - Records
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del registro médico a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RecordUpdate'
 *     responses:
 *       200:
 *         description: Registro médico actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Record'
 *       400:
 *         description: Error de validación o stock insuficiente de los nuevos medicamentos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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

recordsRouter.patch('/records/:id', async (req, res) => {
  try {
    const record = await Records.findById(req.params.id);
    
    if (!record) {
      return res.status(404).send({ error: "Record not found" });
    }

    if (req.body.medications) {
      // Restaurar el stock de los medicamentos antiguos
      for (const oldItem of record.medications) {
        const med = await Medications.findById(oldItem.medication);
        if (med) {
          med.stock += oldItem.quantity;
          await med.save();
        }
      }

      // Verificar los nuevos medicamentos y descontar stock
      try {
        const { processedMedications, total } = await verifyExistenceStock(req.body.medications);
        req.body.medications = processedMedications;
        req.body.totalCost = total;
      } catch (error: any) {
        // Revertir cambios: Si falla, volvemos a restar el stock que habíamos restaurado
        for (const oldItem of record.medications) {
          const med = await Medications.findById(oldItem.medication);
          if (med) {
            med.stock -= oldItem.quantity;
            await med.save();
          }
        }
        const status = error.status || 400;
        return res.status(status).send({ error: error.message });
      }
    }

    // Aplicar los cambios al documento y guardar
    if (req.body.type) record.type = req.body.type;
    if (req.body.startDate) record.startDate = req.body.startDate;
    if (req.body.endDate) record.endDate = req.body.endDate;
    if (req.body.reason) record.reason = req.body.reason;
    if (req.body.status) record.status = req.body.status;
    
    const saved = await record.save();
    
    res.send(saved);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Ruta DELETE para eliminar un registro médico por su ID. Antes de eliminar el registro, restaura el stock de los medicamentos asociados al registro.
 * Si el registro médico no existe, devuelve un error 404. Maneja errores de base de datos y devuelve el código de estado adecuado.
 */

/**
 * @swagger
 * /records/{id}:
 *   delete:
 *     summary: Elimina un registro médico por su ID
 *     description: Busca el registro por su ID y lo elimina. Antes de eliminarlo, restaura en el inventario el stock de los medicamentos que estaban asociados a dicho registro.
 *     tags:
 *       - Records
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del registro médico a eliminar
 *     responses:
 *       200:
 *         description: Registro médico eliminado correctamente y stock restaurado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Record deleted successfully
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

recordsRouter.delete('/records/:id', async (req, res) => {
  try {
    const record = await Records.findById(req.params.id);
    
    if (!record) {
      return res.status(404).send({ error: "Record not found" });
    }

    // Restaurar el stock de los medicamentos asociados al registro antes de eliminarlo
    for (const item of record.medications) {
      const med = await Medications.findById(item.medication);
      if (med) {
        med.stock += item.quantity;
        await med.save();
      }
    }

    await Records.findByIdAndDelete(req.params.id);
    
    res.send({ message: "Record deleted successfully" });
  } catch (error) {
    res.status(500).send(error);
  }
});