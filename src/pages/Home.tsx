import { useNavigate } from 'react-router-dom'
import '../styles/pages/Home.scss'

export function Home() {
  const navigate = useNavigate()

  return (
    <div className="home">
      <section className="hero">
        <h1>Find Your Perfect Bandmates</h1>
        <p className="hero__subtitle">
          Connect with musicians, form bands, and collaborate effortlessly
        </p>
        <div className="hero__actions">
          <button className="button button--primary">Get Started</button>
          <button
            className="button button--secondary"
            onClick={() => navigate('/search')}
          >
            Browse Musicians
          </button>
        </div>
      </section>
    </div>
  )
}
