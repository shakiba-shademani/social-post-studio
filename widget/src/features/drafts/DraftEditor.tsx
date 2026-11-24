import { useState, type ChangeEvent } from 'react';
import { Check, ImagePlus, PenLine, X } from 'lucide-react';
import { platforms } from './types';
import { PostPreview } from './PostPreview';
import type { useDrafts } from './useDrafts';

type State = ReturnType<typeof useDrafts>;

export function DraftEditor({ state }: { state: State }) {
  const [view, setView] = useState<'write' | 'preview'>('write');
  const { selected, platformId, text, image, saving, setPlatformId, setText, setNotice, setError, changeImage, save } = state;

  function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 4 * 1024 * 1024) {
      setError('Choose a PNG, JPEG or WebP image up to 4 MiB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        changeImage(reader.result);
        setError('');
      }
    };
    reader.onerror = () => setError('Could not read this image. Please try again.');
    reader.readAsDataURL(file);
  }

  return (
    <section className="flex min-w-0 flex-col rounded-[15px] border border-[#e7ece8] bg-white">
      <div className="flex items-start justify-between px-[27px] pb-5 pt-[26px]">
        <div>
          <div className="mb-3 flex items-center gap-2 text-[10px] font-extrabold tracking-[1.2px] text-[#84a791]">
            <PenLine size={16} /> THE EDITOR
          </div>
          <h2 className="font-[Manrope] text-lg font-extrabold">{selected ? 'Edit your draft' : 'Create a draft'}</h2>
          <p className="mt-1.5 text-xs text-[#9ba69f]">Every great post begins with a thought.</p>
        </div>
        <span className="rounded-md bg-[#f1f6f1] px-3 py-2 text-[10px] font-bold text-[#7c9a82]">DRAFT</span>
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
          <fieldset>
            <legend className="text-[13px] font-bold text-[#394a40]">Choose a platform</legend>
            <p className="mb-[13px] mt-[5px] text-xs text-[#a2aea5]">Where is this post going?</p>
            <div className="grid grid-cols-4 gap-2 max-[600px]:grid-cols-2">
              {platforms.map(item => (
                <button type="button" key={item.id} onClick={() => { setPlatformId(item.id); setNotice(''); }} aria-pressed={platformId === item.id}
                  className={`relative flex min-h-[84px] flex-col items-center justify-center gap-[7px] rounded-[9px] border text-[11px] font-semibold ${platformId === item.id ? 'border-[#86ad92] bg-[#f5faf5] text-[#416650]' : 'border-[#e9ede9] text-[#7b8980]'}`}>
                  <span className={`grid size-[33px] place-items-center rounded-[9px] text-lg font-extrabold ${item.color}`}>{item.mark}</span>
                  <span>{item.name}</span>
                  {platformId === item.id && <Check size={14} className="absolute right-[7px] top-[7px] text-[#6c9c79]"/>}
                </button>
              ))}
            </div>
          </fieldset>
          <label htmlFor="draft-text" className="mt-[30px] block text-[13px] font-bold text-[#394a40]">Your post</label>
          <p className="mb-3 mt-1 text-xs text-[#a2aea5]">Let the ideas flow.</p>
          <textarea id="draft-text" value={text} onChange={event => { setText(event.target.value); setNotice(''); }} placeholder="What's on your mind?"
            className="min-h-[168px] w-full resize-y rounded-[10px] border border-[#e5ebe5] bg-[#fcfdfb] p-[15px] text-sm leading-relaxed text-[#35453a] placeholder:text-[#bbc5bd]" />
          <div className="mt-4">
            <label htmlFor="draft-image" className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#dce7dd] px-3 py-2 text-sm font-semibold text-[#426b53]"><ImagePlus size={17} />{image ? 'Replace image' : 'Add image'}</label>
            <input id="draft-image" type="file" accept="image/png,image/jpeg,image/webp" onChange={selectImage} className="sr-only" />
            <span className="ml-3 text-xs text-[#899b8e]">PNG, JPEG or WebP · up to 4 MiB</span>
            {image && <div className="mt-3 flex items-start gap-3"><img src={image} alt="Selected draft attachment" className="max-h-36 max-w-[180px] rounded-lg object-contain" /><button type="button" onClick={() => changeImage(null)} aria-label="Remove image" className="rounded-md p-1 text-[#7d8e82] hover:bg-[#f1f6f1]"><X size={18}/></button></div>}
          </div>
          <div className="flex items-center justify-between gap-2.5 pt-5 text-xs text-[#a1ada4]">
            <span>{text.length} characters</span>
            <button disabled={saving} type="submit" className="inline-flex items-center gap-2.5 rounded-[9px] bg-[#254e41] px-[17px] py-[13px] text-[13px] font-bold text-white hover:bg-[#183e32] disabled:opacity-60">{saving ? 'Saving…' : selected ? 'Save changes' : 'Save draft'} <Check size={16}/></button>
          </div>
        </form>
      </div>
      {view === 'preview' && <PostPreview platformId={platformId} text={text} image={image} />}
    </section>
  );
}
