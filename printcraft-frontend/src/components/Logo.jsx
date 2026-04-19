export default function Logo({ size = 28, color = '#8B0000' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="28" height="28" rx="4" stroke={color} strokeWidth="2.2"/>
        <rect x="6" y="6" width="20" height="20" rx="2" fill={color} opacity="0.12"/>
        <rect x="9" y="9" width="14" height="14" rx="1.5" fill={color} opacity="0.25"/>
        <path d="M13 13 L19 13 L19 16 L16 19 L13 19 Z" fill={color} opacity="0.7"/>
        <circle cx="22" cy="10" r="2.5" fill={color}/>
      </svg>
      <span style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: size,
        fontWeight: 700,
        color,
        letterSpacing: '-0.01em',
        lineHeight: 1,
      }}>PrintCraft</span>
    </div>
  )
}
