import express from 'express';
import { Records } from '../models/records.js';
import { verifyExistencePersons, verifyExistenceStock } from '../utils/utils.js';

export const recordsRouter = express.Router();


recordsRouter.post('/records', async (req, res) => {
    try {
      const { patientDni, staffColegiado, type, reason, diagnosis, medications } = req.body;
      const { patientId, staffId } = await verifyExistencePersons(patientDni, staffColegiado);
      const { processedMedications, total } = await verifyExistenceStock(medications);

      const record = new Records({
        patient: patientId,
        staff: staffId,
        type,
        reason,
        diagnosis,
        medications: processedMedications,
        totalCost: total,
      });

      const saved = await record.save();
      res.status(201).send(saved);
    } catch (error) {
      res.status(500).send({ error: 'Error al crear el registro' });
    }
});