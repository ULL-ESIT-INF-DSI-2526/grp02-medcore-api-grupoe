import { describe, test, expect, beforeEach, afterAll, vi } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { Staff } from "../src/models/staff.js";
import mongoose from "mongoose";

const firstStaff = {
  fullName: "Dr. Juan Pérez",
  collegiateNumber: "12345",
  specialty: "medicina general",
  category: "médico/a adjunto/a",
  turno: "mañana",
  roomNumber: "101",
  experienceYears: 10,
  contact: {
    phone: "555-1234",
    email: "juan.perez@gmail.com"
  },
  state: "activo"
};

beforeEach(async () => {
  await Staff.deleteMany({});
  await new Staff(firstStaff).save();
});

afterAll(async () => {
  // Cierra la conexión a la base de datos al terminar todos los tests (sino se queda pillado)
  await mongoose.connection.close();
});

describe("POST /staff", () => {
  test("Debería crear un nuevo miembro del personal médico", async () => {
    await request(app)
      .post("/staff")
      .send({
        fullName: "Alejandro García",
        collegiateNumber: "67890",
        specialty: "cardiología",
        category: "médico/a residente",
        turno: "tarde",
        roomNumber: "202",
        experienceYears: 5,
        contact: {
          phone: "555-5678",
          email: "agarcia@gmail.com"
        },
        state: "activo"
      })
      .expect(201)
    });

  test("Debería dar error al crear un personal con datos inválidos", async () => {
    await request(app).post("/staff").send(firstStaff).expect(400);
  });

    test("Deberia dar error al hacer una petición a un ruta incorrecta", async () => {
      await request(app).post("/s").send(firstStaff).expect(501);
    });
  
  test("Deberia dar error al crear un personal con email inválido", async () => {
    await request(app)
      .post("/staff")
      .send({
        fullName: "Alejandro García",
        collegiateNumber: "67890",
        specialty: "cardiología",
        category: "médico/a residente",
        turno: "tarde",
        roomNumber: "202",
        experienceYears: 5,
        contact: {
          phone: "555-5678",
          email: "agarciagmail.com" // Email inválido
        },
        state: "activo"
      })
      .expect(400);
  });
});

