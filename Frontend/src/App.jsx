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
      padding: '20px', boxSizing: 'border-box'
    }}>
      
      {/* HEADER */}
      <div style={{ 
        width: '100%', maxWidth: '1000px', display: 'flex', 
        justifyContent: 'space-between', alignItems: 'center', 
        marginBottom: '20px', flexWrap: 'wrap', gap: '10px' 
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GraduationCap color={theme.primary} /> Portal
          </h1>
          <p style={{ margin: 0, fontSize: '12px', color: theme.muted }}>Web Tech • 2026</p>
        </div>
        <button 
          onClick={() => setRole(role === 'student' ? 'organizer' : 'student')}
          style={{ 
            backgroundColor: theme.accent, color: theme.primary, border: 'none',
            padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700'
          }}
        >
          {role === 'student' ? 'Admin Access' : 'Student Mode'}
        </button>
      </div>

      {/* MAIN CONTAINER */}
      <main style={{ 
        width: '100%', maxWidth: '1000px', backgroundColor: theme.card, 
        borderRadius: '24px', padding: '30px', border: `1px solid ${theme.border}`,
        boxSizing: 'border-box', boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
      }}>
        
        {role === 'student' ? (
          <div style={{ width: '100%', maxWidth: '450px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '30px' }}>Check-in</h2>
            <input 
              style={{ width: '100%', padding: '15px', borderRadius: '12px', border: `2px solid ${theme.border}`, boxSizing: 'border-box', marginBottom: '20px', fontSize: '16px' }}
              value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Your Full Name"
            />
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button onClick={() => setActiveTab('scan')} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === 'scan' ? theme.primary : theme.accent, color: activeTab === 'scan' ? 'white' : theme.primary, fontWeight: '700' }}>Scan</button>
              <button onClick={() => setActiveTab('manual')} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === 'manual' ? theme.primary : theme.accent, color: activeTab === 'manual' ? 'white' : theme.primary, fontWeight: '700' }}>Code</button>
            </div>

            {activeTab === 'scan' && (
              <div style={{ width: '100%', borderRadius: '20px', overflow: 'hidden', backgroundColor: '#f8f9fa', minHeight: '300px' }}>
                {name.length > 2 ? <div id="reader"></div> : <p style={{ textAlign: 'center', padding: '40px', color: theme.muted }}>Enter name to unlock camera</p>}
              </div>
            )}

            {activeTab === 'manual' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input style={{ width: '100%', padding: '15px', borderRadius: '12px', border: `2px solid ${theme.border}`, textAlign: 'center', fontSize: '1.5rem', letterSpacing: '4px' }} value={code} onChange={(e) => setCode(e.target.value)} placeholder="000000" />
                <button onClick={() => sendCheckIn(code)} style={{ backgroundColor: theme.primary, color: 'white', padding: '15px', borderRadius: '12px', border: 'none', fontWeight: '700' }}>Submit Presence</button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            flexWrap: 'wrap', 
            gap: '40px' 
          }}>
            {/* Control Panel */}
            <div style={{ flex: '1 1 350px', minWidth: '0' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Session Control</h2>
              {!eventData ? (
                <div style={{ padding: '40px', backgroundColor: theme.bg, borderRadius: '20px', border: `2px dashed ${theme.border}`, textAlign: 'center' }}>
                  <button onClick={createEvent} style={{ backgroundColor: theme.primary, color: 'white', padding: '15px 30px', borderRadius: '12px', border: 'none', fontWeight: '700' }}>Generate QR Code</button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', backgroundColor: theme.bg, borderRadius: '20px' }}>
                  <QRCodeSVG value={eventData.accessCode} size={250} style={{ width: '100%', height: 'auto', maxWidth: '250px' }} fgColor={theme.primary} />
                  <div style={{ marginTop: '20px' }}>
                    <p style={{ margin: 0, fontSize: '12px', color: theme.muted }}>ACCESS CODE</p>
                    <h3 style={{ fontSize: '2.5rem', margin: '5px 0', color: theme.primary, letterSpacing: '5px' }}>{eventData.accessCode}</h3>
                  </div>
                </div>
              )}
            </div>

            {/* Attendance List */}
            {eventData && (
              <div style={{ flex: '1.5 1 350px', minWidth: '0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0 }}>Registered Students ({attendanceList.length})</h3>
                  <button onClick={exportToExcel} style={{ backgroundColor: theme.text, color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', fontSize: '12px' }}><Download size={14} /></button>
                </div>
                <div style={{ maxHeight: '400px', overflowY: 'auto', border: `1px solid ${theme.border}`, borderRadius: '15px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: theme.bg }}>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '15px' }}>Student</th>
                        <th style={{ textAlign: 'right', padding: '15px' }}>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceList.length === 0 ? (
                        <tr><td colSpan="2" style={{ padding: '40px', textAlign: 'center', color: theme.muted }}>Waiting for entries...</td></tr>
                      ) : (
                        attendanceList.map((row, i) => (
                          <tr key={i} style={{ borderTop: `1px solid ${theme.border}` }}>
                            <td style={{ padding: '15px', fontWeight: '600' }}>{row.participantName}</td>
                            <td style={{ padding: '15px', textAlign: 'right', color: theme.muted }}>{new Date(row.checkInTime).toLocaleTimeString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {message && (
          <div style={{ marginTop: '30px', padding: '20px', borderRadius: '15px', backgroundColor: message.type === 'success' ? '#F0FFF4' : '#FFF5F5', color: message.type === 'success' ? '#2F855A' : '#C53030', border: `1px solid ${message.type === 'success' ? '#C6F6D5' : '#FED7D7'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}>
              {message.type === 'success' ? <Check size={20}/> : <AlertTriangle size={20}/>} {message.text}
            </div>
            {advice && <p style={{ margin: '10px 0 0', fontSize: '14px', fontStyle: 'italic', color: '#4A5568' }}>Quote of the day: "{advice}"</p>}
          </div>
        )}
      </main>

      <footer style={{ marginTop: '40px', textAlign: 'center', color: theme.muted, fontSize: '12px' }}>
        Designed by Aura & Cristina • CSIE 2026
      </footer>
    </div>
  )
}

export default App