import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { App as McpApp } from '@modelcontextprotocol/ext-apps';
import { DraftEditor } from '../features/drafts/DraftEditor';
import { CaptionInsights, type CaptionAnalysis } from './CaptionInsights';
import '../style.css';

function CaptionWidget() {
  const editorVersion = useRef(0);
  const appRef = useRef<McpApp | null>(null);
  const [connected, setConnected] = useState(false);
  const [analysis, setAnalysis] = useState<CaptionAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [platformId, setPlatformId] = useState(1);
  const [text, setText] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const app = new McpApp({ name: 'Social Post Studio', version: '0.1.0' });
    appRef.current = app;
    let active = true;
    app.ontoolresult = result => {
      const data = result.structuredContent;
      if (!data || typeof data.text !== 'string' || typeof data.platformId !== 'number') return;
      setText(data.text);
      setPlatformId(data.platformId);
    };
    app.connect().then(() => { if (active) setConnected(true); }).catch(() => {
      if (active) setError('Could not connect to Social Post Studio.');
    });
    return () => {
      active = false;
      appRef.current = null;
      void app.close();
    };
  }, []);

  useEffect(() => {
    if (!text.trim()) {
      setAnalysis(null);
      setAnalysisError('');
      setAnalysisLoading(false);
      return;
    }
    if (!connected || !appRef.current) return;
    let active = true;
    setAnalysisLoading(true);
    setAnalysisError('');
    const timer = window.setTimeout(() => {
      void appRef.current?.callServerTool({ name: 'analyze_caption', arguments: { text, platformId } })
        .then(result => {
          if (!active) return;
          if (result.isError || !result.structuredContent) throw new Error('Analysis failed');
          setAnalysis(result.structuredContent as CaptionAnalysis);
        })
        .catch(() => { if (active) { setAnalysis(null); setAnalysisError('Could not analyze this caption. Try editing it again.'); } })
        .finally(() => { if (active) setAnalysisLoading(false); });
    }, 500);
    return () => { active = false; window.clearTimeout(timer); };
  }, [connected, text, platformId]);

  async function copyCaption() {
    if (!text.trim()) {
      setError('Write a caption before copying.');
      return;
    }
    setError('');
    setNotice('');
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setNotice('Caption copied.');
        return;
      }
    } catch {
      // The host may deny clipboard access; select the text instead.
    }

    const preview = document.getElementById('caption-preview-text');
    const textarea = document.getElementById('draft-text') as HTMLTextAreaElement | null;
    if (preview) {
      const range = document.createRange();
      range.selectNodeContents(preview);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    } else {
      textarea?.focus();
      textarea?.select();
    }
    let copied = false;
    try {
      copied = document.execCommand('copy');
    } catch {
      // Some embedded hosts disallow automatic copying.
    }
    setNotice(copied ? 'Caption copied.' : 'Caption selected. Press Ctrl+C (or ⌘+C on Mac) to copy.');
  }

  const editorState = {
    selected: null,
    platformId,
    text,
    image: null,
    saving: false,
    imageReading: false,
    setImageReading: () => {},
    isDirty: false,
    editorVersion,
    setPlatformId,
    setText,
    setNotice,
    setError,
    changeImage: () => {},
    save: async (event: FormEvent) => { event.preventDefault(); },
  };

  return (
    <main className="mx-auto max-w-2xl p-1">
      {error && <p role="alert" className="mb-3 rounded-lg bg-[#fff0ef] p-3 text-sm text-[#a44f4f]">{error}</p>}
      {notice && <p role="status" className="mb-3 rounded-lg bg-[#eaf5ec] p-3 text-sm text-[#477c56]">{notice}</p>}
      <DraftEditor state={editorState} allowImages={false} captionMode />
      {text.trim() && <CaptionInsights analysis={analysis} loading={analysisLoading} error={analysisError} />}
      <div className="mt-3 flex justify-end">
        <button type="button" onClick={() => void copyCaption()} className="rounded-[9px] bg-[#254e41] px-[17px] py-[13px] text-[13px] font-bold text-white hover:bg-[#183e32]">Copy caption</button>
      </div>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<CaptionWidget />);
