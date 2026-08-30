import Header from './Header.jsx'
import Footer from './Footer.jsx'

export default function Layout({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F8FAFC' }}>
      <Header />
      <main style={{ flexGrow: 1, width: '100%' }}>
        {children}
      </main>
      <Footer />
    </div>
  )
}
