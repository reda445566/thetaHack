export default function OracleMark({ size = 20, pulsing = false, color = "#c9a468" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M16 8C10 8 5.5 12 4 16C5.5 20 10 24 16 24C22 24 26.5 20 28 16C26.5 12 22 8 16 8Z"
        stroke={color}
        strokeWidth="1.6"
      />
      <circle
        cx="16"
        cy="16"
        r="4.5"
        stroke={color}
        strokeWidth="1.6"
        className={pulsing ? "animate-pulse" : ""}
      />
      <circle cx="16" cy="16" r="1.4" fill={color} />
    </svg>
  );
}
