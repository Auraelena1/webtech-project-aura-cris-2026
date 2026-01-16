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
  
  // Hook pentru a detecta dimensiunea ecranului în timp real
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  const API_URL = 'https://webtech-project-aura-cris-2026.onrender.com';

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      setMessage({ type: 'success', text: 'Attendance recorded successfully!' });
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
        name: "Web Technologies Session", startTime: new Date(), duration: 120 
      });
      const openRes = await axios.patch(`${API_URL}/events/${res.data.id}/status`, { status: 'OPEN' });
      setEventData(openRes.data);
      setMessage({ type: 'success', text: 'Session is now live!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Server connection error.' });
    } finally { setLoading(false); }
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(attendanceList);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(workbook, `Report_${new Date().toLocaleDateString()}.xlsx`);
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
      minHeight: '100vh', width: '100%', backgroundColor: theme.bg, color: theme.text,
      fontFamily: "'Quicksand', sans-serif", display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: isMobile ? '10px' : '20px', boxSizing: 'border-box'
    }}>
      
      {/* HEADER */}
      <div style={{ 
        width: '100%', maxWidth: '1000px', display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row', 
        justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', 
        marginBottom: '30px', gap: '15px' 
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GraduationCap color={theme.primary} /> Attendance Portal
          </h1>
          <p style={{ margin: 0, fontSize: '12px', color: theme.muted }}>Web Technologies • Session 2026</p>
        </div>
        <button 
          onClick={() => setRole(role === 'student' ? 'organizer' : 'student')}
          style={{ 
            backgroundColor: theme.accent, color: theme.primary, border: 'none',
            padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700',
            display: 'flex', alignItems: 'center', gap: '8px', alignSelf: isMobile ? 'flex-end' : 'center'
          }}
        >
          {role === 'student' ? <Settings size={16}/> : <User size={16}/>}
          {role === 'student' ? 'Admin Access' : 'Student Mode'}
        </button>
      </div>

      <main style={{ 
        width: '100%', maxWidth: '1000px', backgroundColor: theme.card, borderRadius: '24px', 
        padding: isMobile ? '20px' : '40px', border: `1px solid ${theme.border}`, 
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)', boxSizing: 'border-box'
      }}>
        
        {role === 'student' ? (
          <div style={{ width: '100%', maxWidth: '450px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', fontSize: '24px', marginBottom: '10px' }}>Welcome!</h2>
            <p style={{ textAlign: 'center', color: theme.muted, marginBottom: '25px', fontSize: '14px' }}>Register your attendance below.</p>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '700', marginBottom: '10px', fontSize: '13px' }}>Full Name</label>
              <input 
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: `2px solid ${theme.border}`, fontSize: '16px', boxSizing: 'border-box' }}
                value={name} onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aura Dragomir"
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button onClick={() => setActiveTab('scan')} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === 'scan' ? theme.primary : theme.accent, color: activeTab === 'scan' ? 'white' : theme.primary, fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <Camera size={16}/> Scan
              </button>
              <button onClick={() => setActiveTab('manual')} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === 'manual' ? theme.primary : theme.accent, color: activeTab === 'manual' ? 'white' : theme.primary, fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <Type size={16}/> Code
              </button>
            </div>

            {activeTab === 'scan' && (
              <div style={{ border: `3px solid ${theme.accent}`, borderRadius: '20px', overflow: 'hidden', minHeight: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F9FA' }}>
                {name.trim().length > 2 ? <div id="reader" style={{ width: '100%' }}></div> : <p style={{ color: theme.muted, padding: '20px', textAlign: 'center', fontSize: '12px' }}>Enter name to start camera</p>}
              </div>
            )}

            {activeTab === 'manual' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input style={{ width: '100%', padding: '12px', borderRadius: '12px', border: `2px solid ${theme.border}`, fontSize: '18px', textAlign: 'center', boxSizing: 'border-box' }} value={code} onChange={(e) => setCode(e.target.value)} placeholder="000000" />
                <button onClick={() => sendCheckIn(code)} style={{ width: '100%', backgroundColor: theme.primary, color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '700' }}>
                  Submit
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row', 
            gap: isMobile ? '30px' : '50px' 
          }}>
            <div style={{ flex: 1, textAlign: 'center', borderRight: (!isMobile && eventData) ? `1px solid ${theme.border}` : 'none', paddingRight: (!isMobile && eventData) ? '40px' : '0' }}>
              <h2 style={{ fontSize: '20px', marginBottom: '20px', textAlign: 'left' }}>Control Panel</h2>
              {!eventData ? (
                <div style={{ padding: '40px 20px', backgroundColor: theme.bg, borderRadius: '20px', border: `2px dashed ${theme.border}` }}>
                  <button onClick={createEvent} style={{ backgroundColor: theme.primary, color: 'white', border: 'none', padding: '15px 25px', borderRadius: '12px', fontWeight: '700', fontSize: '14px' }}>
                    Start Session
                  </button>
                </div>
              ) : (
                <div style={{ padding: '10px' }}>
                  <div style={{ maxWidth: '250px', margin: '0 auto' }}>
                    <QRCodeSVG value={eventData.accessCode} size={250} style={{ width: '100%', height: 'auto' }} fgColor={theme.primary} />
                  </div>
                  <h3 style={{ fontSize: '32px', margin: '15px 0', color: theme.primary, letterSpacing: '4px' }}>{eventData.accessCode}</h3>
                </div>
              )}
            </div>

            {eventData && (
              <div style={{ flex: 1.2 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px' }}>Students ({attendanceList.length})</h3>
                  <button onClick={exportToExcel} style={{ backgroundColor: '#2D3436', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Download size={12}/> XLSX
                  </button>
                </div>
                <div style={{ maxHeight: '350px', overflowY: 'auto', border: `1px solid ${theme.border}`, borderRadius: '15px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: theme.bg }}>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '12px', fontSize: '11px', color: theme.muted }}>NAME</th>
                        <th style={{ textAlign: 'right', padding: '12px', fontSize: '11px', color: theme.muted }}>TIME</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceList.length === 0 ? (
                        <tr><td colSpan="2" style={{ padding: '30px', textAlign: 'center', color: '#B2BEC3', fontSize: '13px' }}>Waiting for entries...</td></tr>
                      ) : (
                        attendanceList.map((row, i) => (
                          <tr key={i} style={{ borderTop: `1px solid ${theme.border}` }}>
                            <td style={{ padding: '12px', fontWeight: '600', fontSize: '14px' }}>{row.participantName}</td>
                            <td style={{ padding: '12px', textAlign: 'right', color: theme.muted, fontSize: '12px' }}>
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

        {message && (
          <div style={{ 
            marginTop: '25px', padding: '15px', borderRadius: '15px', 
            backgroundColor: message.type === 'success' ? '#F0FFF4' : '#FFF5F5', 
            border: `1px solid ${message.type === 'success' ? '#C6F6D5' : '#FED7D7'}`,
            color: message.type === 'success' ? '#2F855A' : '#C53030', fontSize: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
              {message.type === 'success' ? <Check size={18}/> : <AlertTriangle size={18}/>}
              {message.text}
            </div>
            {message.type === 'success' && advice && (
              <div style={{ marginTop: '10px', padding: '8px', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '10px', fontSize: '12px', fontStyle: 'italic' }}>
                <Sparkles size={14} style={{ marginRight: '5px' }} /> Advice: "{advice}"
              </div>
            )}
          </div>
        )}
      </main>

      <footer style={{ marginTop: '30px', textAlign: 'center', color: theme.muted, fontSize: '12px' }}>
        <p>Aura Dragomir • CSIE • 2026</p>
      </footer>
    </div>
  )
}

export default App