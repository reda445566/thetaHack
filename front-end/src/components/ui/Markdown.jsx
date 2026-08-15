function parseFormattedText(text) {
  if (!text) return "";
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={idx} className="font-semibold text-ora-text">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export default function Markdown({ text }) {
  if (!text) return null;
  const segments = text.split(/```([\s\S]*?)```/g);
  return (
    <div className="flex flex-col gap-2">
      {segments.map((seg, i) =>
        i % 2 === 1 ? (
          <pre
            key={i}
            className="m-0 overflow-x-auto rounded-xl border border-ora-border bg-ora-raised px-3.5 py-2.5 font-mono text-[13px] text-ora-text"
          >
            <code>{seg.trim()}</code>
          </pre>
        ) : (
          seg.split("\n").map((line, j) => {
            const trimmed = line.trim();
            if (!trimmed) return null;

            if (trimmed === "---") {
              return <hr key={`${i}-${j}`} className="my-2 border-ora-border opacity-60" />;
            }

            const header3 = trimmed.match(/^###\s+(.*)/);
            if (header3) {
              return (
                <h3 key={`${i}-${j}`} className="mt-3 mb-1 text-base font-bold text-[#c9a468]">
                  {parseFormattedText(header3[1])}
                </h3>
              );
            }

            const header2 = trimmed.match(/^##\s+(.*)/);
            if (header2) {
              return (
                <h2 key={`${i}-${j}`} className="mt-4 mb-1 text-lg font-bold text-ora-text">
                  {parseFormattedText(header2[1])}
                </h2>
              );
            }

            const bullet = trimmed.match(/^[-*]\s+(.*)/);
            if (bullet) {
              return (
                <div key={`${i}-${j}`} className="flex gap-2 pl-2 text-[15px] leading-relaxed">
                  <span className="text-[#c9a468]">•</span>
                  <span>{parseFormattedText(bullet[1])}</span>
                </div>
              );
            }

            const numbered = trimmed.match(/^\d+\.\s+(.*)/);
            if (numbered) {
              return (
                <div key={`${i}-${j}`} className="text-[15px] leading-relaxed pl-2">
                  {parseFormattedText(trimmed)}
                </div>
              );
            }

            return (
              <p key={`${i}-${j}`} className="m-0 text-[15px] leading-relaxed text-ora-text">
                {parseFormattedText(trimmed)}
              </p>
            );
          })
        )
      )}
    </div>
  );
}

