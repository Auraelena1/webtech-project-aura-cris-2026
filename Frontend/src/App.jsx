import { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  Camera, Type, Download, Settings, Check, 
  AlertTriangle, User, GraduationCap, Clock, Sparkles 
} from 'lucide-react'
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
  const [loading, setLoading] = useState(false)
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
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/checkin`, { participantName: name, code: codeToSend });
      setMessage({ type: 'success', text: 'Attendance recorded!' });
      setAdvice(res.data.advice);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Check-in failed.' });
    } finally { setLoading(false); }
  }

  const createEvent = async () => {
    setLoading(true);
    try {
      try { await axios.post(`${API_URL}/groups`, { name: "WebTech Class" }); } catch (e) {}
      const res = await axios.post(`${API_URL}/groups/1/events`, { 
        name: "WebTech Session", startTime: new Date(), duration: 120 
      });
      const openRes = await axios.patch(`${API_URL}/events/${res.data.id}/status`, { status: 'OPEN' });
      setEventData(openRes.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Connection error.' });
    } finally { setLoading(false); }
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(attendanceList);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(workbook, `Report.xlsx`);
  }

  const theme = {
    bg: '#FBFBFC',
    card: '#FFFFFF',
    primary: '#D81B60',
    accent: '#FCE4EC',
    text: '#2D3436',
    muted: '#636E72',
    border: '#EDF2F7'
  }

  return (
    <div style={{ 
      minHeight: '100vh', width: '100%', backgroundColor: theme.bg, 
      color: theme.text, fontFamily: "'Quicksand', sans-serif",
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '10px', boxSizing: 'border-box'
    }}>
      
      {/* HEADER - Adaptabil */}
      <div style={{ 
        width: '100%', maxWidth: '1000px', display: 'flex', 
        justifyContent: 'space-between', alignItems: 'center', 
        marginBottom: '20px', flexWrap: 'wrap', gap: '10px' 
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GraduationCap color={theme.primary} /> Portal
          </h1>
        </div>
        <button 
          onClick={() => setRole(role === 'student' ? 'organizer' : 'student')}
          style={{ 
            backgroundColor: theme.accent, color: theme.primary, border: 'none',
            padding: '10px 15px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700'
          }}
        >
          {role === 'student' ? 'Admin' : 'Student'}
        </button>
      </div>

      {/* CONTAINER PRINCIPAL */}
      <main style={{ 
        width: '100%', maxWidth: '1000px', backgroundColor: theme.card, 
        borderRadius: '20px', padding: '20px', border: `1px solid ${theme.border}`,
        boxSizing: 'border-box', boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
      }}>
        
        {role === 'student' ? (
          <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Check-in</h2>
            <input 
              style={{ width: '100%', padding: '15px', borderRadius: '10px', border: `2px solid ${theme.border}`, boxSizing: 'border-box', marginBottom: '15px' }}
              value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Your Full Name"
            />
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button onClick={() => setActiveTab('scan')} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === 'scan' ? theme.primary : theme.accent, color: activeTab === 'scan' ? 'white' : theme.primary, fontWeight: '700' }}>Scan</button>
              <button onClick={() => setActiveTab('manual')} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === 'manual' ? theme.primary : theme.accent, color: activeTab === 'manual' ? 'white' : theme.primary, fontWeight: '700' }}>Code</button>
            </div>

            {activeTab === 'scan' && (
              <div style={{ width: '100%', borderRadius: '15px', overflow: 'hidden', backgroundColor: '#f8f9fa', minHeight: '250px' }}>
                {name.length > 2 ? <div id="reader"></div> : <p style={{ textAlign: 'center', padding: '20px' }}>Enter name first</p>}
              </div>
            )}

            {activeTab === 'manual' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input style={{ width: '100%', padding: '15px', borderRadius: '10px', border: `2px solid ${theme.border}`, textAlign: 'center', fontSize: '1.2rem', boxSizing: 'border-box' }} value={code} onChange={(e) => setCode(e.target.value)} placeholder="6-DIGIT CODE" />
                <button onClick={() => sendCheckIn(code)} style={{ backgroundColor: theme.primary, color: 'white', padding: '15px', borderRadius: '10px', border: 'none', fontWeight: '700' }}>Submit</button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            flexWrap: 'wrap', // AICI E CHEIA: se rup coloanele pe mobil
            gap: '30px' 
          }}>
            {/* Coloana QR */}
            <div style={{ flex: '1 1 300px', textAlign: 'center' }}>
              <h3>Session Control</h3>
              {!eventData ? (
                <button onClick={createEvent} style={{ backgroundColor: theme.primary, color: 'white', padding: '15px 30px', borderRadius: '10px', border: 'none', fontWeight: '700' }}>Start Session</button>
              ) : (
                <div style={{ padding: '20px' }}>
                  <div style={{ maxWidth: '250px', margin: '0 auto' }}>
                    <QRCodeSVG value={eventData.accessCode} size={250} style={{ width: '100%', height: 'auto' }} fgColor={theme.primary} />
                  </div>
                  <h4 style={{ fontSize: '2rem', color: theme.primary, margin: '15px 0' }}>{eventData.accessCode}</h4>
                </div>
              )}
            </div>

            {/* Coloana Lista */}
            {eventData && (
              <div style={{ flex: '1 1 300px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <h4>Students ({attendanceList.length})</h4>
                  <button onClick={exportToExcel} style={{ padding: '5px 10px', fontSize: '12px' }}>Export</button>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto', border: `1px solid ${theme.border}`, borderRadius: '10px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      {attendanceList.map((row, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${theme.border}` }}>
                          <td style={{ padding: '10px' }}>{row.participantName}</td>
                          <td style={{ padding: '10px', textAlign: 'right', fontSize: '12px' }}>{new Date(row.checkInTime).toLocaleTimeString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {message && (
          <div style={{ marginTop: '20px', padding: '15px', borderRadius: '10px', backgroundColor: message.type === 'success' ? '#f0fff4' : '#fff5f5', color: message.type === 'success' ? '#2f855a' : '#c53030', fontSize: '14px' }}>
            <strong>{message.text}</strong>
            {advice && <p style={{ fontSize: '12px', marginTop: '5px', fontStyle: 'italic' }}>{advice}</p>}
          </div>
        )}
      </main>

      <footer style={{ marginTop: '20px', color: theme.muted, fontSize: '12px' }}>
        Aura & Cristina • CSIE 2026
      </footer>
    </div>
  )
}

export default App