import newLogo from '../assets/logopiv/newlogo1.jpeg'

export default function Logo({ size = 28 }) {
  const dim = Math.round(size * 2.4)
  return (
    <img
      src={newLogo}
      alt="MK GROUP Printing"
      width={dim}
      height={dim}
      style={{ objectFit: 'contain', display: 'block', borderRadius: 6 }}
    />
  )
}
