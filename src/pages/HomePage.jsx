import Hero from '../components/home/Hero'
import FeaturedCategories from '../components/home/FeaturedCategories'
import FeaturedProducts from '../components/home/FeaturedProducts'
import products from '../data/products.json'
import categories from '../data/categories.json'
import { useCart } from '../context/CartContext'

export default function HomePage() {
  const featuredProducts = products.slice(0, 8)
  const { addToCart } = useCart()

  return (
    <div>
      <Hero />
      <section className="py-[60px]">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FeaturedCategories categories={categories} />
        </div>
      </section>
      <section className="pb-[60px]">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-[#0F172A]">
            Featured Products
          </h2>
          <FeaturedProducts products={featuredProducts} onAddToCart={addToCart} />
        </div>
      </section>
      <section className="pb-[60px]">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-[#0F172A]">
            Why Choose NexMart
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 text-center">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-2 text-[#0F172A]">AI Assistant</h3>
              <p className="text-[#475569]">Get personalized recommendations and instant support from our intelligent AI.</p>
            </div>
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 text-center">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-xl font-semibold mb-2 text-[#0F172A]">Fast Delivery</h3>
              <p className="text-[#475569]">Same-day and next-day delivery options available across all regions.</p>
            </div>
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2 text-[#0F172A]">Best Prices</h3>
              <p className="text-[#475569]">Competitive pricing with exclusive deals and member-only discounts.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
