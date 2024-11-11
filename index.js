const express = require('express');
const dotenv = require('dotenv');
const { sequelize } = require('./src/models/');
const { registerRoutes } = require('./src/routes');

dotenv.config();

const connectDb = async function () {
  try {
    await sequelize.authenticate();
    console.log('Database using sequelize connected successfully!!');
  } catch (error) {
    console.log('error generated while connecting with db', error);
  }
};

connectDb();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

registerRoutes(app);

const PORT = process.env.PORT || 4700;
app.listen(PORT, () => {
  console.log(`server listening on port : ${PORT}`);
});
