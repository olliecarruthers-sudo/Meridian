import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const EVENT_TYPES = [
  { value: 'deadline', label: 'Deadline', bg: '#FBF0EF', color: '#A0291F', dot: '#E05D52' },
  { value: 'approval', label: 'Approval', bg: '#EEF0FB', color: '#2D3A8C', dot: '#5B6BD9' },
  { value: 'survey', label: 'Survey', bg: '#EBF2ED', color: '#2D5A3D', dot: '#4A8C5C' },
  { value: 'finance', label: 'Finance', bg: '#FDF3E3', color: '#B5650D', dot: '#E8943A' },
  { value: 'meeting', label: 'Meeting', bg: '#F5EEF8', color: '#6C3483', dot: '#9B59B6' },
  { value: 'other', label: 'Other', bg: '#F0F0F0', color: '#555', dot: '#888' },
]

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const s = {
  container: { padding: '24px' },
  nav: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' },
  navTitle: { fontSize: '18px', fontWeight: 500, flex: 1 },
  navBtn: { padding: '7px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface)', color: 'var(--text)', fontSize: '13px', cursor: 'pointer' },
  addBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontSize: '13px', fontWeight: 500, cursor: 'pointer', marginLeft: 'auto' },
  grid: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' },
  dayNames: { display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', borderBottom: '1px solid var(--border)', background: 'var(--bg)' },
  dayName: { padding: '10px 8px', textAlign: 'center', fontSize: '11px', fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' },
  cells: { display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' },
  cell: { minHeight: '90px', padding: '8px', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.1s' },
  dayNum: { fontSize: '12px', fontWeight: 500, marginBottom: '4px', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' },
  event: { fontSize: '10px', padding: '2px 6px', borderRadius: '4px', marginBottom: '2px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', cursor: 'pointer' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(20,18,15,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '24px', width: '380px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' },
  modalTitle: { fontSize: '16px', fontWeight: 500, marginBottom: '18px' },
  field: { marginBottom: '14px' },
  label: { fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-2)', marginBottom: '5px', display: 'block', fontWeight: 500 },
  input: { width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '13px', background: 'var(--bg)', color: 'var(--text)', outline: 'none' },
  modalBtns: { display: 'flex', gap: '8px', justifyContent: 'space-between', marginTop: '18px' },
  btnCancel: { padding: '8px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'transparent', fontSize: '13px', color: 'var(--text-2)', cursor: 'pointer' },
  btnSave: { padding: '8px 18px', border: 'none', borderRadius: 'var(--radius)', background: 'var(--accent)', color: '#fff', fontSize: '13px', fontWeight: 500, cursor: 'pointer' },
  btnDelete: { padding: '8px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'transparent', fontSize: '13px', color: 'var(--red)', cursor: 'pointer' },
  legend: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '14px' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-2)' },
  dot: { width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0 },
}

export default function Calendar() {
  const [date, setDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editEvent, setEditEvent] = useState(null)
  const [form, setForm] = useState({ title: '', date: '', type: 'deadline', notes: '' })
  const today = new Date()

  useEffect(() => {
    fetchEvents()
    const ch = supabase.channel('events').on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, fetchEvents).subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  async function fetchEvents() {
    const { data } = await supabase.from('events').select('*').order('date', { ascending: true })
    if (data) setEvents(data)
  }

  async function saveEvent() {
    if (!form.title.trim() || !form.date) return
    if (editEvent) {
      await supabase.from('events').update(form).eq('id', editEvent.id)
    } else {
      await supabase.from('events').insert([form])
    }
    setShowModal(false); setEditEvent(null)
    setForm({ title: '', date: '', type: 'deadline', notes: '' })
  }

  async function deleteEvent() {
    if (!editEvent) return
    await supabase.from('events').delete().eq('id', editEvent.id)
    setShowModal(false); setEditEvent(null)
  }

  function openEdit(ev) {
    setEditEvent(ev)
    setForm({ title: ev.title, date: ev.date, type: ev.type, notes: ev.notes || '' })
    setShowModal(true)
  }

  function openAdd(dateStr) {
    setEditEvent(null)
    setForm({ title: '', date: dateStr || '', type: 'deadline', notes: '' })
    setShowModal(true)
  }

  const y = date.getFullYear(), m = date.getMonth()
  const firstDay = new Date(y, m, 1).getDay()
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const prevDays = new Date(y, m, 0).getDate()

  function eventsOn(d) {
    const str = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    return events.filter(e => e.date === str)
  }

  function typeStyle(t) {
    return EVENT_TYPES.find(e => e.value === t) || EVENT_TYPES[EVENT_TYPES.length - 1]
  }

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push({ day: prevDays - firstDay + i + 1, current: false })
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true })
  const rem = 42 - cells.length
  for (let i = 1; i <= rem; i++) cells.push({ day: i, current: false })

  return (
    <div style={s.container}>
      <div style={s.nav}>
        <button style={s.navBtn} onClick={() => setDate(new Date(y, m - 1, 1))}>←</button>
        <span style={s.navTitle}>{date.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
        <button style={s.navBtn} onClick={() => setDate(new Date(y, m + 1, 1))}>→</button>
        <button style={s.addBtn} onClick={() => openAdd('')}>+ Add date</button>
      </div>

      <div style={s.grid}>
        <div style={s.dayNames}>
          {DAYS.map(d => <div key={d} style={s.dayName}>{d}</div>)}
        </div>
        <div style={s.cells}>
          {cells.map((cell, i) => {
            const isToday = cell.current && cell.day === today.getDate() && m === today.getMonth() && y === today.getFullYear()
            const evs = cell.current ? eventsOn(cell.day) : []
            const dateStr = cell.current ? `${y}-${String(m + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}` : ''
            const isLast7 = i >= 35
            const isLastCol = (i + 1) % 7 === 0
            return (
              <div key={i} style={{ ...s.cell, opacity: cell.current ? 1 : 0.35, borderRight: isLastCol ? 'none' : s.cell.borderRight, borderBottom: isLast7 ? 'none' : s.cell.borderBottom }}
                onClick={() => cell.current && openAdd(dateStr)}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}>
                <div style={{ ...s.dayNum, background: isToday ? 'var(--accent)' : 'transparent', color: isToday ? '#fff' : 'var(--text)' }}>{cell.day}</div>
                {evs.map(ev => {
                  const ts = typeStyle(ev.type)
                  return (
                    <div key={ev.id} style={{ ...s.event, background: ts.bg, color: ts.color }}
                      onClick={e => { e.stopPropagation(); openEdit(ev) }}>
                      {ev.title}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      <div style={s.legend}>
        {EVENT_TYPES.map(t => (
          <div key={t.value} style={s.legendItem}>
            <div style={{ ...s.dot, background: t.dot }}></div>
            {t.label}
          </div>
        ))}
      </div>

      {showModal && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={s.modal}>
            <div style={s.modalTitle}>{editEvent ? 'Edit date' : 'New critical date'}</div>
            <div style={s.field}>
              <label style={s.label}>Title</label>
              <input style={s.input} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. DA Lodgement deadline" autoFocus />
            </div>
            <div style={s.field}>
              <label style={s.label}>Date</label>
              <input style={s.input} type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Type</label>
              <select style={s.input} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div style={s.field}>
              <label style={s.label}>Notes (optional)</label>
              <input style={s.input} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any extra details…" />
            </div>
            <div style={s.modalBtns}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {editEvent && <button style={s.btnDelete} onClick={deleteEvent}>Delete</button>}
                <button style={s.btnCancel} onClick={() => { setShowModal(false); setEditEvent(null) }}>Cancel</button>
              </div>
              <button style={s.btnSave} onClick={saveEvent}>{editEvent ? 'Save changes' : 'Add date'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
