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
 * Attendance Management Application - Responsive Edition
 * Developed by: Dragomir Aura & Cristina Lapusneanu
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
      const res = await axios.post(`${API_URL}/checkin`, { 
        participantName: name, 
        code: codeToSend 
      });
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
        name: "Web Technologies Session", 
        startTime: new Date(), 
        duration: 120 
      });
      const openRes = await axios.patch(`${API_URL}/events/${res.data.id}/status`, { status: 'OPEN' });
      setEventData(openRes.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Connection error.' });
    } finally { setLoading(false); }
  }

  const exportToExcel = () => {
    const dataToExport = attendanceList.map(item => ({
      Student: item.participantName,
      Time: new Date(item.checkInTime).toLocaleTimeString()
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
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
      alignItems: 'center', padding: '15px', boxSizing: 'border-box'
    }}>
      
      {/* HEADER - Responsive Layout */}
      <div style={{ 
        width: '100%', maxWidth: '1000px', display: 'flex', 
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
        marginBottom: '20px', flexWrap: 'wrap', gap: '15px' 
      }}>
        <div style={{ flex: '1 1 auto' }}>
          <h1 style={{ margin: 0, fontSize: 'clamp(18px, 5vw, 24px)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GraduationCap color={theme.primary} /> Attendance Portal
          </h1>
          <p style={{ margin: 0, fontSize: '12px', color: theme.muted }}>Web Technologies • 2026</p>
        </div>
        <button 
          onClick={() => setRole(role === 'student' ? 'organizer' : 'student')}
          style={{ 
            backgroundColor: theme.accent, color: theme.primary, border: 'none',
            padding: '10px 15px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700',
            display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px'
          }}
        >
          {role === 'student' ? <Settings size={14}/> : <User size={14}/>}
          {role === 'student' ? 'Admin Access' : 'Student Mode'}
        </button>
      </div>

      <main style={{ 
        width: '100%', maxWidth: '1000px', backgroundColor: theme.card, borderRadius: '20px', 
        padding: window.innerWidth < 600 ? '20px' : '40px', 
        border: `1px solid ${theme.border}`, boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
        boxSizing: 'border-box'
      }}>
        
        {role === 'student' ? (
          <div style={{ width: '100%', maxWidth: '450px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', fontSize: '24px', marginBottom: '8px' }}>Check-in</h2>
            <p style={{ textAlign: 'center', color: theme.muted, marginBottom: '25px', fontSize: '14px' }}>Register your presence for today's session.</p>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px', fontSize: '13px' }}>Full Name</label>
              <input 
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `2px solid ${theme.border}`, fontSize: '16px', boxSizing: 'border-box' }}
                value={name} onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aura Dragomir"
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '25px' }}>
              <button onClick={() => setActiveTab('scan')} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === 'scan' ? theme.primary : theme.accent, color: activeTab === 'scan' ? 'white' : theme.primary, fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>Scan QR</button>
              <button onClick={() => setActiveTab('manual')} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === 'manual' ? theme.primary : theme.accent, color: activeTab === 'manual' ? 'white' : theme.primary, fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>Manual Code</button>
            </div>

            {activeTab === 'scan' && (
              <div style={{ border: `3px solid ${theme.accent}`, borderRadius: '15px', overflow: 'hidden', minHeight: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F9FA' }}>
                {name.trim().length > 2 ? <div id="reader" style={{ width: '100%' }}></div> : <p style={{ color: theme.muted, textAlign: 'center', fontSize: '13px' }}>Enter your name to start camera</p>}
              </div>
            )}

            {activeTab === 'manual' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `2px solid ${theme.border}`, fontSize: '18px', textAlign: 'center', boxSizing: 'border-box' }} value={code} onChange={(e) => setCode(e.target.value)} placeholder="6-DIGIT CODE" />
                <button disabled={loading} onClick={() => sendCheckIn(code)} style={{ width: '100%', backgroundColor: theme.primary, color: 'white', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
                  {loading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: window.innerWidth < 850 ? 'column' : 'row', 
            gap: '30px' 
          }}>
            <div style={{ flex: '1', textAlign: 'center', minWidth: '0' }}>
              <h2 style={{ fontSize: '20px', marginBottom: '20px', textAlign: 'left' }}>Session Control</h2>
              {!eventData ? (
                <div style={{ padding: '40px 10px', backgroundColor: theme.bg, borderRadius: '15px', border: `2px dashed ${theme.border}` }}>
                  <button onClick={createEvent} style={{ backgroundColor: theme.primary, color: 'white', border: 'none', padding: '15px 25px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>Start Session</button>
                </div>
              ) : (
                <div style={{ padding: '10px' }}>
                  <div style={{ maxWidth: '250px', margin: '0 auto' }}>
                    <QRCodeSVG value={eventData.accessCode} size={window.innerWidth < 350 ? 180 : 220} fgColor={theme.primary} style={{ width: '100%', height: 'auto' }} />
                  </div>
                  <div style={{ marginTop: '15px' }}>
                    <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: theme.muted }}>CODE: <span style={{ color: theme.primary, fontSize: '24px' }}>{eventData.accessCode}</span></p>
                  </div>
                </div>
              )}
            </div>

            {eventData && (
              <div style={{ flex: '1.5', minWidth: '0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px' }}>Participants ({attendanceList.length})</h3>
                  <button onClick={exportToExcel} style={{ backgroundColor: '#2D3436', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>XLSX</button>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto', border: `1px solid ${theme.border}`, borderRadius: '10px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead style={{ backgroundColor: theme.bg }}>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '10px' }}>NAME</th>
                        <th style={{ textAlign: 'right', padding: '10px' }}>TIME</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceList.length === 0 ? (
                        <tr><td colSpan="2" style={{ padding: '20px', textAlign: 'center', color: theme.muted }}>No one yet...</td></tr>
                      ) : (
                        attendanceList.map((row, i) => (
                          <tr key={i} style={{ borderTop: `1px solid ${theme.border}` }}>
                            <td style={{ padding: '10px', fontWeight: '600' }}>{row.participantName}</td>
                            <td style={{ padding: '10px', textAlign: 'right', color: theme.muted }}>{new Date(row.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
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
            marginTop: '25px', padding: '15px', borderRadius: '12px', 
            backgroundColor: message.type === 'success' ? '#F0FFF4' : '#FFF5F5', 
            border: `1px solid ${message.type === 'success' ? '#C6F6D5' : '#FED7D7'}`,
            color: message.type === 'success' ? '#2F855A' : '#C53030',
            fontSize: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
              {message.type === 'success' ? <Check size={16}/> : <AlertTriangle size={16}/>}
              {message.text}
            </div>
            {message.type === 'success' && advice && (
              <div style={{ marginTop: '8px', padding: '8px', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '8px', fontStyle: 'italic', fontSize: '12px' }}>
                <Sparkles size={14} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> {advice}
              </div>
            )}
          </div>
        )}
      </main>

      <footer style={{ marginTop: '20px', textAlign: 'center', color: theme.muted, fontSize: '11px' }}>
        <p style={{ margin: 0 }}>Designed by <strong>Aura & Cristina</strong></p>
        <p style={{ margin: '4px 0' }}>CSIE • Web Technologies 2026</p>
      </footer>
    </div>
  )
}

export default App