import { Eye } from 'lucide-react';
import { platforms } from './types';
import { PlatformSelector } from './PlatformSelector';

type Props = {
  platformId: number;
  text: string;
  image: string | null;
  captionMode?: boolean;
  onPlatformChange?: (platformId: number) => void;
};

export function PostPreview({ platformId, text, image, captionMode = false, onPlatformChange }: Props) {
  const platform = platforms.find(item => item.id === platformId);

  return (
    <section aria-labelledby="preview-heading" className="rounded-[15px] border border-[#e7ece8] bg-white p-[27px]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id="preview-heading" className="font-[Manrope] text-lg font-extrabold tracking-[-.5px]">Post preview</h2>
          <p className="mt-1.5 text-xs text-[#9ba69f]">A simple preview of your {captionMode ? 'caption' : 'draft'}</p>
        </div>
        <Eye size={19} className="text-[#a6b7aa]" aria-hidden="true" />
      </div>
      {onPlatformChange && <div className="mt-5"><PlatformSelector platformId={platformId} onChange={onPlatformChange} /></div>}
      <div className="mt-5 rounded-xl border border-[#e9eee9] bg-[#fcfdfb] p-5">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className={`grid size-10 shrink-0 place-items-center rounded-xl text-lg font-extrabold ${platform?.color ?? ''}`}>{platform?.mark}</span>
          <div>
            <p className="text-sm font-bold text-[#394a40]">{platform?.name ?? 'Unknown platform'}</p>
            <p className="mt-0.5 text-xs text-[#98a59b]">{captionMode ? 'Caption preview' : 'Draft preview'}</p>
          </div>
        </div>
        <p id={captionMode ? 'caption-preview-text' : undefined} dir="auto" className={`mt-5 min-h-20 whitespace-pre-wrap break-words text-sm leading-relaxed ${text.trim() ? 'text-[#35453a]' : 'text-[#aab6ad]'}`}>
          {text.trim() ? text : 'Your post will appear here as you write.'}
        </p>
        {image && <img src={image} alt="Attached to this draft" className="mt-4 max-h-96 w-full rounded-lg object-contain" />}
      </div>
    </section>
  );
}
