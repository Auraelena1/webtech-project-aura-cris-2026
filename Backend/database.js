const { Sequelize } = require('sequelize');

// Creăm o instanță de Sequelize care va salva datele într-un fișier local
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite', // Aici se va crea fișierul bazei de date
    logging: false // Ca să nu ne umple terminalul cu log-uri SQL
});

module.exports = sequelize;