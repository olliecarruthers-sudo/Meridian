import React, { useState } from 'react'
import Tasks from './components/Tasks'
import Calendar from './components/Calendar'
import Files from './components/Files'

const MEMBERS = [
  { id: 'AL', name: 'Alex', color: '#D4C5F9', text: '#4A3780' },
  { id: 'SM', name: 'Sam', color: '#A8DFCC', text: '#1A6B4A' },
  { id: 'JO', name: 'Jordan', color: '#FAD7A0', text: '#7D4E00' },
  { id: 'RI', name: 'Riley', color: '#F5B8CC', text: '#7A2040' },
]

const TABS = [
  { id: 'tasks', label: 'Tasks' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'files', label: 'Files & Links' },
]

export default function App() {
  const [tab, setTab] = useState('tasks')

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '56px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px', height: '28px', background: 'var(--accent)', borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px'
          }}>🏗</div>
          <span style={{ fontSize: '15px', fontWeight: 500, letterSpacing: '-0.01em' }}>
            Meridian Property Development
          </span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {MEMBERS.map(m => (
            <div key={m.id} title={m.name} style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: m.color, color: m.text,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 600,
              border: '2px solid var(--surface)',
              cursor: 'default',
            }}>{m.id}</div>
          ))}
        </div>
      </header>

      <nav style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        display: 'flex',
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '12px 20px',
            border: 'none',
            borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
            background: 'transparent',
            fontSize: '13px',
            fontWeight: tab === t.id ? 500 : 400,
            color: tab === t.id ? 'var(--accent)' : 'var(--text-2)',
            cursor: 'pointer',
            transition: 'all 0.15s',
            marginBottom: '-1px',
          }}>
            {t.label}
          </button>
        ))}
      </nav>

      <main style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
        {tab === 'tasks' && <Tasks />}
        {tab === 'calendar' && <Calendar />}
        {tab === 'files' && <Files />}
      </main>

      <footer style={{ padding: '16px 24px', textAlign: 'center', fontSize: '11px', color: 'var(--text-3)', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
        Meridian Property Development · {new Date().getFullYear()}
      </footer>
    </div>
  )
}
