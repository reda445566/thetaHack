export default function Markdown({ text }) {
  const segments = text.split(/```([\s\S]*?)```/g);
  return (
    <div className="flex flex-col gap-2">
      {segments.map((seg, i) =>
        i % 2 === 1 ? (
          <pre
            key={i}
            className="m-0 overflow-x-auto rounded-xl border border-ora-border bg-ora-raised px-3 py-2.5 font-mono text-[13px] text-ora-text"
          >
            <code>{seg.trim()}</code>
          </pre>
        ) : (
          seg.split("\n").map((line, j) => {
            const trimmed = line.trim();
            if (!trimmed) return null;
            const bullet = trimmed.match(/^-\s+(.*)/);
            const numbered = trimmed.match(/^\d+\.\s+(.*)/);
            if (bullet) {
              return (
                <div key={`${i}-${j}`} className="flex gap-2 pl-1 text-[15px] leading-relaxed">
                  <span className="text-ora-text-tertiary">•</span>
                  <span>{bullet[1]}</span>
                </div>
              );
            }
            if (numbered) {
              return (
                <div key={`${i}-${j}`} className="text-[15px] leading-relaxed pl-1">
                  {trimmed}
                </div>
              );
            }
            return (
              <p key={`${i}-${j}`} className="m-0 text-[15px] leading-relaxed">
                {trimmed}
              </p>
            );
          })
        )
      )}
    </div>
  );
}
