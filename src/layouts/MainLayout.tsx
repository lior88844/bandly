import { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import '../styles/layouts/MainLayout.scss'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, userData, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {}
  }

  return (
    <div className="layout">
      <header className="header">
        <div className="container">
          <nav className="nav">
            <Link to="/" className="logo">
              Bandly
            </Link>
            <div className="nav__links">
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
      <main className="main">
        <div className="container">{children}</div>
      </main>
      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Bandly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
