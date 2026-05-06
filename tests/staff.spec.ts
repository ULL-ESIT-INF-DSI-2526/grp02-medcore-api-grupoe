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

describe("GET /staff", () => {
  test("Deberia obtener la lista de personal correctamente", async () => {
    const response = await request(app).get("/staff").expect(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].fullName).toBe(firstStaff.fullName);
  });

  test("Deberia filtrar personal por nombre completo", async () => {
    const response = await request(app).get("/staff?fullName=Dr. Juan Pérez").expect(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].fullName).toBe(firstStaff.fullName);
  });

  test("Deberia devolver 404 si no se encuentra personal con el filtro", async () => {
    await request(app).get("/staff?fullName=NoExiste").expect(404);
  });

  test("Deberia filtrar personal por especialidad", async () => {
    const response = await request(app).get("/staff?specialty=medicina general").expect(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].specialty).toBe(firstStaff.specialty);
  });

  test("Deberia devolver error 500 si hay un fallo en la base de datos", async () => {
    const findSpy = vi.spyOn(Staff, 'find').mockRejectedValue(new Error('Fallo simulado en la BD'));

    await request(app).get("/staff").expect(500);

    findSpy.mockRestore();
  });

  test("Deberia dar error al hacer una petición a un ruta incorrecta", async () => {
    await request(app).get("/p").expect(501); // Ruta incorrecta
  });
});


describe("GET /staff/:id", () => {
  test("Deberia obtener un miembro del personal por su ID correctamente", async () => {
    const personal = await Staff.findOne();
    const response = await request(app).get(`/staff/${personal!._id}`).expect(200);
    expect(response.body.fullName).toBe(firstStaff.fullName);
  });

  test("Deberia devolver error 404 si el miembro del personal no existe", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    await request(app).get(`/staff/${nonExistentId}`).expect(404);
  });

  test("Deberia devolver error 500 si hay un fallo en la base de datos", async () => {
    const findByIdSpy = vi.spyOn(Staff, 'findById').mockRejectedValue(new Error('Fallo simulado en la BD'));

    const dummyId = new mongoose.Types.ObjectId();
    await request(app).get(`/staff/${dummyId}`).expect(500);

    findByIdSpy.mockRestore();
  });

  test("Deberia dar error al hacer una petición a un ruta incorrecta", async () => {
    const personal = await Staff.findOne();
    await request(app).get(`/s/${personal!._id}`).expect(501); // Ruta incorrecta
  });
});
