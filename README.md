
# Attendance Monitoring Web App

Project for Web Technologies — Developed by **Dragomir Aura** and **Cristina Lapusneanu**

A web application designed for managing student attendance using QR codes and manual entry, featuring real-time synchronization and data export capabilities.

---

## Developers
- **Dragomir Aura** and **Cristina Lapusneanu** - Faculty of Cybernetics, Statistics and Economic Informatics (CSIE)

## Deployment Links
- **Frontend UI**: [https://aura-attendance.onrender.com/](https://aura-attendance.onrender.com/)
- **Backend API**: [https://webtech-project-aura-cris-2026.onrender.com/](https://webtech-project-aura-cris-2026.onrender.com/)

---

## Description
The application facilitates the attendance process in an academic environment:
* **Organizers** can initialize sessions, generate unique access codes, and monitor the student list in real-time.
* **Students** can register their presence by scanning a QR code or entering a 6-character code.
* **Data Persistence**: All records are stored in a relational database using Sequelize ORM.
* **External Integration**: The system connects to an external REST API to fetch dynamic data (**Advice API**) upon successful registration to fulfill project requirements.

---

## Technologies Used

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework for the REST API
- **Sequelize ORM** - For relational database management and modeling
- **SQLite** - Relational database for local and production data persistence
- **Axios** - For external API communication

### Frontend
- **React** - Component-based UI library
- **Vite** - Build tool for development and production
- **Lucide React** - Icon library for the user interface
- **HTML5-QRCode** - For browser-based camera scanning functionality
- **XLSX** - For generating and downloading attendance reports in Excel format

---

## How to run the project locally?

### Prerequisites
- Node.js installed ([https://nodejs.org](https://nodejs.org))

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone [https://github.com/Auraelena1/webtech-project-aura-cris-2026.git](https://github.com/Auraelena1/webtech-project-aura-cris-2026.git)
   cd webtech-project-aura-cris-2026

```

2. **Setup and run the Backend**
```bash
cd Backend
npm install
node server.js

```


*The server starts on `http://localhost:5001*`
3. **Setup and run the Frontend (in a new terminal)**
```bash
cd Frontend
npm install
npm run dev

```


*The frontend starts on `http://localhost:5173*`

---

## API Endpoints and Testing

To test the API independently of the UI, you can use Postman or any HTTP client.

### 1. Health Check

`GET https://webtech-project-aura-cris-2026.onrender.com/`

> **Response:** "Attendance Monitoring API is live and running."

### 2. Create Event Group

`POST /groups`

**Body (JSON):**

```json
{
  "name": "Web Technologies Class 2026"
}

```

### 3. Register Attendance

`POST /checkin`

**Body (JSON):**

```json
{
  "participantName": "Aura Dragomir",
  "code": "XYZ123"
}

```

### 4. Fetch Attendance List

`GET /events/:id/attendance`

> **Description:** Returns the list of all students registered for a specific session ID.

---

## Roles and Workflow

### Organizer Mode

1. Create a new academic session.
2. Display the generated QR code to students.
3. Monitor the participant list as students check in.
4. Export the final attendance list as an Excel file (`.xlsx`).

### Student Mode

1. Provide full name for identification.
2. Use the device camera to scan the session QR code.
3. Receive immediate confirmation and a message retrieved from the external API.

---

## Project Structure

### `Backend/` - Server-side logic and database

* `server.js`: Main entry point, REST routes, and external API integration logic.
* `models.js`: Database schema definitions (EventGroup, Event, Attendance).
* `database.js`: Sequelize and SQLite connection setup.

### `Frontend/` - React client application

* `src/App.jsx`: Main UI logic, state management, and scanner integration.
* `src/main.jsx`: React application entry point.
