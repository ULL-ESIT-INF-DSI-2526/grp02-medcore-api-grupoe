import { describe, test, expect, beforeEach, afterAll, vi } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { Medications } from "../src/models/medications.js";
import mongoose from "mongoose";

const validMedication = {
  commercialName: "Ibuprofeno",
  activeIngredient: "IbuprofenoActivo",
  nationalCode: "123456ABC",
  pharmaceuticalForm: "comprimido",
  standardDose: 200,
  doseUnit: "mg",
  administrationRoute: "oral",
  stock: 100,
  unitPrice: 5.99,
  requiredPrescription: true,
  expirationDate: "2026-12-31",
  contraindications: ["Embarazo", "Lactancia"]
};

beforeEach(async () => {
    await Medications.deleteMany({});
    await new Medications(validMedication).save();
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("POST /medications", () => {
  test("Debería crear un nuevo medicamento con datos válidos", async () => {
    await request(app)
      .post("/medications")
      .send({
        commercialName: "Paracetamol",
        activeIngredient: "ParacetamolActivo",
        nationalCode: "654321CBA",
        pharmaceuticalForm: "cápsula",
        standardDose: 500,
        doseUnit: "mg",
        administrationRoute: "oral",
        stock: 200,
        unitPrice: 3.99,
        requiredPrescription: false,
        expirationDate: "2026-12-31",
        contraindications: ["Hipersensibilidad"]
      })
      .expect(201)
    });

  test("Debería fallar al crear un medicamento con datos inválidos", async () => {
    await request(app)
      .post("/medications")
      .send(validMedication)
      .expect(400);
  });

  test("Debería fallar al crear un medicamento con un código nacional duplicado", async () => {
    await request(app)
      .post("/medications")
      .send({
        commercialName: "Ibuprofeno Duplicado",
        activeIngredient: "IbuprofenoActivoDuplicado",
        nationalCode: "123456ABC", // Mismo código nacional que el medicamento válido
        pharmaceuticalForm: "comprimido",
        standardDose: 200,
        doseUnit: "mg",
        administrationRoute: "oral",
        stock: 100,
        unitPrice: 5.99,
        requiredPrescription: true,
        expirationDate: "2026-12-31",
        contraindications: ["Embarazo", "Lactancia"]
      })
      .expect(400);
  });

  test("Debería fallar al crear un medicamento con un precio negativo", async () => {
    await request(app)
      .post("/medications")
      .send({
        commercialName: "Medicamento con Precio Negativo",
        activeIngredient: "IngredienteActivo",
        nationalCode: "NEGATIVEPRICE123",
        pharmaceuticalForm: "comprimido",
        standardDose: 200,
        doseUnit: "mg",
        administrationRoute: "oral",
        stock: 100,
        unitPrice: -5.99, // Precio negativo
        requiredPrescription: true,
        expirationDate: "2026-12-31",
        contraindications: ["Embarazo", "Lactancia"]
      })
      .expect(400);
  });

  test("Debería fallar al crear un medicamento con una fecha de expiración en el pasado", async () => {
    await request(app)
      .post("/medications")
      .send({
        commercialName: "Medicamento Expirado",
        activeIngredient: "IngredienteActivo",
        nationalCode: "EXPIRED123",
        pharmaceuticalForm: "comprimido",
        standardDose: 200,
        doseUnit: "mg",
        administrationRoute: "oral",
        stock: 100,
        unitPrice: 5.99,
        requiredPrescription: true,
        expirationDate: "2020-01-01", // Fecha de expiración en el pasado
        contraindications: ["Embarazo", "Lactancia"]
      })
      .expect(400);
  });

  test("Debería fallar al crear un medicamento con una dosis estándar negativa", async () => {
    await request(app)
      .post("/medications")
      .send({
        commercialName: "Medicamento con Dosis Negativa",
        activeIngredient: "IngredienteActivo",
        nationalCode: "NEGATIVEDOSE123",
        pharmaceuticalForm: "comprimido",
        standardDose: -200, // Dosis estándar negativa
        doseUnit: "mg",
        administrationRoute: "oral",
        stock: 100,
        unitPrice: 5.99,
        requiredPrescription: true,
        expirationDate: "2026-12-31",
        contraindications: ["Embarazo", "Lactancia"]
      })
      .expect(400);
  });

  test("Debería fallar al crear un medicamento con una ruta de administración no válida", async () => {
    await request(app)
      .post("/medications")
      .send({
        commercialName: "Medicamento con Ruta No Válida",
        activeIngredient: "IngredienteActivo",
        nationalCode: "INVALIDROUTE123",
        pharmaceuticalForm: "comprimido",
        standardDose: 200,
        doseUnit: "mg",
        administrationRoute: "no válida", // Ruta de administración no válida
        stock: 100,
        unitPrice: 5.99,
        requiredPrescription: true,
        expirationDate: "2026-12-31",
        contraindications: ["Embarazo", "Lactancia"]
      })
      .expect(400);
  });
});

describe("GET /medications", () => {
  test("Debería obtener todos los medicamentos sin filtros", async () => {
    const response = await request(app)
      .get("/medications")
      .expect(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].commercialName).toBe("Ibuprofeno");
  });

  test("Debería filtrar medicamentos por nombre comercial", async () => {
    const response = await request(app)
      .get("/medications?commercialName=Ibuprofeno")
      .expect(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].commercialName).toBe("Ibuprofeno");
  });
  test("Debería filtrar medicamentos por principio activo", async () => {
    const response = await request(app)
      .get("/medications?activeIngredient=IbuprofenoActivo")
      .expect(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].activeIngredient).toBe("IbuprofenoActivo");
  });

  test("Debería filtrar medicamentos por código nacional", async () => {
    const response = await request(app)
      .get("/medications?nationalCode=123456ABC")
      .expect(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].nationalCode).toBe("123456ABC");
  });

  test("Deberia filtrar medicamentos por código nacional y nombre comercial", async () => {
    const response = await request(app)
      .get("/medications?nationalCode=123456ABC&commercialName=Ibuprofeno")
      .expect(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].nationalCode).toBe("123456ABC");
    expect(response.body[0].commercialName).toBe("Ibuprofeno");
  });

  test("Debería devolver 404 si no se encuentran medicamentos con los filtros", async () => {
    const response = await request(app)
      .get("/medications?commercialName=MedicamentoInexistente")
      .expect(404);
    expect(response.body.error).toBe('No se encontraron medicamentos');
  });

  test("Debería manejar errores de base de datos y devolver 500", async () => {
    const spy = vi.spyOn(Medications, 'find').mockRejectedValue(new Error('Database error'));
    const response = await request(app)
      .get("/medications")
      .expect(500);
    spy.mockRestore();
  });
});
describe("GET /medications/:id", () => {
  test("Debería obtener un medicamento por su ID", async () => {
    const medication = await Medications.findOne({ commercialName: "Ibuprofeno" });
    const response = await request(app)
      .get(`/medications/${medication!._id}`)
      .expect(200);
    expect(response.body.commercialName).toBe("Ibuprofeno");
  });

  test("Debería devolver 404 si el medicamento no existe", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .get(`/medications/${nonExistentId}`)
      .expect(404);
    expect(response.body.message).toBe('Medicamento no encontrado');
  });

  test("Debería manejar errores de base de datos y devolver 500", async () => {
    const medication = await Medications.findOne({ commercialName: "Ibuprofeno" });
    const spy = vi.spyOn(Medications, 'findById').mockRejectedValue(new Error('Database error'));
    const response = await request(app)
      .get(`/medications/${medication!._id}`)
      .expect(500);
    spy.mockRestore();
  });

  test("Error al obtener un medicamento con ruta inválida", async () => {
    const response = await request(app)
      .get("/medications/invalid-id")
      .expect(500);
  });
});

