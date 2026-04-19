import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="not-found-page page-enter">
      <div className="not-found-code">404</div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 36, fontWeight: 800, color: 'var(--text-dark)', marginBottom: 12, marginTop: -20 }}>
        Page Not Found
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 32, maxWidth: 400, textAlign: 'center', lineHeight: 1.7 }}>
        The page you're looking for doesn't exist or has been moved. Let's get you back on track!
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/')}>Go Home →</button>
        <button className="btn btn-outline" onClick={() => navigate('/products')}>Browse Products</button>
      </div>
    </div>
  )
}
