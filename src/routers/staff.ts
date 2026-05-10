import express from 'express';
import { Staff } from '../models/staff.js';
import { Records } from '../models/records.js';

export const staffRouter = express.Router();


/**
 * Ruta POST para crear un nuevo miembro del personal médico. Recibe los datos en el cuerpo de la solicitud, crea un nuevo personal en la base de datos y devuelve el personal creado.
 * Maneja errores de validación y devuelve el código de estado adecuado.
 */

/**
 * @swagger
 * /staff:
 *   post:
 *     summary: Crea un nuevo miembro del personal médico
 *     description: Recibe los datos en el cuerpo de la solicitud, crea un nuevo personal en la base de datos y devuelve el personal creado. Maneja errores de validación.
 *     tags:
 *       - Staff
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StaffCreate'
 *     responses:
 *       201:
 *         description: Personal médico creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Staff'
 *       400:
 *         description: Error de validación o datos incorrectos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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

/**
 * @swagger
 * /staff:
 *   get:
 *     summary: Obtiene la lista del personal médico
 *     description: Permite filtrar personal por nombre completo (fullName) o especialidad (specialty) a través de query parameters. Si no se proporcionan filtros, devuelve todo el personal.
 *     tags:
 *       - Staff
 *     parameters:
 *       - in: query
 *         name: fullName
 *         schema:
 *           type: string
 *         description: Filtrar por el nombre completo del personal
 *       - in: query
 *         name: specialty
 *         schema:
 *           type: string
 *         description: Filtrar por la especialidad médica
 *     responses:
 *       200:
 *         description: Lista de personal obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Staff'
 *       404:
 *         description: Personal no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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

/**
 * @swagger
 * /staff/{id}:
 *   get:
 *     summary: Obtiene un miembro del personal por su ID
 *     description: Recibe el ID del miembro como parámetro en la URL, busca el miembro en la base de datos y lo devuelve.
 *     tags:
 *       - Staff
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del miembro del personal
 *     responses:
 *       200:
 *         description: Miembro del personal encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Staff'
 *       404:
 *         description: Personal no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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

/**
 * @swagger
 * /staff:
 *   patch:
 *     summary: Actualiza un personal usando query parameters
 *     description: Permite actualizar un personal filtrando por nombre completo o especialidad. Se requiere al menos un parámetro de búsqueda. Valida que los campos a actualizar estén permitidos.
 *     tags:
 *       - Staff
 *     parameters:
 *       - in: query
 *         name: fullName
 *         schema:
 *           type: string
 *         description: Nombre completo del personal a actualizar
 *       - in: query
 *         name: specialty
 *         schema:
 *           type: string
 *         description: Especialidad del personal a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StaffUpdate'
 *     responses:
 *       200:
 *         description: Personal actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Staff'
 *       400:
 *         description: Bad request, faltan query parameters o se intentan actualizar campos no permitidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Personal no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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

/**
 * @swagger
 * /staff/{id}:
 *   patch:
 *     summary: Actualiza un miembro del personal por su ID
 *     description: Recibe el ID en la URL y los datos a actualizar en el cuerpo de la solicitud. Valida que los campos a actualizar estén permitidos.
 *     tags:
 *       - Staff
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del miembro del personal a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StaffUpdate'
 *     responses:
 *       200:
 *         description: Personal actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Staff'
 *       400:
 *         description: Bad request, se intentan actualizar campos no permitidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Personal no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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

/**
 * @swagger
 * /staff:
 *   delete:
 *     summary: Elimina un personal usando query parameters
 *     description: Permite eliminar un personal filtrando por nombre completo o especialidad. Se requiere al menos un parámetro de búsqueda.
 *     Para la logica de borrado, si el personal tiene registros médicos asociados (consultas o ingresos), no se eliminará y se devolverá un error 409 indicando que no se puede eliminar el personal porque tiene registros asociados. En este caso, se sugiere cambiar el estado del personal a inactivo en lugar de eliminarlo.
 *     tags:
 *       - Staff
 *     parameters:
 *       - in: query
 *         name: fullName
 *         schema:
 *           type: string
 *         description: Nombre completo del personal a eliminar
 *       - in: query
 *         name: specialty
 *         schema:
 *           type: string
 *         description: Especialidad del personal a eliminar
 *     responses:
 *       200:
 *         description: Personal eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Staff'
 *       400:
 *         description: Bad request, faltan query parameters requeridos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Personal no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
        // Lógica de boorado
        const isReferenced = await Records.exists({ staff: personal._id });
        if (isReferenced) {
          return res.status(409).send({ 
            message: 'Conflicto: No se puede eliminar el personal médico porque tiene registros (consultas/ingresos) asociados. Cambie su estado a inactivo.' 
          });
        }

        await Staff.findByIdAndDelete(personal._id);
        res.send(personal);
      }
    } catch (error) {
      res.status(500).send(error);
    }
  }
});

/**
 * Ruta DELETE para eliminar un personal utilizando el ID como parámetro en la URL. Recibe el ID del personal como parámetro en la URL, busca el personal en la base de datos y lo elimina.
 * Si el personal no existe, devuelve un error 404. Maneja errores de base de datos y devuelve el código de estado adecuado.
 */

/**
 * @swagger
 * /staff/{id}:
 *   delete:
 *     summary: Elimina un miembro del personal por su ID
 *     description: Recibe el ID del personal como parámetro en la URL, busca el personal en la base de datos y lo elimina.
 *     Para la logica de borrado, si el personal tiene registros médicos asociados (consultas o ingresos), no se eliminará y se devolverá un error 409 indicando que no se puede eliminar el personal porque tiene registros asociados. En este caso, se sugiere cambiar el estado del personal a inactivo.
 *     tags:
 *       - Staff
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del personal a eliminar
 *     responses:
 *       200:
 *         description: Personal eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Staff'
 *       404:
 *         description: Personal no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

staffRouter.delete("/staff/:id", async (req, res) => {
  try {
    const personal = await Staff.findById(req.params.id);

    if (!personal) {
      res.status(404).send({
        error: "Staff not found",
      });
    } else {
      // Lógica de borrado
      const isReferenced = await Records.exists({ staff: personal._id });
      if (isReferenced) {
        return res.status(409).send({ 
          message: 'Conflicto: No se puede eliminar el personal médico porque tiene registros (consultas/ingresos) asociados. Cambie su estado a inactivo.' 
        });
      }

      await Staff.findByIdAndDelete(personal._id);
      res.send(personal);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});