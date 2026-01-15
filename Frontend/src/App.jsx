import { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  Camera, Type, Download, Settings, Check, 
  AlertTriangle, User, GraduationCap, Clock, Sparkles 
} from 'lucide-react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { QRCodeSVG } from 'qrcode.react'
import * as XLSX from 'xlsx'

/**
 * Attendance Management Application - Web Technologies Project 2026
 * Developed by: Dragomir Aura
 */
function App() {
  const [role, setRole] = useState('student')
  const [activeTab, setActiveTab] = useState('scan')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [message, setMessage] = useState(null)
  const [eventData, setEventData] = useState(null)
  const [attendanceList, setAttendanceList] = useState([])
  const [loading, setLoading] = useState(false)
  const [advice, setAdvice] = useState('') // Stocăm sfatul de la API-ul extern

  const API_URL = 'https://webtech-project-aura-cris-2026.onrender.com';

  // Logic for QR Scanner initialization
  useEffect(() => {
    let scanner;
    if (role === 'student' && activeTab === 'scan' && name.trim().length > 2) {
      scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
      scanner.render((text) => { sendCheckIn(text); scanner.clear(); }, (err) => {});
    }
    return () => { if (scanner) scanner.clear().catch(() => {}); };
  }, [role, activeTab, name.length > 2]);

  // Real-time updates for the organizer (polling every 3 seconds)
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
      const res = await axios.post(`${API_URL}/checkin`, { 
        participantName: name, 
        code: codeToSend 
      });
      setMessage({ type: 'success', text: 'Attendance recorded successfully!' });
      setAdvice(res.data.advice); // Salvăm sfatul primit din API-ul extern
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Check-in failed.' });
    } finally { setLoading(false); }
  }

  const createEvent = async () => {
    setLoading(true);
    try {
      try { await axios.post(`${API_URL}/groups`, { name: "WebTech Class" }); } catch (e) {}
      const res = await axios.post(`${API_URL}/groups/1/events`, { 
        name: "Web Technologies Lab Session", 
        startTime: new Date(), 
        duration: 120 
      });
      const openRes = await axios.patch(`${API_URL}/events/${res.data.id}/status`, { status: 'OPEN' });
      setEventData(openRes.data);
      setMessage({ type: 'success', text: 'Session is now live!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Server connection error.' });
    } finally { setLoading(false); }
  }

  const exportToExcel = () => {
    const dataToExport = attendanceList.map(item => ({
      Student: item.participantName,
      Time: new Date(item.checkInTime).toLocaleTimeString(),
      Date: new Date(item.checkInTime).toLocaleDateString()
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(workbook, `Attendance_Report_${new Date().toLocaleDateString()}.xlsx`);
  }

  const theme = {
    bg: '#FBFBFC',
    card: '#FFFFFF',
    primary: '#D81B60', // Deep rose
    accent: '#FCE4EC',
    text: '#2D3436',
    muted: '#636E72',
    border: '#EDF2F7'
  }

  return (
    <div style={{ 
      minHeight: '100vh', width: '100vw', backgroundColor: theme.bg, color: theme.text,
      fontFamily: "'Quicksand', sans-serif", display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: '20px', boxSizing: 'border-box'
    }}>
      
      {/* PROFESSIONAL HEADER */}
      <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GraduationCap color={theme.primary} /> Attendance Portal
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: theme.muted }}>Web Technologies • Academic Session 2026</p>
        </div>
        <button 
          onClick={() => setRole(role === 'student' ? 'organizer' : 'student')}
          style={{ 
            backgroundColor: theme.accent, color: theme.primary, border: 'none',
            padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          {role === 'student' ? <Settings size={16}/> : <User size={16}/>}
          {role === 'student' ? 'Admin Access' : 'Student Mode'}
        </button>
      </div>

      <main style={{ 
        width: '100%', maxWidth: '1000px', backgroundColor: theme.card, borderRadius: '24px', 
        padding: '40px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        
        {role === 'student' ? (
          <div style={{ maxWidth: '450px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', fontSize: '28px', marginBottom: '10px' }}>Welcome!</h2>
            <p style={{ textAlign: 'center', color: theme.muted, marginBottom: '35px' }}>Please provide your name to register your attendance.</p>
            
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', fontWeight: '700', marginBottom: '10px', fontSize: '14px' }}>Full Name</label>
              <input 
                style={{ width: '100%', padding: '15px', borderRadius: '12px', border: `2px solid ${theme.border}`, fontSize: '16px', outline: 'none', transition: '0.3s' }}
                value={name} onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aura Dragomir"
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
              <button onClick={() => setActiveTab('scan')} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === 'scan' ? theme.primary : theme.accent, color: activeTab === 'scan' ? 'white' : theme.primary, fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Camera size={18}/> QR Scan
              </button>
              <button onClick={() => setActiveTab('manual')} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === 'manual' ? theme.primary : theme.accent, color: activeTab === 'manual' ? 'white' : theme.primary, fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Type size={18}/> Manual Code
              </button>
            </div>

            {activeTab === 'scan' && (
              <div style={{ border: `3px solid ${theme.accent}`, borderRadius: '20px', overflow: 'hidden', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F9FA' }}>
                {name.trim().length > 2 ? <div id="reader" style={{ width: '100%' }}></div> : <p style={{ color: theme.muted, padding: '20px', textAlign: 'center' }}>Please enter your name to unlock camera</p>}
              </div>
            )}

            {activeTab === 'manual' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input style={{ width: '100%', padding: '15px', borderRadius: '12px', border: `2px solid ${theme.border}`, fontSize: '20px', textAlign: 'center', letterSpacing: '2px' }} value={code} onChange={(e) => setCode(e.target.value)} placeholder="ENTER CODE" />
                <button disabled={loading} onClick={() => sendCheckIn(code)} style={{ width: '100%', backgroundColor: theme.primary, color: 'white', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Processing...' : 'Submit Attendance'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: eventData ? '1fr 1.2fr' : '1fr', gap: '50px' }}>
            <div style={{ textAlign: 'center', borderRight: eventData ? `1px solid ${theme.border}` : 'none', paddingRight: eventData ? '40px' : '0' }}>
              <h2 style={{ fontSize: '24px', marginBottom: '30px', textAlign: 'left' }}>Session Control</h2>
              {!eventData ? (
                <div style={{ padding: '60px 20px', backgroundColor: theme.bg, borderRadius: '20px', border: `2px dashed ${theme.border}` }}>
                  <button onClick={createEvent} style={{ backgroundColor: theme.primary, color: 'white', border: 'none', padding: '18px 36px', borderRadius: '15px', fontWeight: '700', cursor: 'pointer', fontSize: '16px' }}>
                    Start New Session
                  </button>
                  <p style={{ marginTop: '15px', color: theme.muted }}>This will generate a unique QR code for students.</p>
                </div>
              ) : (
                <div style={{ padding: '20px' }}>
                  <QRCodeSVG value={eventData.accessCode} size={250} fgColor={theme.primary} />
                  <div style={{ marginTop: '25px' }}>
                    <p style={{ margin: 0, fontSize: '12px', color: theme.muted, fontWeight: '700' }}>ACCESS CODE</p>
                    <h3 style={{ fontSize: '40px', margin: '5px 0', color: theme.primary, letterSpacing: '5px' }}>{eventData.accessCode}</h3>
                  </div>
                </div>
              )}
            </div>

            {eventData && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                  <h3 style={{ margin: 0 }}>Registered Students ({attendanceList.length})</h3>
                  <button onClick={exportToExcel} style={{ backgroundColor: '#2D3436', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Download size={14}/> Export XLSX
                  </button>
                </div>
                <div style={{ maxHeight: '400px', overflowY: 'auto', border: `1px solid ${theme.border}`, borderRadius: '15px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: theme.bg, position: 'sticky', top: 0 }}>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '15px', fontSize: '12px', color: theme.muted }}>STUDENT NAME</th>
                        <th style={{ textAlign: 'right', padding: '15px', fontSize: '12px', color: theme.muted }}>TIMESTAMP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceList.length === 0 ? (
                        <tr><td colSpan="2" style={{ padding: '40px', textAlign: 'center', color: '#B2BEC3' }}>Waiting for the first student...</td></tr>
                      ) : (
                        attendanceList.map((row, i) => (
                          <tr key={i} style={{ borderTop: `1px solid ${theme.border}` }}>
                            <td style={{ padding: '15px', fontWeight: '600' }}>{row.participantName}</td>
                            <td style={{ padding: '15px', textAlign: 'right', color: theme.muted, fontSize: '14px' }}>
                              <Clock size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                              {new Date(row.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
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

        {/* FEEDBACK MESSAGES & EXTERNAL API ADVICE */}
        {message && (
          <div style={{ 
            marginTop: '30px', padding: '20px', borderRadius: '15px', 
            backgroundColor: message.type === 'success' ? '#F0FFF4' : '#FFF5F5', 
            border: `1px solid ${message.type === 'success' ? '#C6F6D5' : '#FED7D7'}`,
            color: message.type === 'success' ? '#2F855A' : '#C53030'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700', marginBottom: advice ? '10px' : '0' }}>
              {message.type === 'success' ? <Check size={20}/> : <AlertTriangle size={20}/>}
              {message.text}
            </div>
            {message.type === 'success' && advice && (
              <div style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '10px', fontSize: '14px', fontStyle: 'italic', display: 'flex', gap: '8px' }}>
                <Sparkles size={16} /> <strong>Daily Advice:</strong> "{advice}"
              </div>
            )}
          </div>
        )}
      </main>

      <footer style={{ marginTop: '40px', textAlign: 'center', color: theme.muted, fontSize: '13px' }}>
        <p style={{ margin: 0 }}>Designed & Developed by <strong>Dragomir Aura</strong></p>
        <p style={{ margin: '5px 0' }}>Faculty of Cybernetics, Statistics and Economic Informatics • 2026</p>
      </footer>
    </div>
  )
}

export default App