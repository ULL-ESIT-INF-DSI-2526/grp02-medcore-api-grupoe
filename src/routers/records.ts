import express from 'express';
import { Records } from '../models/records.js';
import { verifyExistencePersons, verifyExistenceStock } from '../utils/utils.js';

export const recordsRouter = express.Router();


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
 * Ruta GET para obtener un un registro médico por su ID. Recibe el ID del miembro como parámetro en la URL, busca el registro en la base de datos y lo devuelve.
 * Si el registro médico no existe, devuelve un error 404. Maneja errores de base de datos y devuelve el código de estado adecuado.
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