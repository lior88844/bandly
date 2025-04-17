import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import '../styles/components/Header.scss'

export function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, userData, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {}
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const query = formData.get('search')
    if (query) {
      navigate(`/search?q=${encodeURIComponent(query.toString())}`)
    }
  }

  // Get the current search query from URL
  const currentSearchQuery = searchParams.get('q') || ''

  return (
    <header className="header">
      <div className="logo-container">
        <Link to="/" className="logo">
          Bandly
        </Link>
      </div>
      <div className="nav-container">
        <ul className="nav">
          <li className="nav__item">
            <Link to="/" className="nav__link">
              Home
            </Link>
          </li>
          <li className="nav__item">
            <form className="search-form" onSubmit={handleSearch}>
              <input
                type="search"
                name="search"
                className="search-input"
                placeholder="Find your musician..."
                aria-label="Search musicians"
                defaultValue={currentSearchQuery}
              />
              <button type="submit" className="search-button">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="search-icon"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </form>
          </li>
          {user && (
            <li className="nav__item">
              <Link to="/messages" className="nav__link">
                Messages
              </Link>
            </li>
          )}
        </ul>
        <nav className="user-menu">
          <div className="user-menu__links">
            {user && userData ? (
              <div className="user-menu">
                <span className="user-menu__name">{userData.username}</span>
                <button onClick={handleLogout} className="button">
                  Log Out
                </button>
              </div>
            ) : location.pathname === '/login' ? (
              <Link to="/signup" className="button button--primary">
                Sign Up
              </Link>
            ) : location.pathname === '/signup' ? (
              <Link to="/login" className="button button--primary">
                Log In
              </Link>
            ) : (
              <>
                <Link to="/login" className="button">
                  Log In
                </Link>
                <Link to="/signup" className="button button--primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
