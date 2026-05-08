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


describe("GET /records", () => {

  test("Debería obtener todos los registros sin filtros", async () => {
    const patient = await Patient.findOne();
    const staff = await Staff.findOne();

    await Records.create({
      patient: patient!._id,
      staff: staff!._id,
      type: "consulta ambulatoria",
      startDate: new Date(),
      reason: "Dolor de cabeza",
      medications: [],
      totalCost: 0,
      status: "abierto"
    });
    const response = await request(app).get("/records").expect(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("Debería filtrar registros por DNI del paciente", async () => {
    const patient = await Patient.findOne();
    const staff = await Staff.findOne();

    await Records.create({
      patient: patient!._id,
      staff: staff!._id,
      type: "consulta ambulatoria",
      startDate: new Date(),
      reason: "Dolor de cabeza",
      medications: [],
      totalCost: 0,
      status: "abierto"
    });

    const response = await request(app)
      .get("/records")
      .query({ patientDni: "12345678A" })
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0].patient.idNumber).toBe("12345678A");

  });

  test("Debería filtrar registros por rango de fechas y tipo", async () => {
    const patient = await Patient.findOne();
    const staff = await Staff.findOne();
    await Records.create({
      patient: patient!._id,
      staff: staff!._id,
      type: "consulta ambulatoria",
      startDate: new Date("2024-06-01"),
      reason: "Dolor de cabeza",
      medications: [],
      totalCost: 0,
      status: "abierto"
    });

    const response = await request(app)
      .get("/records")
      .query({
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        type: "consulta ambulatoria",
      })
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
    const recordDate = new Date(response.body[0].startDate);
    expect(recordDate >= new Date("2024-01-01")).toBe(true);
    expect(recordDate <= new Date("2024-12-31")).toBe(true);
    expect(response.body[0].type).toBe("consulta ambulatoria");
  });

  test("Debería devolver 404 si el paciente no existe al filtrar por DNI", async () => {
    const response = await request(app)
      .get("/records")
      .query({ patientDni: "99999999Z" })
      .expect(404);

    expect(response.body.error).toBe("Paciente no encontrado");
  });

  test("Debería devolver 404 si no se encuentran registros con los filtros aplicados", async () => {
    const response = await request(app)
      .get("/records")
      .query({
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        type: "ingreso hospitalario",
      })
      .expect(404);
      
    expect(response.body.error).toBe("Records not found");
  });

  test("Deberia devolver error 500 si hay un fallo en la base de datos", async () => {
    const findSpy = vi.spyOn(Records, 'find').mockRejectedValue(new Error('Fallo simulado en la BD'));

    await request(app).get("/records").expect(500);

    findSpy.mockRestore();
  });

  test("Deberia dar error al hacer una petición a un ruta incorrecta", async () => {
    await request(app).get("/r").expect(501); // Ruta incorrecta
  });
});

describe("GET /records/:id", () => {
  test("Debería obtener un registro por su ID", async () => {
    const patient = await Patient.findOne();
    const staff = await Staff.findOne();

    const record = await Records.create({
      patient: patient!._id,
      staff: staff!._id,
      type: "consulta ambulatoria",
      startDate: new Date(),
      reason: "Dolor de cabeza",
      medications: [],
      totalCost: 0,
      status: "abierto"
    });

    const response = await request(app)
      .get(`/records/${record._id}`)
      .expect(200);
    // Verificamos que los datos del registro sean correctos
    expect(response.body._id).toBe(record._id.toString());
    expect(response.body.staff.fullName).toBe("Dr. Juan Pérez");
  });

  test("Debería devolver 404 al buscar un ID que no existe", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .get(`/records/${nonExistentId}`)
      .expect(404);

    expect(response.body.error).toBe("Record not found");
  });

  test("Debería devolver error 500 si hay un fallo en la base de datos", async () => {
    const findByIdSpy = vi.spyOn(Records, 'findById').mockRejectedValue(new Error('Fallo simulado'));

    const dummyId = new mongoose.Types.ObjectId();
    await request(app).get(`/records/${dummyId}`).expect(500);

    findByIdSpy.mockRestore();
  });
});

