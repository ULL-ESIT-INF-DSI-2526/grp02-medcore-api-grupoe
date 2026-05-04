import { describe, test, expect, beforeEach, afterAll, vi } from "vitest";
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

  test("Deberia dar error al hacer una petición a un ruta incorrecta", async () => {
    await request(app).post("/p").send(firstPatient).expect(501);
  });

  test("Deberia dar error al crear un paciente con email inválido", async () => {
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
          email: "agarciagmail.com", // Email inválido
        },
        allergies: [],
        bloodType: "A+",
        status: "activo",
      })
      .expect(400);
  });
});

describe("GET /patients", () => {
  test("Deberia obtener la lista de pacientes correctamente", async () => {
    const response = await request(app).get("/patients").expect(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].fullName).toBe(firstPatient.fullName);
  });

  test("Deberia devolver error 500 si hay un fallo en la base de datos", async () => {
    const findSpy = vi.spyOn(Patient, 'find').mockRejectedValue(new Error('Fallo simulado en la BD'));

    await request(app).get("/patients").expect(500);

    findSpy.mockRestore();
  });

  test("Deberia dar error al hacer una petición a un ruta incorrecta", async () => {
    await request(app).get("/p").expect(501); // Ruta incorrecta
  });
});