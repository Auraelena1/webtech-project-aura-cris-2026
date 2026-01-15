
# Attendance Monitoring Web App

Project for Web Technologies — Developed by Dragomir Aura and Cristina Lapusneanu

A web application designed for managing student attendance using QR codes and manual entry, featuring real-time synchronization and data export capabilities.

## Developer
- Dragomir Aura and Cristina Lapusneanu - Faculty of Cybernetics, Statistics and Economic Informatics (CSIE)

## Deployment Links
- **Frontend UI**: https://aura-attendance.onrender.com/
- **Backend API**: https://webtech-project-aura-cris-2026.onrender.com/

## Description
The application facilitates the attendance process in an academic environment:
- **Organizers** can initialize sessions, generate unique access codes, and monitor the student list in real-time.
- **Students** can register their presence by scanning a QR code or entering a 6-character code.
- **Data Persistence**: All records are stored in a relational database using Sequelize ORM.
- **External Integration**: The system connects to an external REST API to fetch dynamic data (Advice API) upon successful registration to fulfill project requirements.

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

## How to run the project locally?

### Prerequisites
- Node.js (https://nodejs.org)

### Setup Steps

1. **Clone the repository**
```bash
git clone [https://github.com/Auraelena1/webtech-project-aura-cris-2026.git](https://github.com/Auraelena1/webtech-project-aura-cris-2026.git)
cd webtech-project-aura-cris-2026
