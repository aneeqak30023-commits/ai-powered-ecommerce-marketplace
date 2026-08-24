import Header from './Header.jsx'
import Footer from './Footer.jsx'

const C = { background: '#F8FAFC' }

export default function Layout({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: C.background }}>
      <Header />
      <main style={{ flexGrow: 1, width: '100%' }}>
        {children}
      </main>
      <Footer />
    </div>
  )
}
