import { Document, Schema, model } from 'mongoose';
import validator from 'validator';

/**
 * Interfaz que define la estructura de un documento de paciente en MongoDB. 
 */
interface PatientDocumentInterface extends Document {
  fullName: string;
  birthDate: Date;
  idNumber: string; // DNI, pasaporte único
  socialSecurityNumber: string; // Único
  gender: string;
  contact: {
    address: string;
    phone: string;
    email: string;
  };
  allergies: string[];
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | '0+' | '0-';
  status: 'activo' | 'baja temporal' | 'fallecido';
}

/**
 * Esquema de Mongoose para el modelo de paciente. Define los campos, sus tipos, validaciones y restricciones.
 */
const PatientSchema = new Schema<PatientDocumentInterface>({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  birthDate: {
    type: Date,
    required: true,
  },
  idNumber: {
    type: String,
    unique: true, // Debe ser único 
    required: true,
    trim: true,
  },
  socialSecurityNumber: {
    type: String,
    unique: true, // Debe ser único
    required: true,
    trim: true,
  },
  gender: {
    type: String,
    required: true,
    trim: true,
  },
  contact: {
    address: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate(value: string) {
        if (!validator.default.isEmail(value)) {
          throw new Error('Email is invalid');
        }
      }
    }
  },
  allergies: {
    type: [String], // Lista de cadenas de texto
    default: [],    // Puede ser una lista vacía
  },
  bloodType: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-'], 
  },
  status: {
    type: String,
    required: true,
    default: 'activo',
    enum: ['activo', 'baja temporal', 'fallecido'],
  }
});

/**
 * Exportamos el modelo de paciente basado en el esquema definido.
 */
export const Patient = model<PatientDocumentInterface>('Patient', PatientSchema);