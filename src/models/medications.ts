import { Document, Schema, model } from 'mongoose';
import validator from 'validator';

export type PharmaceuticalForm = 'comprimido' | 'cápsula' | 'solución oral' | 'solución inyectable' | 'pomada' | 'parche transdérmico' | 'inhalador' | 'otras';
export type AdministrationRoute = 'oral' | 'intravenosa' | 'intramuscular' | 'subcutánea' | 'tópica' | 'inhalatoria';

export interface MedicationsDocumentInterface extends Document {
  commercialName: string;
  activeIngredient: string;
  nationalCode: string;
  pharmaceuticalForm: PharmaceuticalForm;
  standardDose: number;
  doseUnit: string;
  administrationRoute: AdministrationRoute;
  stock: number;
  unitPrice: number;
  requiredPrescription: boolean;
  expirationDate: Date;
  contraindications: string[];
}

const MedicationsSchema = new Schema<MedicationsDocumentInterface>({
  commercialName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
  },
  activeIngredient: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
  },
  nationalCode: {
    type: String,
    unique: true, // Debe ser único
    required: true,
    trim: true,
  },
  pharmaceuticalForm: {
    type: String,
    required: true,
    enum: ['comprimido', 'cápsula', 'solución oral', 'solución inyectable', 'pomada', 'parche transdérmico', 'inhalador', 'otras'],
  },
  standardDose: {
    type: Number,
    required: true,
    min: 0,  // Evito negativos
  },
  doseUnit: {
    type: String,
    required: true,
    trim: true,
  },
  administrationRoute: {
    type: String,
    required: true,
    enum: ['oral', 'intravenosa', 'intramuscular', 'subcutánea', 'tópica', 'inhalatoria']
  },
  stock: {
    type: Number,
    required: true,
    min: 0, // Evito negativos
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0, // Evito negativos
  },
  requiredPrescription: {
    type: Boolean,
    required: true,
  },
  expirationDate: {
    type: Date,
    required: true,
    validate(value: Date) {
      if (value < new Date()) {
        throw new Error('La fecha de expiración no puede ser en el pasado');
      }
    }
  },
  contraindications: {
    type: [String],
  }
});

export const Medications = model<MedicationsDocumentInterface>('Medications', MedicationsSchema);