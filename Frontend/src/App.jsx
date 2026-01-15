import { useState, useEffect } from 'react'
import axios from 'axios'
import { Camera, Type, Download, ChevronRight, Settings, Check, AlertTriangle, User, BarChart3 } from 'lucide-react'
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

  useEffect(() => {
    let scanner;
    if (role === 'student' && activeTab === 'scan' && name.length > 2) {
      scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
      scanner.render((text) => { sendCheckIn(text); scanner.clear(); }, (err) => {});
    }
    return () => { if (scanner) scanner.clear().catch(() => {}); };
  }, [role, activeTab, name.length > 2]);

  const sendCheckIn = async (codeToSend) => {
    try {
      const res = await axios.post('https://webtech-project-aura-cris-2026.onrender.com', { participantName: name, code: codeToSend })
      setMessage({ type: 'success', text: 'Prezenta a fost inregistrata in baza de date.' })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Eroare la procesarea solicitarii.' })
    }
  }

  const createEvent = async () => {
    const res = await axios.post('https://webtech-project-aura-cris-2026.onrender.com/groups/1/events', { 
      name: "Sesiune Tehnologii Web", 
      startTime: new Date(), 
      duration: 120 
    });
    setEventData(res.data);
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(attendanceList);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Prezenta");
    XLSX.writeFile(workbook, `Raport_Prezenta.xlsx`);
  }

  const theme = {
    bg: '#F8F9FA',
    card: '#FFFFFF',
    primary: '#E91E63', // Rose profesional
    text: '#212529',
    textMuted: '#6C757D',
    border: '#DEE2E6',
    success: '#198754',
    danger: '#DC3545'
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100vw',
      backgroundColor: theme.bg,
      color: theme.text,
      fontFamily: "'Quicksand', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px',
      boxSizing: 'border-box'
    }}>
      
      {/* Container principal de tip Dashboard */}
      <div style={{ width: '100%', maxWidth: '1000px' }}>
        
        {/* Navigatie Superioara */}
        <nav style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          backgroundColor: theme.card,
          padding: '15px 30px',
          borderRadius: '12px',
          marginBottom: '24px',
          border: `1px solid ${theme.border}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: theme.primary, borderRadius: '8px' }}></div>
            <span style={{ fontWeight: '700', fontSize: '20px', letterSpacing: '-0.5px' }}>Attendance Portal</span>
          </div>
          <button 
            onClick={() => setRole(role === 'student' ? 'organizer' : 'student')}
            style={{ 
              backgroundColor: 'transparent', 
              border: `1px solid ${theme.border}`,
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: theme.text
            }}
          >
            {role === 'student' ? <Settings size={16}/> : <User size={16}/>}
            {role === 'student' ? 'Administrare' : 'Acces Student'}
          </button>
        </nav>

        <main style={{ 
          backgroundColor: theme.card, 
          borderRadius: '16px', 
          padding: '48px',
          border: `1px solid ${theme.border}`,
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          
          {role === 'student' ? (
            <div style={{ maxWidth: '480px', margin: '0 auto' }}>
              <h2 style={{ fontSize: '28px', marginBottom: '8px', textAlign: 'center' }}>Inregistrare prezenta</h2>
              <p style={{ color: theme.textMuted, textAlign: 'center', marginBottom: '40px' }}>Completati datele pentru a confirma participarea la activitate.</p>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>Nume si prenume</label>
                <input 
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: `1px solid ${theme.border}`, fontSize: '16px', outline: 'none' }}
                  value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Introdu numele complet"
                />
              </div>

              <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}`, marginBottom: '32px' }}>
                <button 
                  onClick={() => setActiveTab('scan')}
                  style={{ padding: '12px 24px', backgroundColor: 'transparent', border: 'none', borderBottom: activeTab === 'scan' ? `2px solid ${theme.primary}` : 'none', color: activeTab === 'scan' ? theme.primary : theme.textMuted, cursor: 'pointer', fontWeight: '600' }}
                >
                  Scanare QR
                </button>
                <button 
                  onClick={() => setActiveTab('manual')}
                  style={{ padding: '12px 24px', backgroundColor: 'transparent', border: 'none', borderBottom: activeTab === 'manual' ? `2px solid ${theme.primary}` : 'none', color: activeTab === 'manual' ? theme.primary : theme.textMuted, cursor: 'pointer', fontWeight: '600' }}
                >
                  Introducere cod
                </button>
              </div>

              {activeTab === 'scan' && (
                <div style={{ backgroundColor: '#F1F3F5', borderRadius: '12px', overflow: 'hidden', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {name.length > 2 ? <div id="reader" style={{ width: '100%' }}></div> : <p style={{ color: theme.textMuted }}>Introduceti numele pentru activarea camerei</p>}
                </div>
              )}

              {activeTab === 'manual' && (
                <div>
                  <input 
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: `1px solid ${theme.border}`, fontSize: '16px', marginBottom: '16px' }}
                    value={code} onChange={(e) => setCode(e.target.value)}
                    placeholder="Cod de acces din 6 caractere"
                  />
                  <button 
                    onClick={() => sendCheckIn(code)}
                    style={{ width: '100%', backgroundColor: theme.primary, color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Confirma prezenta
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: eventData ? '400px 1fr' : '1fr', gap: '64px' }}>
              <div>
                <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Panou de control</h2>
                {!eventData ? (
                  <button 
                    onClick={createEvent}
                    style={{ backgroundColor: theme.primary, color: 'white', border: 'none', padding: '16px 32px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Genereaza cod eveniment
                  </button>
                ) : (
                  <div style={{ border: `1px solid ${theme.border}`, padding: '32px', borderRadius: '12px', textAlign: 'center' }}>
                    <QRCodeSVG value={eventData.accessCode} size={220} />
                    <div style={{ marginTop: '24px' }}>
                      <span style={{ fontSize: '14px', color: theme.textMuted }}>COD ACCES</span>
                      <div style={{ fontSize: '32px', fontWeight: '700', letterSpacing: '4px', color: theme.primary }}>{eventData.accessCode}</div>
                    </div>
                    <button 
                      onClick={exportToExcel}
                      style={{ marginTop: '32px', width: '100%', backgroundColor: '#212529', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <Download size={16}/> Exporta datele (XLSX)
                    </button>
                  </div>
                )}
              </div>

              {eventData && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px' }}>Lista participanti</h3>
                    <span style={{ backgroundColor: theme.bg, padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
                      {attendanceList.length} Inregistrati
                    </span>
                  </div>
                  <div style={{ border: `1px solid ${theme.border}`, borderRadius: '12px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ backgroundColor: '#F8F9FA' }}>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '13px', color: theme.textMuted }}>NUME</th>
                          <th style={{ textAlign: 'right', padding: '12px 20px', fontSize: '13px', color: theme.textMuted }}>ORA</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceList.map((row, i) => (
                          <tr key={i} style={{ borderTop: `1px solid ${theme.border}` }}>
                            <td style={{ padding: '14px 20px', fontWeight: '500' }}>{row.participantName}</td>
                            <td style={{ padding: '14px 20px', textAlign: 'right', color: theme.textMuted, fontSize: '14px' }}>
                              {new Date(row.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
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
            <div style={{ 
              marginTop: '40px', 
              padding: '16px', 
              borderRadius: '8px', 
              backgroundColor: message.type === 'success' ? '#EBFBEE' : '#FFF5F5', 
              color: message.type === 'success' ? theme.success : theme.danger,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontWeight: '500',
              border: `1px solid ${message.type === 'success' ? '#D3F9D8' : '#FFE3E3'}`
            }}>
              {message.type === 'success' ? <Check size={18}/> : <AlertTriangle size={18}/>}
              {message.text}
            </div>
          )}
        </main>

        <footer style={{ marginTop: '32px', textAlign: 'center', color: theme.textMuted, fontSize: '14px' }}>
          Sistem Monitorizare Prezenta v1.0 • Toate drepturile rezervate
        </footer>
      </div>
    </div>
  )
}

export default App