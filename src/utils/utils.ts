import { Medications } from '../models/medications.js';
import { Patient } from '../models/patient.js';
import { Staff } from '../models/staff.js';

/**
 * Función para verificar la existencia de un paciente y un médico en la base de datos. 
 */
export const verifyExistencePersons = async (patientDni: string, staffColegiado: string) => {
    const patient = await Patient.findOne({ idNumber: patientDni });
    if (!patient) {
      throw { status: 404, message: 'Paciente no encontrado' };
    }

    const staff = await Staff.findOne({ collegiateNumber: staffColegiado });
    if (!staff) {
      throw { status: 404, message: 'Médico no encontrado' };
    }

    if (staff.state !== 'activo') {
      throw { status: 400, message: 'El médico no está activo' };
    }

    return { patientId: patient._id, staffId: staff._id };
};


/**
 * Función para verificar la existencia de medicamentos en la base de datos y su stock. 
 * @param medications - Array de objetos que contienen el código nacional del medicamento, la cantidad y la posología.
 * @returns Un objeto que contiene los medicamentos procesados y el costo total.
 */
export const verifyExistenceStock = async (medications: Array<{ medication: string; quantity: number; posology: string }>) => {
    let total = 0;
    const processedMedications = [];
    const updateMedications = [];

    for (const med of medications) {
        const medication = await Medications.findOne({ nationalCode: med.medication });
        
        if (!medication) {
            throw { status: 404, message: `Medicamento con código nacional ${med.medication} no encontrado` };
        }

        if (medication.stock < med.quantity) {
            throw { status: 400, message: `Stock insuficiente` };
        }
        /**
         * Acumulamos los medicamentos a actualizar y el total
         */
        updateMedications.push({ medication: medication, quantity: med.quantity });
        total += medication.unitPrice * med.quantity;

        /**
         * Medicamentos procesados
         */
        processedMedications.push({ 
            medication: medication._id, 
            quantity: med.quantity,
            posology: med.posology
        });
    }

    /** 
     * Actualizamos el stock 
     */

    for (const med of updateMedications) {
        med.medication.stock -= med.quantity;
        await med.medication.save();
    }

    return { processedMedications, total };
};
