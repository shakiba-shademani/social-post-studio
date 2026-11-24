import { LayoutGrid, Sparkles } from 'lucide-react';

export function Sidebar({ count }: { count: number }) {
  return (
    <aside className="hidden w-[232px] shrink-0 flex-col border-r border-[#e7ebe8] bg-white px-[18px] pb-5 pt-[31px] min-[601px]:flex max-[1050px]:w-[190px]">
      <div className="flex items-center gap-2.5 px-2 font-[Manrope] text-[23px] font-extrabold leading-[.85] tracking-[-1px]"><span className="grid size-[35px] place-items-center rounded-[11px] bg-[#244c40] text-white"><Sparkles size={19} /></span><span>social<span className="text-[#6d9f8b]">.</span><small className="mt-[7px] block font-sans text-[10px] font-semibold uppercase tracking-[2px] text-[#8a9690]">post studio</small></span></div>
      <div className="mb-[13px] ml-2.5 mt-[62px] text-[10px] font-bold tracking-[1.5px] text-[#9aa59f]">WORKSPACE</div>
      <div className="flex items-center gap-[11px] rounded-[9px] bg-[#edf4ef] p-3 text-sm font-bold text-[#315a49]"><LayoutGrid size={18} /> Drafts <span className="ml-auto text-xs text-[#739281]">{count}</span></div>
      <div className="mt-auto"><div className="rounded-xl border border-[#e8f0e9] bg-[#f1f6f1] p-4 text-[#547963]"><Sparkles size={17} /><strong className="mt-3 block text-[13px] leading-[1.4] text-[#334c3b]">A little space for big ideas.</strong><p className="mt-[5px] text-xs leading-relaxed text-[#84988a]">Keep your thoughts close until they're ready to share.</p></div><div className="mx-1 mt-6 flex items-center gap-2.5 text-xs font-bold"><span className="grid size-[34px] place-items-center rounded-full bg-[#e4eee5] font-extrabold text-[#58816a]">S</span><span>Studio workspace<small className="mt-[3px] block text-[11px] font-normal text-[#99a49d]">Personal space</small></span></div></div>
    </aside>
  );
}