describe("PATCH /medications", () => {
    test("Debería actualizar un medicamento por código nacional", async () => {
        const response = await request(app)
        .patch("/medications?nationalCode=123456ABC")
        .send({ stock: 150 })
        .expect(200);
        expect(response.body.stock).toBe(150);
    });

    test("Debería actualizar un medicamento por nombre comercial", async () => {
        const response = await request(app)
        .patch("/medications?commercialName=Ibuprofeno")
        .send({ stock: 120 })
        .expect(200);
        expect(response.body.stock).toBe(120);
    });
    test("Debería actualizar un medicamento por principio activo", async () => {
        const response = await request(app)
        .patch("/medications?activeIngredient=IbuprofenoActivo")
        .send({ stock: 130 })
        .expect(200);
        expect(response.body.stock).toBe(130);
    });

    test("Deberiía actualizar un medicamento por código nacional y nombre comercial", async () => {
        const response = await request(app)
        .patch("/medications?nationalCode=123456ABC&commercialName=Ibuprofeno")
        .send({ stock: 140 })
        .expect(200);
        expect(response.body.stock).toBe(140);
    });

    test("Debería devolver 404 si el medicamento no existe", async () => {
        const response = await request(app)
        .patch("/medications?nationalCode=NONEXISTENT123")
        .send({ stock: 150 })
        .expect(404);
        expect(response.body.message).toBe('Medicamento no encontrado');
    });
    
    test("Debería manejar errores de base de datos y devolver 500", async () => {
        const spy = vi.spyOn(Medications, 'findOneAndUpdate').mockRejectedValue(new Error('Database error'));
        const response = await request(app)
        .patch("/medications?nationalCode=123456ABC")
        .send({ stock: 150 })
        .expect(500);
        spy.mockRestore();
    });

    test("Debería devolver 400 si no se proporcionan filtros", async () => {
        const response = await request(app)
        .patch("/medications")
        .send({ stock: 150 })
        .expect(400);
        expect(response.body.message).toBe('Se requiere nationalCode o commercialName o activeIngredient para actualizar');
    });
});

