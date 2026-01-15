const { Sequelize } = require('sequelize');

/**
 * DATABASE CONFIGURATION
 * We are using Sequelize as our ORM to interact with a relational database.
 * For this project, SQLite is used as the storage engine because it's serverless 
 * and saves data into a local file, making it perfect for development and demos.
 */
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite', // The local file where our data lives
    logging: false // Disabled logging to keep the terminal clean during testing
});

module.exports = sequelize;