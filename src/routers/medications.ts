import express from 'express';
import { Medications } from '../models/medications.js';

export const medicationsRouter = express.Router();

medicationsRouter.post('/medications', async (req, res) => {
  const medication = new Medications(req.body);
  try {
    await medication.save();
    res.status(201).send(medication);
  } catch (error) {
    res.status(400).send(error);
  }
});