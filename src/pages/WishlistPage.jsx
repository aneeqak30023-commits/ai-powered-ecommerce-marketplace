import WishlistPage from '../components/wishlist/WishlistPage'

const C = {
  background: '#F8FAFC'
}

export default function WishlistPageWrapper() {
  return (
    <div style={{ minHeight: '100vh', background: C.background }}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <WishlistPage />
      </div>
    </div>
  )
}
