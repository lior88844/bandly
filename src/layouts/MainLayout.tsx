import { ReactNode } from 'react'
import { Header } from '../components/Header'
import '../styles/layouts/MainLayout.scss'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="layout">
      <Header />
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
