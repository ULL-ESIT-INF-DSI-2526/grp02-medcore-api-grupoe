import { describe, test, expect, beforeEach, afterAll, vi } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { Staff } from "../src/models/staff.js";
import { Patient } from "../src/models/patient.js";
import { Medications } from "../src/models/medications.js";
import { Records } from "../src/models/records.js";
import mongoose from "mongoose";

beforeEach(async () => {
  await mongoose.connection.dropDatabase();

  await Staff.create({
    fullName: "Dr. Juan Pérez",
    collegiateNumber: "12345",
    specialty: "medicina general",
    category: "médico/a adjunto/a",
    turno: "mañana",
    roomNumber: "101",
    experienceYears: 10,
    contact: {
      phone: "555-1234",
      email: "juan.perez@gmail.com",
    },
    state: "activo",
  });

  await Patient.create({
    fullName: "Juan Perez",
    birthDate: "1999-01-01",
    idNumber: "12345678A",
    socialSecurityNumber: "1111111111",
    gender: "Masculino",
    contact: {
      address: "Calle Falsa 123",
      phone: "111111111",
      email: "juan.perez@gmail.com",
    },
    allergies: ["Penicilina"],
    bloodType: "0+",
    status: "activo",
  });

  await Medications.create({
    commercialName: "Ibuprofeno",
    activeIngredient: "IbuprofenoActivo",
    nationalCode: "123456ABC",
    pharmaceuticalForm: "comprimido",
    standardDose: 200,
    doseUnit: "mg",
    administrationRoute: "oral",
    stock: 100,
    unitPrice: 5,
    requiredPrescription: true,
    expirationDate: "2026-12-31",
    contraindications: ["Embarazo", "Lactancia"],
  });
});

afterAll(async () => {
  // Cierra la conexión a la base de datos al terminar todos los tests (sino se queda pillado)
  await mongoose.connection.close();
});

describe("POST /records", () => {
  test("Debería crear un nuevo registro con medicamentos", async () => {
    const response = await request(app)
      .post("/records")
      .send({
        patientDni: "12345678A",
        staffColegiado: "12345",
        type: "consulta ambulatoria",
        startDate: "2024-01-01",
        reason: "Dolor de cabeza",
        medications: [
          {
            medication: "123456ABC",
            quantity: 2,
            posology: "Tomar 1 comprimido cada 8 horas",
          },
        ],
        status: "abierto",
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("_id");
    expect(response.body.totalCost).toBe(10);

    const med = await Medications.findOne({ nationalCode: "123456ABC" });
    expect(med?.stock).toBe(98);
  });

  test("Debe fallar al intentar crear un registro con stock insuficiente", async () => {
    const response = await request(app)
      .post("/records")
      .send({
        patientDni: "12345678A",
        staffColegiado: "12345",
        type: "consulta ambulatoria",
        startDate: "2024-01-01",
        reason: "Dolor de cabeza",
        medications: [
          {
            medication: "123456ABC",
            quantity: 500,
            posology: "Tomar 1 comprimido cada 8 horas",
          },
        ],
        status: "abierto",
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Stock insuficiente");
  });

  test("Debe fallar con datos inválidos o incompletos (Falta DNI)", async () => {
    const response = await request(app)
      .post("/records")
      .send({
        staffColegiado: "12345",
        type: "consulta ambulatoria",
        startDate: "2024-01-01",
        reason: "Dolor de cabeza",
        medications: [
          {
            medication: "123456ABC",
            quantity: 2,
            posology: "Tomar 1 comprimido cada 8 horas",
          },
        ],
        status: "abierto",
      });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Paciente no encontrado");
  });

  test("Debe fallar con datos inválidos o incompletos (Médico no activo)", async () => {
    await Staff.create({
      fullName: "Dr. María García",
      collegiateNumber: "54321",
      specialty: "medicina general",
      category: "médico/a adjunto/a",
      turno: "mañana",
      roomNumber: "102",
      experienceYears: 8,
      contact: {
        phone: "555-5678",
        email: "maria.garcia@gmail.com",
      },
      state: "inactivo",
    });

    const response = await request(app)
      .post("/records")
      .send({
        patientDni: "12345678A",
        staffColegiado: "54321",
        type: "consulta ambulatoria",
        startDate: "2024-01-01",
        reason: "Dolor de cabeza",
        medications: [
          {
            medication: "123456ABC",
            quantity: 2,
            posology: "Tomar 1 comprimido cada 8 horas",
          },
        ],
        status: "abierto",
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("El médico no está activo");
  });

  test("Debe fallar con datos inválidos o incompletos (Medicamento no encontrado)", async () => {
    const response = await request(app)
      .post("/records")
      .send({
        patientDni: "12345678A",
        staffColegiado: "12345",
        type: "consulta ambulatoria",
        startDate: "2024-01-01",
        reason: "Dolor de cabeza",
        medications: [
          {
            medication: "999999ZZZ",
            quantity: 2,
            posology: "Tomar 1 comprimido cada 8 horas",
          },
        ],
        status: "abierto",
      });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe(
      "Medicamento con código nacional 999999ZZZ no encontrado",
    );
  });

  test("Debe fallar con datos inválidos o incompletos (Médico no encontrado)", async () => {
    const response = await request(app)
      .post("/records")
      .send({
        patientDni: "12345678A",
        staffColegiado: "99999",
        type: "consulta ambulatoria",
        startDate: "2024-01-01",
        reason: "Dolor de cabeza",
        medications: [
          {
            medication: "123456ABC",
            quantity: 2,
            posology: "Tomar 1 comprimido cada 8 horas",
          },
        ],
        status: "abierto",
      });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Médico no encontrado");
  });

  test("Debe devolver error 500 en caso de error inesperado", async () => {
    const spy = vi
      .spyOn(Records.prototype, "save")
      .mockRejectedValue(new Error("Error de base de datos"));

    const response = await request(app)
      .post("/records")
      .send({
        patientDni: "12345678A",
        staffColegiado: "12345",
        type: "consulta ambulatoria",
        startDate: "2024-01-01",
        reason: "Dolor de cabeza",
        medications: [
          {
            medication: "123456ABC",
            quantity: 2,
            posology: "Tomar 1 comprimido cada 8 horas",
          },
        ],
        status: "abierto",
      });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Error de base de datos");

    spy.mockRestore();
  });
});
