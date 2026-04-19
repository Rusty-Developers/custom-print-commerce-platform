export default function Spinner({ size = 'md', white = false, center = false }) {
  const cls = `spinner${size === 'sm' ? ' spinner-sm' : size === 'lg' ? ' spinner-lg' : ''}${white ? ' spinner-white' : ''}`
  if (center) return <div className="loading-container"><div className={cls} /></div>
  return <div className={cls} />
}
