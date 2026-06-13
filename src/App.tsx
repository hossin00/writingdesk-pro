import { useState, useEffect, useRef } from 'react'
import { FileText, Target, Clock, Download, Trash2, Plus, Edit3, ChevronRight } from 'lucide-react'

const ACCENT = '#64748b'
const ACCENT2 = '#94a3b8'

interface Doc {
  id: string
  title: string
  content: string
  goal: number
  created: string
  updated: string
}

export default function App() {
  const [docs, setDocs] = useState<Doc[]>([])
  const [active, setActive] = useState<Doc | null>(null)
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [goal, setGoal] = useState(500)
  const [focus, setFocus] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const textRef = useRef<HTMLTextAreaElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('wd_docs')
    if (saved) setDocs(JSON.parse(saved))
  }, [])

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [running])

  function saveDocs(list: Doc[]) {
    setDocs(list)
    localStorage.setItem('wd_docs', JSON.stringify(list))
  }

  function newDoc() {
    const d: Doc = { id: Date.now().toString(), title: 'Untitled', content: '', goal: 500, created: new Date().toISOString(), updated: new Date().toISOString() }
    saveDocs([d, ...docs])
    openDoc(d)
  }

  function openDoc(d: Doc) {
    setActive(d)
    setContent(d.content)
    setTitle(d.title)
    setGoal(d.goal)
    setElapsed(0)
    setRunning(true)
    setTimeout(() => textRef.current?.focus(), 100)
  }

  function saveDoc() {
    if (!active) return
    const updated = { ...active, title: title.trim() || 'Untitled', content, goal, updated: new Date().toISOString() }
    saveDocs(docs.map(d => d.id === active.id ? updated : d))
    setActive(updated)
  }

  function deleteDoc(id: string) {
    saveDocs(docs.filter(d => d.id !== id))
    if (active?.id === id) { setActive(null); setRunning(false) }
  }

  function exportDoc() {
    const blob = new Blob([content], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = (title || 'document') + '.txt'
    a.click()
  }

  function words(t: string) { return t.trim() ? t.trim().split(/\s+/).length : 0 }
  function fmt(s: number) { return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0') }

  const wc = words(content)
  const progress = Math.min(100, (wc / goal) * 100)

  if (active) {
    return (
      <div style={{ background: focus ? '#0a0a0f' : '#111827', minHeight: '100vh', fontFamily: 'Georgia,serif', color: '#e2e8f0', display: 'flex', flexDirection: 'column' }}>
        {!focus && (
          <div style={{ background: '#1e293b', padding: '0.8rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155' }}>
            <button onClick={() => { saveDoc(); setActive(null); setRunning(false) }} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>← Docs</button>
            <input value={title} onChange={e => setTitle(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 16, fontWeight: 600, textAlign: 'center', flex: 1, margin: '0 1rem', outline: 'none' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setFocus(true)} style={{ background: '#2d3748', border: 'none', borderRadius: 8, padding: '0.4rem 0.8rem', color: '#94a3b8', cursor: 'pointer', fontSize: 12 }}>Focus</button>
              <button onClick={exportDoc} style={{ background: '#2d3748', border: 'none', borderRadius: 8, padding: '0.4rem 0.8rem', color: '#94a3b8', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><Download size={13} /></button>
              <button onClick={saveDoc} style={{ background: ACCENT, border: 'none', borderRadius: 8, padding: '0.4rem 0.9rem', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Save</button>
            </div>
          </div>
        )}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: focus ? '3rem 1rem' : '2rem 1rem' }}>
          {focus && <button onClick={() => setFocus(false)} style={{ position: 'fixed', top: 16, right: 16, background: '#1e293b', border: 'none', borderRadius: 8, padding: '0.4rem 0.8rem', color: '#555', cursor: 'pointer', fontSize: 12 }}>Exit Focus</button>}
          <textarea
            ref={textRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Start writing..."
            style={{ width: '100%', maxWidth: 720, flex: 1, minHeight: '60vh', background: 'transparent', border: 'none', color: '#e2e8f0', fontSize: 18, lineHeight: 1.9, resize: 'none', outline: 'none', fontFamily: 'Georgia,serif' }}
          />
        </div>

        {!focus && (
          <div style={{ background: '#1e293b', padding: '0.7rem 1.5rem', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}><Edit3 size={13} /> {wc} words</span>
              <span style={{ color: '#94a3b8', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={13} /> {fmt(elapsed)}</span>
              <span style={{ color: '#94a3b8', fontSize: 13 }}>{content.length} chars</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: '#64748b', fontSize: 12 }}>Goal: {goal} words</span>
              <div style={{ width: 100, height: 6, background: '#334155', borderRadius: 3 }}>
                <div style={{ height: '100%', width: progress + '%', background: progress >= 100 ? '#22c55e' : '#64748b', borderRadius: 3, transition: 'width 0.3s' }} />
              </div>
              <span style={{ color: progress >= 100 ? '#22c55e' : '#64748b', fontSize: 12 }}>{Math.round(progress)}%</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', fontFamily: 'Inter,sans-serif', color: '#fff', padding: '2rem' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: ACCENT2 }}>WritingDesk</h1>
            <p style={{ color: '#475569', fontSize: 13, marginTop: 2 }}>Distraction-free writing</p>
          </div>
          <button onClick={newDoc} style={{ background: ACCENT, border: 'none', borderRadius: 12, padding: '0.7rem 1.4rem', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Plus size={16} /> New Doc</button>
        </div>

        {docs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: '#334155' }}>
            <FileText size={48} style={{ marginBottom: 16, opacity: 0.4 }} />
            <p style={{ fontSize: 18, fontWeight: 600 }}>No documents yet</p>
            <p style={{ fontSize: 14, marginTop: 8 }}>Create your first document to start writing</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {docs.map(d => (
              <div key={d.id} style={{ background: '#1e293b', borderRadius: 14, padding: '1rem 1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #334155' }}>
                <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => openDoc(d)}>
                  <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{d.title}</p>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <span style={{ color: '#64748b', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><Edit3 size={11} /> {words(d.content)} words</span>
                    <span style={{ color: '#64748b', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><Target size={11} /> Goal: {d.goal}</span>
                    <span style={{ color: '#64748b', fontSize: 12 }}>{new Date(d.updated).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => deleteDoc(d.id)} style={{ background: 'transparent', border: 'none', color: '#475569', cursor: 'pointer', padding: '0.3rem' }}><Trash2 size={16} /></button>
                  <button onClick={() => openDoc(d)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.3rem' }}><ChevronRight size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
