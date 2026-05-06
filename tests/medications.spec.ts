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