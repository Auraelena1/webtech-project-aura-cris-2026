/**
 * Server principal pentru aplicatia de monitorizare prezenta.
 * Tehnologii: Node.js, Express, Sequelize (ORM), Axios (External API).
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios'); // Pentru integrarea API-ului extern
const sequelize = require('./database');
const { EventGroup, Event, Attendance } = require('./models');

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json());

/**
 * Functie utilitara pentru generarea unui cod de acces aleatoriu.
 * @returns {string} Un cod format din 6 caractere alfanumerice.
 */
const generateAccessCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// --- RUTE API RESTFUL ---

/**
 * Ruta de test pentru a verifica disponibilitatea serverului.
 */
app.get('/', (req, res) => {
    res.send("API-ul de monitorizare prezenta este functional.");
});

/**
 * Creeaza un nou grup de evenimente.
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
 * Creeaza un eveniment nou in cadrul unui grup existent.
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
 * Actualizeaza statusul unui eveniment (OPEN/CLOSED).
 * @route PATCH /events/:id/status
 */
app.patch('/events/:id/status', async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);
        if (!event) return res.status(404).json({ message: "Evenimentul nu a fost gasit." });
        
        event.status = req.body.status;
        await event.save();
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Inregistreaza prezenta unui participant si preia date dintr-un serviciu extern.
 * RESPECTA CERINTA: "data from an external service".
 * @route POST /checkin
 */
app.post('/checkin', async (req, res) => {
    const { code, participantName } = req.body;

    try {
        // Cautare eveniment in baza de date (Persistence API / ORM)
        const event = await Event.findOne({ where: { accessCode: code } });

        if (!event) return res.status(404).json({ message: "Codul introdus este invalid." });
        if (event.status === 'CLOSED') return res.status(403).json({ message: "Acest eveniment este momentan inchis." });

        // Creare inregistrare prezenta
        const attendance = await Attendance.create({
            EventId: event.id,
            participantName: participantName
        });

        // --- INTEGRARE API EXTERN ---
        // Apelam un serviciu extern de sfaturi/mesaje motivationale pentru a confirma participarea intr-un mod interactiv
        let externalAdvice = "Succes la activitatile de azi!";
        try {
            const externalResponse = await axios.get('https://api.adviceslip.com/advice');
            externalAdvice = externalResponse.data.slip.advice;
        } catch (apiError) {
            console.error("Eroare la apelarea API-ului extern:", apiError.message);
        }

        res.status(201).json({ 
            message: `Prezenta confirmata pentru ${participantName}.`,
            advice: externalAdvice // Mesajul preluat din sursa externa
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Returneaza lista de participanti pentru un eveniment specific.
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

// --- PORNIRE SERVER ---

/**
 * Sincronizeaza modelele cu baza de date relationala si porneste ascultarea pe portul specificat.
 */
sequelize.sync({ force: false })
    .then(() => {
        console.log('Baza de date sincronizata (SQLite).');
        app.listen(PORT, () => {
            console.log(`Serverul REST ruleaza pe http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Eroare la pornirea bazei de date:', err);
    });