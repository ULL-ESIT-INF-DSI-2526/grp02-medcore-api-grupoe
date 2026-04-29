import { describe, test, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { Patient } from "../src/models/patient.js";
import mongoose from "mongoose";

const firstPatient = {
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
};

beforeEach(async () => {
  await Patient.deleteMany();
  await new Patient(firstPatient).save();
});

afterAll(async () => {
  // Cierra la conexión a la base de datos al terminar todos los tests (sino se queda pillado)
  await mongoose.connection.close();
});

describe("POST /patients", () => {
  test("Deberia crear un nuevo paciente correctamente", async () => {
    await request(app)
      .post("/patients")
      .send({
        fullName: "Alejandro García",
        birthDate: "1985-10-20",
        idNumber: "22222222B",
        socialSecurityNumber: "3333333333",
        gender: "Masculino",
        contact: {
          address: "Avenida No se",
          phone: "555555555",
          email: "agarcia@gmail.com",
        },
        allergies: [],
        bloodType: "A+",
        status: "activo",
      })
      .expect(201);
  });

  test("Deberia dar error al crear un paciente con datos inválidos", async () => {
    await request(app).post("/patients").send(firstPatient).expect(400);
  });
});