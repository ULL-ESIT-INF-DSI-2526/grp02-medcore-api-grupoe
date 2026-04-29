import { connect } from 'mongoose';

/**
 * Conexión a la base de datos MongoDB utilizando Mongoose. Se utiliza una URL de conexión local para una base de datos llamada "medcore-api". 
 * Si la conexión es exitosa, se muestra un mensaje en la consola. Si ocurre un error durante la conexión, se captura y se muestra el error en la consola.
 */
try {
  await connect(process.env.MONGODB_URL!);
  console.log('Connection to MongoDB server established');
} catch (error) {
  console.log('Unable to connect to MongoDB server', error);
}