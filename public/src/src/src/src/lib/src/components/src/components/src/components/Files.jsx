import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

const FILE_ICONS = {
  pdf: { icon: '📄', bg: '#FBF0EF', color: '#A0291F' },
  doc: { icon: '📝', bg: '#EBF3FB', color: '#1B4F72' },
  docx: { icon: '📝', bg: '#EBF3FB', color: '#1B4F72' },
  xls: { icon: '📊', bg: '#EBF2ED', color: '#2D5A3D' },
  xlsx: { icon: '📊', bg: '#EBF2ED', color: '#2D5A3D' },
  png: { icon: '🖼', bg: '#EBF2ED', color: '#2D5A3D' },
  jpg: { icon: '🖼', bg: '#EBF2ED', color: '#2D5A3D' },
  jpeg: { icon: '🖼', bg: '#EBF2ED', color: '#2D5A3D' },
  link: { icon: '🔗', bg: '#EEF0FB', color: '#2D3A8C' },
}

function getIcon(type) {
  return FILE_ICONS[type] || { icon: '📁', bg: '#F0F0F0', color: '#555' }
}

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB'
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

const s = {
  container: { padding: '24px' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' },
  title: { fontSize: '13px', color: 'var(--text-2)', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 500 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' },
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px', cursor: 'pointer', transition: 'border-color 0.15s', position: 'relative' },
  iconBox: { width: '40px', height: '40px', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '10px' },
  fileName: { fontSize: '13px', fontWeight: 500, marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  fileMeta: { fontSize: '11px', color: 'var(--text-3)' },
  deleteBtn: { position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: 'var(--text-3)', fontSize: '16px', cursor: 'pointer', lineHeight: 1, padding: '2px 5px', borderRadius: '4px' },
  uploadZone: { border: '1.5px dashed var(--border-strong)', borderRadius: 'var(--radius-lg)', padding: '32px', textAlign: 'center', cursor: 'pointer', background: 'var(--surface)', transition: 'background 0.15s, border-color 0.15s', marginBottom: '14px' },
  uploadIcon: { fontSize: '28px', marginBottom: '8px' },
  uploadText: { fontSize: '13px', color: 'var(--text-2)', marginBottom: '3px' },
  uploadSub: { fontSize: '11px', color: 'var(--text-3)' },
  linkRow: { display: 'flex', gap: '8px' },
  linkInput: { flex: 1, padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '13px', background: 'var(--bg)', color: 'var(--text)', outline: 'none' },
  linkBtn: { padding: '9px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface)', fontSize: '13px', color: 'var(--text)', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 500 },
  uploading: { fontSize: '12px', color: 'var(--accent)', marginTop: '6px', textAlign: 'center' },
  empty: { color: 'var(--text-3)', fontSize: '13px', padding: '16px 0' },
}

export default function Files() {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [dragOver, setDragOve
