import { Document, Schema, model } from 'mongoose';
import validator from 'validator';

/**
 * Interfaz que define la estructura de un documento de un personal medico en MongoDB. 
 */
export interface StaffDocumentInterface extends Document {
  fullName: string;
  collegiateNumber: string;
  specialty: string;
  category: 'médico/a adjunto/a' | 'médico/a residente' | 'enfermero/a' | 'auxiliar de enfermería' | 'jefe/a de servicio';
  turno: 'mañana' | 'tarde' | 'noche' | 'rotatorio';
  roomNumber: string;
  experienceYears: number;
  contact: {
    phone: string;
    email: string;
  };
  state: 'activo' | 'inactivo';
}

/*
 * Esquema de Mongoose para el modelo de staff. Define los campos, sus tipos, validaciones y restricciones.
 */
const StaffSchema = new Schema<StaffDocumentInterface>({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  collegiateNumber: {
    type: String,
    unique: true, // Único
    required: true,
    trim: true,
  },
  specialty: {
    type: String,
    required: true,
    trim: true,
    // Usamos una enumeración amplia
    enum: ['medicina general', 'cardiología', 'traumatología', 'pediatría', 'oncología', 'urgencias', 'cirugía', 'psiquiatría', 'neurología'],
  },
  category: {
    type: String,
    required: true,
    enum: ['médico/a adjunto/a', 'médico/a residente', 'enfermero/a', 'auxiliar de enfermería', 'jefe/a de servicio'],
  },
  turno: {
    type: String,
    required: true,
    enum: ['mañana', 'tarde', 'noche', 'rotatorio'],
  },
  roomNumber: {
    type: String,
    required: true,
    trim: true,
  },
  experienceYears: {
    type: Number,
    required: true,
    min: [0, 'Years must be positive'],
  },
  contact: {
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
  state: {
    type: String,
    required: true,
    default: 'activo',
    enum: ['activo', 'inactivo'],
  }
});

/**
 * Exportamos el modelo de personal basado en el esquema definido.
 */
export const Staff = model<StaffDocumentInterface>('Staff', StaffSchema);