export type CaptionAnalysis = {
  characters: number;
  words: number;
  hashtags: { total: number; unique: string[]; duplicates: string[] };
  links: { total: number; domains: string[] };
  tips: string[];
};

export function CaptionInsights({ analysis, loading, error }: { analysis: CaptionAnalysis | null; loading: boolean; error: string }) {
  return (
    <section aria-labelledby="caption-insights" className="mt-3 rounded-[15px] border border-[#e7ece8] bg-white p-5">
      <h2 id="caption-insights" className="font-[Manrope] text-base font-extrabold text-[#35453a]">Caption insights</h2>
      <p className="mt-1 text-xs text-[#718176]">Practical checks, not a prediction of views or engagement.</p>
      {loading && <p role="status" className="mt-3 text-sm text-[#718176]">Analyzing caption…</p>}
      {error && <p role="alert" className="mt-3 text-sm text-[#a44f4f]">{error}</p>}
      {analysis && !loading && !error && <>
        <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
          {([['Characters', analysis.characters], ['Hashtags', analysis.hashtags.total], ['Links', analysis.links.total]] as const).map(([label, value]) => (
            <div key={label} className="rounded-lg bg-[#f5faf5] p-3"><dt className="text-xs text-[#718176]">{label}</dt><dd className="mt-1 text-lg font-bold text-[#315a49]">{value}</dd></div>
          ))}
        </dl>
        {analysis.hashtags.unique.length > 0 && <p dir="auto" className="mt-4 break-words text-sm text-[#4c6052]"><strong>Hashtags:</strong> {analysis.hashtags.unique.join('  ')}</p>}
        {analysis.hashtags.duplicates.length > 0 && <p dir="auto" className="mt-2 break-words text-sm text-[#865b35]"><strong>Repeated:</strong> {analysis.hashtags.duplicates.join('  ')}</p>}
        {analysis.links.domains.length > 0 && <p className="mt-2 break-words text-sm text-[#4c6052]"><strong>Link domains:</strong> {analysis.links.domains.join(', ')}</p>}
        {analysis.tips.length > 0 && <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-[#4c6052]">{analysis.tips.map(tip => <li key={tip}>{tip}</li>)}</ul>}
      </>}
    </section>
  );
}
