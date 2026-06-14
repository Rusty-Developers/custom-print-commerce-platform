export default function Logo({ size = 28 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <img
        src="/mk-group-logo.png"
        alt="MK Group Printing"
        style={{ height: size * 1.8, maxHeight: 52, width: 'auto', objectFit: 'contain', display: 'block' }}
      />
    </div>
  )
}
