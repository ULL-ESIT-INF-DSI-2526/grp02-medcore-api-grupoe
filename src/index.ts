import express from 'express';
import './db/mongoose.js';
import { patientRouter } from './routers/patient.js';
import { staffRouter } from './routers/staff.js';
import { medicationsRouter } from './routers/medications.js';
import { defaultRouter } from './routers/default.js';

const app = express();
app.use(express.json());
app.use(patientRouter);
app.use(staffRouter);
app.use(medicationsRouter);
app.use(defaultRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});