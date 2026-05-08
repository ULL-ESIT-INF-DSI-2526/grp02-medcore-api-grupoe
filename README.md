# Segundo trabajo en grupo - MedCore: API REST con Node/Express

- alu0101647111 - Lucía Hernández Marrero
- alu0101660011 - Abel Martín Meneses
- alu0101641379 - Mario Martín Ramón


[![CI Tests](https://github.com/ULL-ESIT-INF-DSI-2526/grp02-medcore-api-grupoe/actions/workflows/ci.yml/badge.svg)](https://github.com/ULL-ESIT-INF-DSI-2526/grp02-medcore-api-grupoe/actions/workflows/ci.yml)

[![Coverage Status](https://coveralls.io/repos/github/ULL-ESIT-INF-DSI-2526/grp02-medcore-api-grupoe/badge.svg?branch=main)](https://coveralls.io/github/ULL-ESIT-INF-DSI-2526/grp02-medcore-api-grupoe?branch=main)

## Modo de uso

### Para ejecutar la aplicación:

1. Ejecuta `npm install` para instalar las dependencias.
2. Ejecuta `npm start` para iniciar el servidor.
3. Asegurate de tener Mongodb corriendo en tu máquina local en el puerto 27017. De esta manera:

```
sudo /home/usuario/mongodb/bin/mongod --dbpath /home/usuario/mongodb-data/
```

### Para ejecutar los tests:

Para que todo funciones correctamente debes tener una base de datos de MongoDB corriendo en tu máquina local en el puerto 27017. La base de datos utilizada para los tests es `medcore-test`, por lo que no interferirá con la base de datos de desarrollo `medcore-dev`.

1. Ejecuta `npm test` para ejecutar los tests.
2. Ejecuta `npm run coverage` para ejecutar los tests y generar el reporte de cobertura.
