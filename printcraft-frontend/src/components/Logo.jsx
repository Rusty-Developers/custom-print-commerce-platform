export default function Logo({ size = 28 }) {
  const height = Math.min(size * 1.8, 52)
  return (
    <img
      src="/mk-group-logo.jpg"
      alt="MK Group Printing"
      width={Math.round(height * 2.7)}
      height={height}
      style={{ objectFit: 'contain', display: 'block' }}
    />
  )
}
