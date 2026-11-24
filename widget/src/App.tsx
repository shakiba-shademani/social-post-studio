import { Check, Plus, X } from 'lucide-react';
import { DraftList } from './features/drafts/DraftList';
import { DraftEditor } from './features/drafts/DraftEditor';
import { Sidebar } from './components/Sidebar';
import { useDrafts } from './features/drafts/useDrafts';

export function App() {
  const state = useDrafts();
  const { drafts, error, notice, setError, newDraft } = state;
  return <div className="flex min-h-screen">
    <Sidebar count={drafts.length} />
    <main className="min-w-0 flex-1">
      <header className="flex h-[68px] items-center justify-between border-b border-[#e6ebe7] bg-white/65 px-12 text-[13px] text-[#9ba59e] max-[600px]:px-[18px]"><span>Workspace <span className="mx-3 text-[#c8d0cb]">/</span> <strong>Drafts</strong></span><span className="flex items-center gap-4 text-[10px] font-bold tracking-[1.2px] max-[600px]:text-[0px]">YOUR CREATIVE SPACE <span className="grid size-[30px] place-items-center rounded-full bg-[#e4eee5] text-xs font-extrabold text-[#58816a]">S</span></span></header>
      <div className="mx-auto max-w-[1500px] px-12 pb-[25px] pt-[53px] max-[1050px]:px-7 max-[600px]:px-4">
        <div className="mb-[35px] flex items-end justify-between gap-5 max-[600px]:flex-col max-[600px]:items-start"><div><div className="flex items-center gap-2 text-[10px] font-extrabold tracking-[1.6px] text-[#71917d]"><span className="size-[7px] rounded-full bg-[#80ad8a]" /> YOUR WORKSPACE</div><h1 className="my-3 font-[Manrope] text-[clamp(30px,3.2vw,43px)] font-extrabold leading-[1.15] tracking-[-2px]">Ideas start here<span className="text-[#78a78a]">.</span></h1><p className="text-sm text-[#8a9690]">Write it down, shape it up, share it when you're ready.</p></div><button className="inline-flex items-center justify-center gap-2.5 rounded-[9px] bg-[#254e41] px-[17px] py-[13px] text-[13px] font-bold text-white hover:bg-[#183e32] max-[600px]:w-full" onClick={newDraft}><Plus size={17} /> New draft</button></div>
        {error && <div className="mb-4 flex items-center gap-2 rounded-[9px] bg-[#fff0ef] px-[15px] py-3 text-[13px] text-[#a44f4f]" role="alert">{error}<button className="ml-auto" onClick={() => setError('')} aria-label="Dismiss error"><X size={16}/></button></div>}
        {notice && <div className="mb-4 flex items-center gap-2 rounded-[9px] bg-[#eaf5ec] px-[15px] py-3 text-[13px] text-[#477c56]" role="status"><Check size={16}/>{notice}</div>}
        <div className="grid grid-cols-[minmax(0,.95fr)_minmax(0,1.05fr)] gap-[22px] max-[1050px]:grid-cols-1">
          <DraftList state={state} />
          
            <DraftEditor state={state} />
            
        </div><footer className="pt-8 text-center text-[9px] font-bold tracking-[1.5px] text-[#bdc8bf]">MADE FOR YOUR NEXT GOOD IDEA <span className="ml-[5px] text-[#91b79b]">✳</span></footer>
      </div>
    </main>
  </div>;
}