describe("PATCH /records/:id", () => {
  test("Debería actualizar un registro existente", async () => {
    const patient = await Patient.findOne();
    const staff = await Staff.findOne();

    const record = await Records.create({
      patient: patient!._id,
      staff: staff!._id,
      type: "consulta ambulatoria",
      startDate: new Date(),
      reason: "Dolor de cabeza",
      medications: [],
      totalCost: 0,
      status: "abierto"
    });

    const response = await request(app)
      .patch(`/records/${record._id}`)
      .send({ reason: "Dolor de espalda" })
      .expect(200);

    expect(response.body.reason).toBe("Dolor de espalda");
  });

  test("Debería actualizar un registro existente con medicamentos nuevos", async () => {
    const patient = await Patient.findOne();
    const staff = await Staff.findOne();
    const validMed = await Medications.findOne({ nationalCode: "123456ABC" });

    const record = await Records.create({
      patient: patient!._id,
      staff: staff!._id,
      type: "consulta ambulatoria",
      startDate: new Date(),
      reason: "Dolor de cabeza",
      medications: [{
        medication: validMed!._id,
        quantity: 1,
        posology: "Tomar 1 comprimido cada 8 horas",
      }],
      totalCost: validMed!.unitPrice,
      status: "abierto"
    });

    const response = await request(app)
      .patch(`/records/${record._id}`)
      .send({
        medications: [
          {
            medication: "123456ABC",
            quantity: 1,
            posology: "Tomar 1 comprimido cada 8 horas",
          },
        ],
      })
      .expect(200);

    expect(response.body.medications.length).toBe(1);
    expect(response.body.totalCost).toBe(validMed!.unitPrice);
  });

  test("Debería revertir los cambios si la actualización falla por stock insuficiente", async () => {
    const patient = await Patient.findOne();
    const staff = await Staff.findOne();
    const validMed = await Medications.findOne({ nationalCode: "123456ABC" });
    
    const initialStock = validMed!.stock; 

    const record = await Records.create({
      patient: patient!._id,
      staff: staff!._id,
      type: "consulta ambulatoria",
      startDate: new Date(),
      reason: "Prueba de reversión",
      medications: [{
        medication: validMed!._id,
        quantity: 5,
        posology: "Tomar 1",
      }],
      totalCost: validMed!.unitPrice * 5,
      status: "abierto"
    });

    const response = await request(app)
      .patch(`/records/${record._id}`)
      .send({
        medications: [
          {
            medication: "123456ABC",
            quantity: 99999, // Forzamos el error por stock
            posology: "Prueba",
          },
        ],
      })
      .expect(400);

    expect(response.body.error).toBe("Stock insuficiente");

    // Verificar que el stock volvió a su estado inicial
    const medAfterReversion = await Medications.findById(validMed!._id);
    expect(medAfterReversion?.stock).toBe(initialStock);
  });

  test("Debería ignorar la restauración si el medicamento antiguo fue borrado", async () => {
    const patient = await Patient.findOne();
    const staff = await Staff.findOne();
    
    const tempMed = await Medications.create({
      commercialName: "Med Temporal",
      activeIngredient: "Temp",
      nationalCode: "TEMP123",
      pharmaceuticalForm: "comprimido",
      standardDose: 100,
      doseUnit: "mg",
      administrationRoute: "oral",
      stock: 50,
      unitPrice: 10,
      requiredPrescription: false,
      expirationDate: new Date("2030-01-01"),
      contraindications: []
    });

    const record = await Records.create({
      patient: patient!._id,
      staff: staff!._id,
      type: "consulta ambulatoria",
      startDate: new Date(),
      reason: "Prueba de referencias nulas",
      medications: [{
        medication: tempMed._id,
        quantity: 2,
        posology: "Tomar 1",
      }],
      totalCost: 20,
      status: "abierto"
    });

    // Se elimina de la base de datos el medicamento original
    await Medications.findByIdAndDelete(tempMed._id);

    // Mandamos un código inválido para forzar el fallo y la ejecución de la reversión de stock
    await request(app)
      .patch(`/records/${record._id}`)
      .send({
        medications: [
          {
            medication: "CODIGO_INEXISTENTE",
            quantity: 1,
            posology: "Error",
          },
        ],
      })
      .expect(404);
  });

  test("Debería devolver 404 al intentar actualizar un registro que no existe", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .patch(`/records/${nonExistentId}`)
      .send({ reason: "Dolor de espalda" })
      .expect(404);

    expect(response.body.error).toBe("Record not found");
  });

  test("Debería devolver error 500 si hay un fallo en la base de datos", async () => {
    const dummyId = new mongoose.Types.ObjectId();
    const findByIdSpy = vi.spyOn(Records, 'findById').mockRejectedValue(new Error('Fallo simulado'));

    await request(app)
      .patch(`/records/${dummyId}`)
      .send({ reason: "Fallo base de datos" })
      .expect(500);

    findByIdSpy.mockRestore();
  });
});