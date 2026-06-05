import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const MEMBERS = [
  { id: 'AL', name: 'Alex', color: '#D4C5F9', text: '#4A3780' },
  { id: 'SM', name: 'Sam', color: '#A8DFCC', text: '#1A6B4A' },
  { id: 'JO', name: 'Jordan', color: '#FAD7A0', text: '#7D4E00' },
  { id: 'RI', name: 'Riley', color: '#F5B8CC', text: '#7A2040' },
]

const PRIORITIES = ['Critical', 'Important', 'Normal']
const PRIORITY_STYLE = {
  Critical: { bg: '#FBF0EF', color: '#A0291F' },
  Important: { bg: '#FDF3E3', color: '#B5650D' },
  Normal: { bg: '#EBF3FB', color: '#1B4F72' },
}
const COLUMNS = ['To do', 'In progress', 'Done']

const s = {
  container: { padding: '24px' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' },
  title: { fontSize: '13px', color: 'var(--text-2)', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 500 },
  addBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontSize: '13px', fontWeight: 500, cursor: 'pointer' },
  cols: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  col: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '14px', minHeight: '300px' },
  colHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' },
  colTitle: { fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-2)' },
  colCount: { fontSize: '11px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1px 8px', color: 'var(--text-3)' },
  card: { background: '#FDFCFA', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px', marginBottom: '8px', cursor: 'grab' },
  cardTitle: { fontSize: '13px', fontWeight: 500, marginBottom: '10px', color: 'var(--text)' },
  cardMeta: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  tag: { fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: 500 },
  due: { fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--mono)' },
  avatar: { width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 600 },
  empty: { textAlign: 'center', padding: '24px 0', color: 'var(--text-3)', fontSize: '12px' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(20,18,15,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '24px', width: '380px', boxShadow: 'var(--shadow-md)' },
  modalTitle: { fontSize: '16px', fontWeight: 500, marginBottom: '18px' },
  field: { marginBottom: '14px' },
  label: { fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-2)', marginBottom: '5px', display: 'block', fontWeight: 500 },
  input: { width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '13px', background: 'var(--bg)', color: 'var(--text)', outline: 'none' },
  modalBtns: { display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '18px' },
  btnCancel: { padding: '8px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'transparent', fontSize: '13px', color: 'var(--text-2)', cursor: 'pointer' },
  btnSave: { padding: '8px 18px', border: 'none', borderRadius: 'var(--radius)', background: 'var(--accent)', color: '#fff', fontSize: '13px', fontWeight: 500, cursor: 'pointer' },
  loading: { textAlign: 'center', padding: '40px', color: 'var(--text-3)' },
  cardRight: { display: 'flex', alignItems: 'center', gap: '8px' },
}

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [dragId, setDragId] = useState(null)
  const [form, setForm] = useState({ title: '', priority: 'Normal', assignee: 'AL', due_date: '' })

  useEffect(() => {
    fetchTasks()
    const channel = supabase.channel('tasks').on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchTasks).subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchTasks() {
    const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: true })
    if (data) setTasks(data)
    setLoading(false)
  }

  async function addTask() {
    if (!form.title.trim()) return
    await supabase.from('tasks').insert([{ ...form, status: 'To do' }])
    setForm({ title: '', priority: 'Normal', assignee: 'AL', due_date: '' })
    setShowModal(false)
  }

  async function moveTask(id, status) {
    await supabase.from('tasks').update({ status }).eq('id', id)
  }

  async function deleteTask(id) {
    await supabase.from('tasks').delete().eq('id', id)
  }

  function formatDate(d) {
    if (!d) return ''
    const dt = new Date(d + 'T00:00:00')
    return dt.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
  }

  const member = (id) => MEMBERS.find(m => m.id === id) || MEMBERS[0]

  if (loading) return <div style={s.loading}>Loading tasks…</div>

  return (
    <div style={s.container}>
      <div style={s.header}>
        <span style={s.title}>Task board</span>
        <button style={s.addBtn} onClick={() => setShowModal(true)}>+ Add task</button>
      </div>

      <div style={s.cols}>
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col)
          return (
            <div key={col} style={{ ...s.col, background: dragId ? '#F8F6F2' : 'var(--surface)' }}
              onDragOver={e => e.preventDefault()}
              onDrop={() => { if (dragId) { moveTask(dragId, col); setDragId(null) } }}>
              <div style={s.colHead}>
                <span style={s.colTitle}>{col}</span>
                <span style={s.colCount}>{colTasks.length}</span>
              </div>
