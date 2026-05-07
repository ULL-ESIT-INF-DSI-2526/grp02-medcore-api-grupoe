import mongoose, { Document, Schema, model } from 'mongoose';
import validator from 'validator';

export interface RecordsDocumentInterface extends Document {
  patient: mongoose.Types.ObjectId;
  staff: mongoose.Types.ObjectId;
  type: 'consulta ambulatoria' | 'ingreso hospitalario';
  startDate: Date;
  endDate?: Date;
  reason: string;
  medications: Array<{
    medication: mongoose.Types.ObjectId;
    quantity: number;
    posology: string;
  }>;
  totalCost: number;
  status: 'abierto' | 'cerrado';
}

const RecordsSchema = new Schema<RecordsDocumentInterface>({
  patient: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  staff: {
    type: Schema.Types.ObjectId,
    ref: 'Staff',
    required: true,
  },
  type: {
    type: String,
    enum: ['consulta ambulatoria', 'ingreso hospitalario'],
    required: true,
  },
  startDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
  endDate: {
    type: Date,
  },
  reason: {
    type: String,
    required: true,
    trim: true,
  },
  medications: [
    {
      medication: {
        type: Schema.Types.ObjectId,
        ref: 'Medications',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      posology: {
        type: String,
        required: true,
        trim: true,
      },
    },
  ],
  totalCost: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['abierto', 'cerrado'],
    required: true,
    default: 'abierto',
  },
});

export const Records = model<RecordsDocumentInterface>('Records', RecordsSchema);