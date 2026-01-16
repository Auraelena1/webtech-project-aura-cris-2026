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
    } catch (err) {
      setMessage({ type: 'error', text: 'Connection error.' });
    } finally { setLoading(false); }
  }

  const theme = { bg: '#FBFBFC', card: '#FFFFFF', primary: '#D81B60', accent: '#FCE4EC', text: '#2D3436', muted: '#636E72', border: '#EDF2F7' }

  return (
    <div style={{ 
      minHeight: '100vh', width: '100%', backgroundColor: theme.bg, color: theme.text,
      fontFamily: "'Quicksand', sans-serif", display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: '1.5rem', boxSizing: 'border-box'
    }}>
      
      {/* HEADER - Centrat și flexibil */}
      <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GraduationCap color={theme.primary} /> Attendance Portal
          </h1>
          <p style={{ margin: 0, fontSize: '0.8rem', color: theme.muted }}>Web Technologies • 2026</p>
        </div>
        <button onClick={() => setRole(role === 'student' ? 'organizer' : 'student')} style={{ backgroundColor: theme.accent, color: theme.primary, border: 'none', padding: '0.6rem 1.2rem', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem' }}>
          {role === 'student' ? 'Admin Access' : 'Student Mode'}
        </button>
      </div>

      {/* CONTAINER PRINCIPAL - Centrat pe mijloc */}
      <main style={{ 
        width: '100%', maxWidth: '1000px', backgroundColor: theme.card, borderRadius: '24px', 
        padding: '2rem', border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', boxSizing: 'border-box'
      }}>
        
        {role === 'student' ? (
          <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', fontSize: '1.8rem', marginBottom: '2rem' }}>Check-in</h2>
            <input 
              style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: `2px solid ${theme.border}`, fontSize: '1rem', boxSizing: 'border-box', marginBottom: '1.5rem' }}
              value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name (e.g. Aura Dragomir)"
            />
            <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
              <button onClick={() => setActiveTab('scan')} style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', border: 'none', backgroundColor: activeTab === 'scan' ? theme.primary : theme.accent, color: activeTab === 'scan' ? 'white' : theme.primary, fontWeight: '700' }}>QR Scan</button>
              <button onClick={() => setActiveTab('manual')} style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', border: 'none', backgroundColor: activeTab === 'manual' ? theme.primary : theme.accent, color: activeTab === 'manual' ? 'white' : theme.primary, fontWeight: '700' }}>Code</button>
            </div>
            {activeTab === 'scan' && (
              <div style={{ width: '100%', borderRadius: '15px', overflow: 'hidden', backgroundColor: '#f8f9fa', minHeight: '300px' }}>
                {name.length > 2 ? <div id="reader"></div> : <p style={{ textAlign: 'center', padding: '2rem', color: theme.muted }}>Enter name to unlock camera</p>}
              </div>
            )}
            {activeTab === 'manual' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: `2px solid ${theme.border}`, textAlign: 'center', fontSize: '1.4rem' }} value={code} onChange={(e) => setCode(e.target.value)} placeholder="000000" />
                <button onClick={() => sendCheckIn(code)} style={{ backgroundColor: theme.primary, color: 'white', padding: '1rem', borderRadius: '12px', border: 'none', fontWeight: '700' }}>Submit</button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2.5rem', justifyContent: 'center' }}>
            {/* Secțiune QR - Se adaptează automat */}
            <div style={{ flex: '1 1 300px', minWidth: '280px', textAlign: 'center' }}>
              <h3 style={{ textAlign: 'left', marginBottom: '1.5rem' }}>Session Control</h3>
              {!eventData ? (
                <button onClick={createEvent} style={{ backgroundColor: theme.primary, color: 'white', padding: '1rem 2rem', borderRadius: '12px', border: 'none', fontWeight: '700' }}>Start Session</button>
              ) : (
                <div style={{ padding: '1rem', backgroundColor: theme.bg, borderRadius: '20px' }}>
                  <div style={{ maxWidth: '250px', margin: '0 auto' }}>
                    <QRCodeSVG value={eventData.accessCode} size={250} style={{ width: '100%', height: 'auto' }} fgColor={theme.primary} />
                  </div>
                  <h4 style={{ fontSize: '2rem', color: theme.primary, margin: '1rem 0' }}>{eventData.accessCode}</h4>
                </div>
              )}
            </div>

            {/* Secțiune Tabel - Se mută sub QR pe mobil */}
            {eventData && (
              <div style={{ flex: '1.2 1 350px', minWidth: '280px' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Students ({attendanceList.length})</h3>
                <div style={{ maxHeight: '350px', overflowY: 'auto', border: `1px solid ${theme.border}`, borderRadius: '15px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: theme.bg }}>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.8rem' }}>NAME</th>
                        <th style={{ textAlign: 'right', padding: '1rem', fontSize: '0.8rem' }}>TIME</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceList.map((row, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${theme.border}` }}>
                          <td style={{ padding: '1rem', fontWeight: '600' }}>{row.participantName}</td>
                          <td style={{ padding: '1rem', textAlign: 'right', color: theme.muted }}>{new Date(row.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
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
          <div style={{ marginTop: '2rem', padding: '1.2rem', borderRadius: '15px', backgroundColor: message.type === 'success' ? '#F0FFF4' : '#FFF5F5', color: message.type === 'success' ? '#2F855A' : '#C53030', border: `1px solid ${message.type === 'success' ? '#C6F6D5' : '#FED7D7'}` }}>
            <div style={{ fontWeight: '700' }}>{message.text}</div>
            {advice && <div style={{ fontSize: '0.85rem', marginTop: '5px', fontStyle: 'italic' }}>"{advice}"</div>}
          </div>
        )}
      </main>

      <footer style={{ marginTop: '2.5rem', textAlign: 'center', color: theme.muted, fontSize: '0.8rem' }}>
        Designed by Aura & Cristina • CSIE 2026
      </footer>
    </div>
  )
}

export default App