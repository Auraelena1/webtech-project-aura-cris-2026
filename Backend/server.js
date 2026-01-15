/**
 * MAIN SERVER ENTRY POINT
 * Implementation of the RESTful API for the Attendance Monitoring System.
 * Tech Stack: Node.js, Express, Sequelize (ORM), and Axios for External API calls.
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const sequelize = require('./database');
const { EventGroup, Event, Attendance } = require('./models');

const app = express();
// Port configuration: process.env.PORT is required for deployment on Render
const PORT = process.env.PORT || 5001;

// Middlewares for handling cross-origin requests and JSON parsing
app.use(cors());
app.use(express.json());

/**
 * Utility function to generate a unique 6-character access code for students.
 * @returns {string} Random alphanumeric code.
 */
const generateAccessCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// --- RESTful API ROUTES ---

/**
 * Basic health check route.
 */
app.get('/', (req, res) => {
    res.send("Attendance Monitoring API is live and running.");
});

/**
 * Creates a new event group (e.g., a specific class or semester).
 * @route POST /groups
 */
app.post('/groups', async (req, res) => {
    try {
        const group = await EventGroup.create(req.body);
        res.status(201).json(group);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * Creates a new session/event for a specific group.
 * @route POST /groups/:groupId/events
 */
app.post('/groups/:groupId/events', async (req, res) => {
    try {
        const event = await Event.create({
            ...req.body,
            EventGroupId: req.params.groupId,
            accessCode: generateAccessCode(),
            status: 'CLOSED'
        });
        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * Updates the session status (Open for scan / Closed).
 * @route PATCH /events/:id/status
 */
app.patch('/events/:id/status', async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found." });
        
        event.status = req.body.status;
        await event.save();
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * CORE LOGIC: Registers student attendance.
 * Requirement Check: This route integrates data from an EXTERNAL SERVICE.
 * @route POST /checkin
 */
app.post('/checkin', async (req, res) => {
    const { code, participantName } = req.body;

    try {
        // Step 1: Find the event associated with the provided access code (Persistence API)
        const event = await Event.findOne({ where: { accessCode: code } });

        if (!event) return res.status(404).json({ message: "Invalid access code." });
        if (event.status === 'CLOSED') return res.status(403).json({ message: "This session is currently closed." });

        // Step 2: Create the attendance record in our database
        await Attendance.create({
            EventId: event.id,
            participantName: participantName
        });

        // Step 3: EXTERNAL API INTEGRATION
        // We fetch a "Daily Advice" to show to the student upon successful registration.
        let externalAdvice = "Success with your studies today!";
        try {
            // Fulfilling the requirement to access data from an external service
            const externalResponse = await axios.get('https://api.adviceslip.com/advice');
            externalAdvice = externalResponse.data.slip.advice;
        } catch (apiError) {
            console.log("External service unreachable, using default message.");
        }

        res.status(201).json({ 
            message: `Check-in successful for ${participantName}!`,
            advice: externalAdvice 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Retrieves the list of participants for a specific session.
 * @route GET /events/:id/attendance
 */
app.get('/events/:id/attendance', async (req, res) => {
    try {
        const list = await Attendance.findAll({ 
            where: { EventId: req.params.id },
            order: [['checkInTime', 'DESC']]
        });
        res.json(list);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- SERVER INITIALIZATION ---

/**
 * Syncs models with the database and starts the express server.
 */
sequelize.sync({ force: false })
    .then(() => {
        console.log('Database synced successfully.');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Database sync failed:', err);
    });