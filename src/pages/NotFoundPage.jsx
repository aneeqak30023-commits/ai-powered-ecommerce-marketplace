import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-[100px]">
      <div className="text-center">
        <div className="text-8xl font-bold text-[#4F46E5] mb-4">404</div>
        <h1 className="text-3xl font-bold text-[#0F172A] mb-4">Page Not Found</h1>
        <p className="text-[#475569] mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
        </p>
        <Link
          to="/"
          className="inline-block bg-[#4F46E5] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#4338CA] transition-colors"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  )
}
