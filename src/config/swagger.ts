import swaggerJSDoc, { Options } from "swagger-jsdoc";

const options: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Medical Center REST API",
      version: "1.0.0",
      description:
        "REST API built with Node.js, Express, Mongoose and TypeScript for managing patients, staff, medications, and medical records.",
    },
    servers: [
      {
        url: process.env.SWAGGER_SERVER || "http://localhost:3000",
      },
    ],
    components: {
      schemas: {
        // --- ERROR RESPONSE ---
        ErrorResponse: {
          type: "object",
          properties: {
            error: {
              type: "string",
              example: "No se encontraron resultados",
            },
            message: {
              type: "string",
              example: "Medicamento no encontrado",
            }
          },
        },

        // --- PATIENTS ---
        Patient: {
          type: "object",
          properties: {
            _id: { type: "string", example: "60d0fe4f5311236168a109ca" },
            fullName: { type: "string", example: "Juan Pérez García" },
            idNumber: { type: "string", example: "12345678A" },
            contact: { type: "string", example: "+34 600 000 000" },
          },
        },
        PatientCreate: {
          type: "object",
          required: ["fullName", "idNumber"],
          properties: {
            fullName: { type: "string", example: "Juan Pérez García" },
            idNumber: { type: "string", example: "12345678A" },
            contact: { type: "string", example: "+34 600 000 000" },
          },
        },
        PatientUpdate: {
          type: "object",
          additionalProperties: false,
          properties: {
            fullName: { type: "string", example: "Juan Pérez García" },
            idNumber: { type: "string", example: "12345678A" },
            contact: { type: "string", example: "+34 600 000 000" },
          },
        },

        // --- STAFF ---
        Staff: {
          type: "object",
          properties: {
            _id: { type: "string", example: "60d0fe4f5311236168a109cb" },
            fullName: { type: "string", example: "Dra. María Gónzalez" },
            collegiateNumber: { type: "string", example: "COL-98765" },
            specialty: { type: "string", example: "Cardiología" },
            category: { type: "string", example: "Especialista" },
            shift: { type: "string", example: "Mañana" },
            roomNumber: { type: "integer", example: 102 },
            experienceYears: { type: "integer", example: 15 },
            contact: { type: "string", example: "maria.gonzalez@hospital.com" },
            status: { type: "string", example: "Activo" },
          },
        },
        StaffCreate: {
          type: "object",
          required: ["fullName", "collegiateNumber", "specialty"],
          properties: {
            fullName: { type: "string", example: "Dra. María Gónzalez" },
            collegiateNumber: { type: "string", example: "COL-98765" },
            specialty: { type: "string", example: "Cardiología" },
            category: { type: "string", example: "Especialista" },
            shift: { type: "string", example: "Mañana" },
            roomNumber: { type: "integer", example: 102 },
            experienceYears: { type: "integer", example: 15 },
            contact: { type: "string", example: "maria.gonzalez@hospital.com" },
            status: { type: "string", example: "Activo" },
          },
        },
        StaffUpdate: {
          type: "object",
          additionalProperties: false,
          properties: {
            fullName: { type: "string", example: "Dra. María Gónzalez" },
            collegiateNumber: { type: "string", example: "COL-98765" },
            specialty: { type: "string", example: "Cardiología" },
            category: { type: "string", example: "Especialista" },
            shift: { type: "string", example: "Mañana" },
            roomNumber: { type: "integer", example: 102 },
            experienceYears: { type: "integer", example: 15 },
            contact: { type: "string", example: "maria.gonzalez@hospital.com" },
            status: { type: "string", example: "Activo" },
          },
        },

        // --- MEDICATIONS ---
        Medication: {
          type: "object",
          properties: {
            _id: { type: "string", example: "60d0fe4f5311236168a109cc" },
            commercialName: { type: "string", example: "Ibuprofeno 600mg" },
            activeIngredient: { type: "string", example: "Ibuprofeno" },
            nationalCode: { type: "string", example: "CN-123456" },
            unitPrice: { type: "number", example: 4.50 },
          },
        },
        MedicationCreate: {
          type: "object",
          required: ["commercialName", "activeIngredient", "nationalCode"],
          properties: {
            commercialName: { type: "string", example: "Ibuprofeno 600mg" },
            activeIngredient: { type: "string", example: "Ibuprofeno" },
            nationalCode: { type: "string", example: "CN-123456" },
            unitPrice: { type: "number", example: 4.50 },
          },
        },
        MedicationUpdate: {
          type: "object",
          additionalProperties: false,
          properties: {
            commercialName: { type: "string", example: "Ibuprofeno 600mg" },
            activeIngredient: { type: "string", example: "Ibuprofeno" },
            nationalCode: { type: "string", example: "CN-123456" },
            unitPrice: { type: "number", example: 4.50 },
          },
        },

        // --- RECORDS ---
        Record: {
          type: "object",
          properties: {
            _id: { type: "string", example: "60d0fe4f5311236168a109cd" },
            patient: { $ref: "#/components/schemas/Patient" },
            staff: { $ref: "#/components/schemas/Staff" },
            type: { type: "string", example: "consulta ambulatoria" },
            startDate: { type: "string", format: "date-time", example: "2023-10-15T10:30:00.000Z" },
            reason: { type: "string", example: "Dolor en el pecho" },
            diagnosis: { type: "string", example: "Angina de pecho leve" },
            medications: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  medication: { $ref: "#/components/schemas/Medication" }
                }
              }
            },
            totalCost: { type: "number", example: 150.75 },
            status: { type: "string", example: "Completado" },
          },
        },
        RecordCreate: {
          type: "object",
          required: ["patientDni", "staffColegiado", "type", "startDate"],
          properties: {
            patientDni: { type: "string", example: "12345678A" },
            staffColegiado: { type: "string", example: "COL-98765" },
            type: { type: "string", example: "consulta ambulatoria" },
            startDate: { type: "string", format: "date-time", example: "2023-10-15T10:30:00.000Z" },
            reason: { type: "string", example: "Dolor en el pecho" },
            diagnosis: { type: "string", example: "Angina de pecho leve" },
            medications: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  medicationNationalCode: { type: "string", example: "CN-123456" },
                  quantity: { type: "integer", example: 1 }
                }
              }
            },
            status: { type: "string", example: "Completado" },
          },
        },
      },
    },
  },
  // Ensure the paths match where you are keeping your route files
  apis: ["./src/routes/*.ts", "./dist/routes/*.js"],
};

export const swaggerSpec = swaggerJSDoc(options);