describe("PATCH /medications/:id", () => {
    test("Debería actualizar un medicamento por su ID", async () => {
        const medication = await Medications.findOne({ commercialName: "Ibuprofeno" });
        const response = await request(app)
        .patch(`/medications/${medication!._id}`)
        .send({ stock: 160 })
        .expect(200);
        expect(response.body.stock).toBe(160);
    });

    test("Debería devolver 404 si el medicamento no existe", async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const response = await request(app)
        .patch(`/medications/${nonExistentId}`)
        .send({ stock: 150 })
        .expect(404);
        expect(response.body.message).toBe('Medicamento no encontrado');
    });

    test("Debería manejar errores de base de datos y devolver 500", async () => {
        const medication = await Medications.findOne({ commercialName: "Ibuprofeno" });
        const spy = vi.spyOn(Medications, 'findByIdAndUpdate').mockRejectedValue(new Error('Database error'));
        const response = await request(app)
        .patch(`/medications/${medication!._id}`)
        .send({ stock: 150 })
        .expect(500);
        spy.mockRestore();
    });
});

describe("DELETE /medications", () => {
    test("Debería eliminar un medicamento por código nacional", async () => {
        const response = await request(app)
        .delete("/medications?nationalCode=123456ABC")
        .expect(200);
        expect(response.body.nationalCode).toBe("123456ABC");
    });

    test("Debería eliminar un medicamento por nombre comercial", async () => {
        const response = await request(app)
        .delete("/medications?commercialName=Ibuprofeno")
        .expect(200);
        expect(response.body.commercialName).toBe("Ibuprofeno");
    });
    test("Debería eliminar un medicamento por principio activo", async () => {
        const response = await request(app)
        .delete("/medications?activeIngredient=IbuprofenoActivo")
        .expect(200);
        expect(response.body.activeIngredient).toBe("IbuprofenoActivo");
    });

    test("Debería eliminar un medicamento por código nacional y nombre comercial", async () => {
        const response = await request(app)
        .delete("/medications?nationalCode=123456ABC&commercialName=Ibuprofeno")
        .expect(200);
        expect(response.body.nationalCode).toBe("123456ABC");
        expect(response.body.commercialName).toBe("Ibuprofeno");
    });

    test("Debería devolver 404 si el medicamento no existe", async () => {
        const response = await request(app)
        .delete("/medications?nationalCode=NONEXISTENT123")
        .expect(404);
        expect(response.body.message).toBe('Medicamento no encontrado');
    });

    test("Debería manejar errores de base de datos y devolver 500", async () => {
        const spy = vi.spyOn(Medications, 'findOne').mockRejectedValue(new Error('Database error'));
        const response = await request(app)
        .delete("/medications?nationalCode=123456ABC")
        .expect(500);
        spy.mockRestore();
    });

    test("Debería devolver 400 si no se proporcionan filtros", async () => {
        const response = await request(app)
        .delete("/medications")
        .expect(400);
        expect(response.body.message).toBe('Se requiere nationalCode o commercialName o activeIngredient para eliminar');
    });
});

describe("DELETE /medications/:id", () => {
    test("Debería eliminar un medicamento por su ID", async () => {
        const medication = await Medications.findOne({ commercialName: "Ibuprofeno" });
        const response = await request(app)
        .delete(`/medications/${medication!._id}`)
        .expect(200);
        expect(response.body.commercialName).toBe("Ibuprofeno");
    });

    test("Debería devolver 404 si el medicamento no existe", async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const response = await request(app)
        .delete(`/medications/${nonExistentId}`)
        .expect(404);
        expect(response.body.message).toBe('Medicamento no encontrado');
    });

    test("Debería manejar errores de base de datos y devolver 500", async () => {
        const medication = await Medications.findOne({ commercialName: "Ibuprofeno" });
        const spy = vi.spyOn(Medications, 'findByIdAndDelete').mockRejectedValue(new Error('Database error'));
        const response = await request(app)
        .delete(`/medications/${medication!._id}`)
        .expect(500);
        spy.mockRestore();
    });
});