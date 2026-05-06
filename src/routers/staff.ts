import express from 'express';
import { Staff } from '../models/staff.js';

export const staffRouter = express.Router();


/**
 * Ruta POST para crear un nuevo miembro del personal médico. Recibe los datos en el cuerpo de la solicitud, crea un nuevo personal en la base de datos y devuelve el personal creado.
 * Maneja errores de validación y devuelve el código de estado adecuado.
 */
staffRouter.post('/staff', async (req, res) => {
  const personal = new Staff(req.body);

  try {
    await personal.save();
    res.status(201).send(personal);
  } catch (error) {
    res.status(400).send(error);
  }
});

/**
 * Ruta GET para obtener personal médico. Permite filtrar personal por nombre completo o especialidad a través de query parameters.
 * Si no se proporcionan filtros, devuelve todo el personal. Maneja errores de base de datos y devuelve el código de estado adecuado.
 */
staffRouter.get("/staff", async (req, res) => {
  const filter = req.query.fullName
    ? { fullName: req.query.fullName.toString() }
    : req.query.specialty
    ? { specialty: req.query.specialty.toString() }
    : {};

  try {
    const staff = await Staff.find(filter);
    if (staff.length !== 0) {
      res.send(staff);
    } else {
      res.status(404).send({
        error: "Staff not found",
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Ruta GET para obtener un miembro del personal médico por su ID. Recibe el ID del miembro como parámetro en la URL, busca el miembro en la base de datos y lo devuelve.
 * Si el miembro no existe, devuelve un error 404. Maneja errores de base de datos y devuelve el código de estado adecuado.
 */
staffRouter.get("/staff/:id", async (req, res) => {
  try {
    const personal = await Staff.findById(req.params.id);

    if (personal) {
      res.send(personal);
    } else {
      res.status(404).send({
        error: "Staff not found",
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Ruta PATCH para actualizar un personal utilizando filtros en query parameters. Permite actualizar un personal filtrando por nombre completo o especialidad a través de query parameters.
 * Si no se proporcionan filtros, devuelve un error 400. Si el personal no existe, devuelve un error 404. Maneja errores de base de datos y devuelve el código de estado adecuado.
 */
staffRouter.patch("/staff", async (req, res) => {
  if (!req.query.fullName && !req.query.specialty) {
    res.status(400).send({
      error: "A fullName or specialty must be provided",
    });
  } else {
    const allowedUpdates = ["fullName", "collegiateNumber", "specialty", "category", "shift", "roomNumber", "experienceYears", "contact", "status"];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) =>
      allowedUpdates.includes(update),
    );

    if (!isValidUpdate) {
      res.status(400).send({
        error: "Update is not allowed",
      });
    } else {
      try {
        const filter = req.query.fullName
          ? { fullName: req.query.fullName.toString() }
          : { specialty: req.query.specialty!.toString() };

        const personal = await Staff.findOneAndUpdate(
          filter,
          req.body,
          {
            returnDocument: "after",
            runValidators: true,
          },
        );

        if (personal) {
          res.send(personal);
        } else {
          res.status(404).send({
            error: "Staff not found",
          });
        }
      } catch (error) {
        res.status(500).send(error);
      }
    }
  }
});

/**
 * Ruta PATCH para actualizar un miembro del personal utilizando el ID como parámetro en la URL. Recibe el ID del miembro como parámetro en la URL, y los datos a actualizar en el cuerpo de la solicitud.
 * Busca el miembro en la base de datos, lo actualiza con los nuevos datos y devuelve el miembro actualizado.
 * Si el miembro no existe, devuelve un error 404. Maneja errores de base de datos y devuelve el código de estado adecuado.
 */
staffRouter.patch("/staff/:id", async (req, res) => {
  const allowedUpdates = ["fullName", "collegiateNumber", "specialty", "category", "shift", "roomNumber", "experienceYears", "contact", "status"];
  const actualUpdates = Object.keys(req.body);
  const isValidUpdate = actualUpdates.every((update) =>
    allowedUpdates.includes(update),
  );

  if (!isValidUpdate) {
    res.status(400).send({
      error: "Update is not allowed",
    });
  } else {
    try {
      const personal = await Staff.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          returnDocument: "after",
          runValidators: true,
        },
      );

      if (personal) {
        res.send(personal);
      } else {
        res.status(404).send({
          error: "Staff not found",
        });
      }
    } catch (error) {
      res.status(500).send(error);
    }
  }
});

/**
 * Ruta DELETE para eliminar un personal utilizando filtros en query parameters. Permite eliminar un personal filtrando por nombre completo o especialidad a través de query parameters.
 * Si no se proporcionan filtros, devuelve un error 400. Si el personal no existe, devuelve un error 404. Maneja errores de base de datos y devuelve el código de estado adecuado.
 */
staffRouter.delete("/staff", async (req, res) => {
  if (!req.query.fullName && !req.query.specialty) {
    res.status(400).send({
      error: "A fullName or specialty must be provided",
    });
  } else {
    try {
      const filter = req.query.fullName
        ? { fullName: req.query.fullName.toString() }
        : { specialty: req.query.specialty!.toString() };

      const personal = await Staff.findOne(filter);

      if (!personal) {
        res.status(404).send({
          error: "Staff not found",
        });
      } else {
        await Staff.findByIdAndDelete(personal._id);
        res.send(personal);
      }
    } catch (error) {
      res.status(500).send(error);
    }
  }
});