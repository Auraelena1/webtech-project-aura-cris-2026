const { DataTypes } = require('sequelize');
const sequelize = require('./database');

// 1. Grupul de evenimente
const EventGroup = sequelize.define('EventGroup', {
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT }
});

// 2. Evenimentul individual
const Event = sequelize.define('Event', {
    name: { type: DataTypes.STRING, allowNull: false },
    startTime: { type: DataTypes.DATE, allowNull: false },
    duration: { type: DataTypes.INTEGER, allowNull: false }, // în minute
    accessCode: { type: DataTypes.STRING, unique: true },
    status: { 
        type: DataTypes.ENUM('CLOSED', 'OPEN'), 
        defaultValue: 'CLOSED' 
    }
});

// 3. Prezența
const Attendance = sequelize.define('Attendance', {
    participantName: { type: DataTypes.STRING, allowNull: false },
    checkInTime: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

// DEFINIREA RELAȚIILOR (Legăturile între ele)
EventGroup.hasMany(Event, { onDelete: 'CASCADE' });
Event.belongsTo(EventGroup);

Event.hasMany(Attendance, { onDelete: 'CASCADE' });
Attendance.belongsTo(Event);

module.exports = { EventGroup, Event, Attendance };