'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Bir Hata Oluştu</h2>
        <p className="text-gray-700 mb-4">{error.message}</p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Tekrar Dene
        </button>
      </div>
    </div>
  )
}

