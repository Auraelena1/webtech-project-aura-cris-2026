import { useState, useEffect } from 'react'
import axios from 'axios'
import { Camera, Type, Download, Settings, Check, AlertTriangle, User, GraduationCap, Clock } from 'lucide-react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { QRCodeSVG } from 'qrcode.react'
import * as XLSX from 'xlsx'

function App() {
  const [role, setRole] = useState('student')
  const [activeTab, setActiveTab] = useState('scan')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [message, setMessage] = useState(null)
  const [eventData, setEventData] = useState(null)
  const [attendanceList, setAttendanceList] = useState([])
  const [advice, setAdvice] = useState('')

  const API_URL = 'https://webtech-project-aura-cris-2026.onrender.com';

  useEffect(() => {
    let scanner;
    if (role === 'student' && activeTab === 'scan' && name.trim().length > 2) {
      scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
      scanner.render((text) => { sendCheckIn(text); scanner.clear(); }, (err) => {});
    }
    return () => { if (scanner) scanner.clear().catch(() => {}); };
  }, [role, activeTab, name.length > 2]);

  useEffect(() => {
    let interval;
    if (role === 'organizer' && eventData) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`${API_URL}/events/${eventData.id}/attendance`);
          setAttendanceList(res.data);
        } catch (err) { console.error("Sync error"); }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [role, eventData]);

  const sendCheckIn = async (codeToSend) => {
    try {
      const res = await axios.post(`${API_URL}/checkin`, { participantName: name, code: codeToSend });
      setMessage({ type: 'success', text: 'Success!' });
      setAdvice(res.data.advice);
    } catch (err) {
      setMessage({ type: 'error', text: 'Error' });
    }
  }

  const createEvent = async () => {
    try {
      await axios.post(`${API_URL}/groups`, { name: "Class" });
      const res = await axios.post(`${API_URL}/groups/1/events`, { name: "Lab", startTime: new Date(), duration: 120 });
      const openRes = await axios.patch(`${API_URL}/events/${res.data.id}/status`, { status: 'OPEN' });
      setEventData(openRes.data);
    } catch (err) { setMessage({ type: 'error', text: 'Connection Error' }); }
  }

  const theme = { primary: '#D81B60', bg: '#FBFBFC', border: '#EDF2F7', text: '#2D3436' }

  return (
    <div style={{ 
      minHeight: '100vh', width: '100%', backgroundColor: theme.bg, 
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '1rem', boxSizing: 'border-box' // Folosim rem pentru spațiere fluidă
    }}>
      
      {/* Navigation - Fluid Width */}
      <div style={{ width: '100%', maxWidth: '60rem', display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}><GraduationCap color={theme.primary} /> Portal</h1>
        <button onClick={() => setRole(role === 'student' ? 'organizer' : 'student')} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer' }}>
          {role === 'student' ? 'Admin' : 'Student'}
        </button>
      </div>

      <main style={{ 
        width: '100%', maxWidth: '60rem', backgroundColor: 'white', 
        borderRadius: '1.5rem', padding: '2rem', border: `1px solid ${theme.border}`,
        boxSizing: 'border-box'
      }}>
        
        {role === 'student' ? (
          <div style={{ width: '100%', maxWidth: '25rem', margin: '0 auto' }}>
            <input 
              style={{ width: '100%', padding: '1rem', marginBottom: '1rem', borderRadius: '0.7rem', border: `2px solid ${theme.border}`, boxSizing: 'border-box' }}
              value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name"
            />
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <button onClick={() => setActiveTab('scan')} style={{ flex: 1, padding: '0.8rem', backgroundColor: activeTab === 'scan' ? theme.primary : '#eee' }}>Scan</button>
              <button onClick={() => setActiveTab('manual')} style={{ flex: 1, padding: '0.8rem', backgroundColor: activeTab === 'manual' ? theme.primary : '#eee' }}>Code</button>
            </div>
            {activeTab === 'scan' && <div id="reader" style={{ width: '100%' }}></div>}
            {activeTab === 'manual' && <input style={{ width: '100%', padding: '1rem', textAlign: 'center' }} value={code} onChange={(e) => setCode(e.target.value)} placeholder="000000" />}
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
            <div style={{ flex: '1 1 18rem', textAlign: 'center' }}>
              {!eventData ? <button onClick={createEvent}>Start Session</button> : (
                <div>
                  <QRCodeSVG value={eventData.accessCode} size={null} style={{ width: '100%', maxWidth: '15rem', height: 'auto' }} />
                  <h3 style={{ fontSize: '2rem' }}>{eventData.accessCode}</h3>
                </div>
              )}
            </div>
            {eventData && (
              <div style={{ flex: '1 1 18rem' }}>
                <div style={{ maxHeight: '20rem', overflowY: 'auto', border: '1px solid #eee' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      {attendanceList.map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '0.5rem' }}>{row.participantName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App