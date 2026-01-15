const { DataTypes } = require('sequelize');
const sequelize = require('./database');

/**
 * MODEL DEFINITIONS
 * These models represent our relational database schema.
 */

// 1. EventGroup Model - Represents a category or course (e.g., "Web Technologies")
const EventGroup = sequelize.define('EventGroup', {
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT }
});

// 2. Event Model - Represents a specific lab or lecture session
const Event = sequelize.define('Event', {
    name: { type: DataTypes.STRING, allowNull: false },
    startTime: { type: DataTypes.DATE, allowNull: false },
    duration: { type: DataTypes.INTEGER, allowNull: false }, // stored in minutes
    accessCode: { type: DataTypes.STRING, unique: true },
    status: { 
        type: DataTypes.ENUM('CLOSED', 'OPEN'), 
        defaultValue: 'CLOSED' 
    }
});

// 3. Attendance Model - Stores which student checked into which event
const Attendance = sequelize.define('Attendance', {
    participantName: { type: DataTypes.STRING, allowNull: false },
    checkInTime: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

/**
 * RELATIONSHIPS (Relational Logic)
 * Defining 1-to-Many associations between our tables.
 */

// A group can have multiple events (e.g., Lab 1, Lab 2, etc.)
EventGroup.hasMany(Event, { onDelete: 'CASCADE' });
Event.belongsTo(EventGroup);

// An event can have many students registered (attendance records)
Event.hasMany(Attendance, { onDelete: 'CASCADE' });
Attendance.belongsTo(Event);

module.exports = { EventGroup, Event, Attendance };