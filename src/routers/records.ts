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