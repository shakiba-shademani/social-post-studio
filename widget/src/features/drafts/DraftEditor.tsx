import { useState, type ChangeEvent } from 'react';
import { Check, ImagePlus, PenLine, X } from 'lucide-react';
import { PlatformSelector } from './PlatformSelector';
import { PostPreview } from './PostPreview';
import type { useDrafts } from './useDrafts';

type State = Pick<ReturnType<typeof useDrafts>,
  'selected' | 'platformId' | 'text' | 'image' | 'saving' | 'imageReading' |
  'setImageReading' | 'isDirty' | 'editorVersion' | 'setPlatformId' | 'setText' |
  'setNotice' | 'setError' | 'changeImage' | 'save'>;

export function DraftEditor({ state, allowImages = true, captionMode = false }: { state: State; allowImages?: boolean; captionMode?: boolean }) {
  const [view, setView] = useState<'write' | 'preview'>('write');
  const { selected, platformId, text, image, saving, imageReading, setImageReading, isDirty, editorVersion, setPlatformId, setText, setNotice, setError, changeImage, save } = state;

  function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 4 * 1024 * 1024) {
      setError('Choose a PNG, JPEG or WebP image up to 4 MiB.');
      return;
    }
    const reader = new FileReader();
    const version = ++editorVersion.current;
    setImageReading(true);
    reader.onload = () => {
      if (version === editorVersion.current && typeof reader.result === 'string') {
        changeImage(reader.result);
        setError('');
      }
    };
    reader.onerror = () => {
      if (version === editorVersion.current) {
        setImageReading(false);
        setError('Could not read this image. Please try again.');
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <section className="flex min-w-0 flex-col rounded-[15px] border border-[#e7ece8] bg-white">
      <div className="flex items-start justify-between px-[27px] pb-5 pt-[26px]">
        <div>
          <div className="mb-3 flex items-center gap-2 text-[10px] font-extrabold tracking-[1.2px] text-[#84a791]">
            <PenLine size={16} /> THE EDITOR
          </div>
          <h2 className="font-[Manrope] text-lg font-extrabold">{captionMode ? 'Your caption' : selected ? 'Edit your draft' : 'Create a draft'}</h2>
          <p className="mt-1.5 text-xs text-[#9ba69f]">Every great post begins with a thought.</p>
        </div>
        {!captionMode && <span role="status" className="rounded-md bg-[#f1f6f1] px-3 py-2 text-xs font-bold text-[#557360]">{isDirty ? 'Unsaved changes' : selected ? 'Saved' : 'New draft'}</span>}
      </div>
      <div className="flex gap-2 border-b border-[#edf1ed] px-[27px]" aria-label="Editor view">
        {(['write', 'preview'] as const).map(item => (
          <button key={item} type="button" aria-pressed={view === item} onClick={() => setView(item)}
            className={`border-b-2 px-4 py-3 text-sm font-semibold capitalize ${view === item ? 'border-[#315a49] text-[#315a49]' : 'border-transparent text-[#929d97]'}`}>
            {item}
          </button>
        ))}
      </div>
      <div hidden={view !== 'write'}>
        <form onSubmit={save} className="p-[27px]">
          <fieldset disabled={saving} className="min-w-0 disabled:opacity-70">
          {!captionMode && <PlatformSelector platformId={platformId} onChange={id => { setPlatformId(id); setNotice(''); }} />}
          <label htmlFor="draft-text" className={`${captionMode ? '' : 'mt-[30px] '}block text-[13px] font-bold text-[#394a40]`}>{captionMode ? 'Caption' : 'Your post'}</label>
          <p className="mb-3 mt-1 text-xs text-[#a2aea5]">Let the ideas flow.</p>
          <textarea id="draft-text" dir="auto" value={text} onChange={event => { setText(event.target.value); setNotice(''); }} placeholder="What's on your mind?"
            className="min-h-[168px] w-full resize-y rounded-[10px] border border-[#e5ebe5] bg-[#fcfdfb] p-[15px] text-sm leading-relaxed text-[#35453a] placeholder:text-[#bbc5bd]" />
          {allowImages && <div className="mt-4">
            <label htmlFor="draft-image" className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#dce7dd] px-3 py-2 text-sm font-semibold text-[#426b53]"><ImagePlus size={17} />{image ? 'Replace image' : 'Add image'}</label>
            <input id="draft-image" type="file" accept="image/png,image/jpeg,image/webp" onChange={selectImage} className="sr-only" />
            <span className="ml-3 text-xs text-[#899b8e]">PNG, JPEG or WebP · up to 4 MiB</span>
            {image && <div className="mt-3 flex items-start gap-3"><img src={image} alt="Selected draft attachment" className="max-h-36 max-w-[180px] rounded-lg object-contain" /><button type="button" onClick={() => changeImage(null)} aria-label="Remove image" className="rounded-md p-1 text-[#7d8e82] hover:bg-[#f1f6f1]"><X size={18}/></button></div>}
          </div>}
          <div className="flex items-center justify-between gap-2.5 pt-5 text-xs text-[#a1ada4]">
            <span>{captionMode ? [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)].length : text.length} characters</span>
            {!captionMode && <button disabled={saving || imageReading} type="submit" className="inline-flex items-center gap-2.5 rounded-[9px] bg-[#254e41] px-[17px] py-[13px] text-[13px] font-bold text-white hover:bg-[#183e32] disabled:opacity-60">{saving ? 'Saving…' : imageReading ? 'Reading image…' : selected ? 'Save changes' : 'Save draft'} <Check size={16}/></button>}
          </div>
          </fieldset>
        </form>
      </div>
      {view === 'preview' && <PostPreview platformId={platformId} text={text} image={image} captionMode={captionMode} onPlatformChange={captionMode ? id => { setPlatformId(id); setNotice(''); } : undefined} />}
    </section>
  );
}
