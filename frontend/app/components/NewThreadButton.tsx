'use client'
import { useRouter } from "next/navigation"

export const NewThreadButton = () => {
  const router = useRouter()
  const handleSelect = () => {
    return router.push(`/thread-conversation/new`)
  }
  return (
    <button onClick={() => handleSelect()} className="px-4 py-2 text-sm bg-gray-700 rounded-md border border-gray-200 hover:bg-gray-900 transition-all duration-200 active:transform active:scale-95">
      New
    </button>
  )
}