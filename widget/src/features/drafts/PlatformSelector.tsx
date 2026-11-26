import { Check } from 'lucide-react';
import { platforms } from './types';

type Props = {
  platformId: number;
  onChange: (platformId: number) => void;
};

export function PlatformSelector({ platformId, onChange }: Props) {
  return (
    <fieldset>
      <legend className="text-[13px] font-bold text-[#394a40]">Choose a platform</legend>
      <p className="mb-[13px] mt-[5px] text-xs text-[#a2aea5]">Where is this post going?</p>
      <div className="grid grid-cols-4 gap-2 max-[600px]:grid-cols-2">
        {platforms.map(item => (
          <button type="button" key={item.id} onClick={() => onChange(item.id)} aria-pressed={platformId === item.id}
            className={`relative flex min-h-[84px] flex-col items-center justify-center gap-[7px] rounded-[9px] border text-[11px] font-semibold ${platformId === item.id ? 'border-[#86ad92] bg-[#f5faf5] text-[#416650]' : 'border-[#e9ede9] text-[#7b8980]'}`}>
            <span className={`grid size-[33px] place-items-center rounded-[9px] text-lg font-extrabold ${item.color}`}>{item.mark}</span>
            <span>{item.name}</span>
            {platformId === item.id && <Check size={14} className="absolute right-[7px] top-[7px] text-[#6c9c79]" />}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
