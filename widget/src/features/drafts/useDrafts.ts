import { useEffect, useRef, useState, type FormEvent } from 'react';
import { platforms, type Draft } from './types';

export function useDrafts() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [platformId, setPlatformId] = useState(1);
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [imageChanged, setImageChanged] = useState(false);
  const [imageReading, setImageReading] = useState(false);
  const [original, setOriginal] = useState({ platformId: 1, text: '', hasImage: false });
  const editorVersion = useRef(0);
  const savingRef = useRef(false);
  const [filter, setFilter] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const isDirty = platformId !== original.platformId || text !== original.text || imageChanged || imageReading;

  useEffect(() => {
    if (!isDirty) return;
    function warnBeforeLeaving(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = '';
    }
    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [isDirty]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/drafts');
      if (!response.ok) throw new Error('Could not load drafts.');
      setDrafts(await response.json());
    } catch {
      setError('Could not connect to the server. Check that it is running, then try again.');
    } finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  function resetDraft() {
    editorVersion.current += 1;
    setImageReading(false);
    setSelected(null); setPlatformId(1); setText(''); setImage(null); setImageChanged(false); setError(''); setNotice('');
    setOriginal({ platformId: 1, text: '', hasImage: false });
  }
  function confirmDiscard() {
    return !isDirty || window.confirm('Discard your unsaved changes?');
  }
  function newDraft() {
    if (savingRef.current || !confirmDiscard()) return;
    resetDraft();
  }
  function openDraft(draft: Draft) {
    if (savingRef.current || draft.id === selected || !confirmDiscard()) return;
    editorVersion.current += 1;
    setImageReading(false);
    setSelected(draft.id); setPlatformId(draft.platformId); setText(draft.text); setImage(draft.hasImage ? `/drafts/${draft.id}/image?updated=${encodeURIComponent(draft.updatedAt)}` : null); setImageChanged(false); setError(''); setNotice('');
    setOriginal({ platformId: draft.platformId, text: draft.text, hasImage: draft.hasImage });
  }
  function changeImage(value: string | null) {
    editorVersion.current += 1;
    setImageReading(false);
    setImage(value);
    setImageChanged(value !== null || original.hasImage);
    setNotice('');
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (savingRef.current || imageReading) return;
    if (!text.trim()) { setError('Write something before saving your draft.'); return; }
    savingRef.current = true;
    setSaving(true); setError(''); setNotice('');
    try {
      const response = await fetch(selected ? `/drafts/${selected}` : '/drafts', {
        method: selected ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platformId, text, ...(imageChanged ? { image } : {}) }),
      });
      if (!response.ok) throw new Error('Save failed');
      const draft: Draft = await response.json();
      setDrafts(current => selected ? current.map(item => item.id === draft.id ? draft : item) : [...current, draft]);
      setSelected(draft.id); setImage(draft.hasImage ? `/drafts/${draft.id}/image?updated=${encodeURIComponent(draft.updatedAt)}` : null); setImageChanged(false); setNotice('Draft saved');
      setOriginal({ platformId: draft.platformId, text: draft.text, hasImage: draft.hasImage });
    } catch { setError('Could not save your draft. Please try again.'); }
    finally { savingRef.current = false; setSaving(false); }
  }
  async function remove(draft: Draft) {
    if (savingRef.current) return;
    if (!window.confirm('Delete this draft?')) return;
    setError(''); setNotice('');
    try {
      const response = await fetch(`/drafts/${draft.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed');
      setDrafts(current => current.filter(item => item.id !== draft.id));
      if (selected === draft.id) resetDraft();
      setNotice('Draft deleted');
    } catch { setError('Could not delete this draft. Please try again.'); }
  }
  const visible = drafts.filter(draft => filter === null || draft.platformId === filter).slice().reverse();
  const platform = platforms.find(item => item.id === platformId)!;


  return { drafts, selected, platformId, text, image, changeImage, imageReading, setImageReading, editorVersion, isDirty, filter, loading, saving, error, notice, visible, platform, setFilter, setPlatformId, setText, setError, setNotice, newDraft, openDraft, save, remove };
}

