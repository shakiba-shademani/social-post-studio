import { useEffect, useState, type FormEvent } from 'react';
import { platforms, type Draft } from './types';

export function useDrafts() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [platformId, setPlatformId] = useState(1);
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [imageChanged, setImageChanged] = useState(false);
  const [filter, setFilter] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

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

  function newDraft() {
    setSelected(null); setPlatformId(1); setText(''); setImage(null); setImageChanged(false); setError(''); setNotice('');
  }
  function openDraft(draft: Draft) {
    setSelected(draft.id); setPlatformId(draft.platformId); setText(draft.text); setImage(draft.hasImage ? `/drafts/${draft.id}/image?updated=${encodeURIComponent(draft.updatedAt)}` : null); setImageChanged(false); setError(''); setNotice('');
  }
  function changeImage(value: string | null) {
    setImage(value);
    setImageChanged(true);
    setNotice('');
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (!text.trim()) { setError('Write something before saving your draft.'); return; }
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
    } catch { setError('Could not save your draft. Please try again.'); }
    finally { setSaving(false); }
  }
  async function remove(draft: Draft) {
    if (!window.confirm('Delete this draft?')) return;
    setError(''); setNotice('');
    try {
      const response = await fetch(`/drafts/${draft.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed');
      setDrafts(current => current.filter(item => item.id !== draft.id));
      if (selected === draft.id) newDraft();
      setNotice('Draft deleted');
    } catch { setError('Could not delete this draft. Please try again.'); }
  }
  const visible = drafts.filter(draft => filter === null || draft.platformId === filter).slice().reverse();
  const platform = platforms.find(item => item.id === platformId)!;


  return { drafts, selected, platformId, text, image, changeImage, filter, loading, saving, error, notice, visible, platform, setFilter, setPlatformId, setText, setError, setNotice, newDraft, openDraft, save, remove };
}

