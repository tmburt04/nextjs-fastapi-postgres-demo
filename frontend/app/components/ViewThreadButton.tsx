'use client'
import { useRouter } from "next/navigation"

export const ViewThreadButton = ({ threadId }: { threadId: string | number }) => {

  const router = useRouter()
  const handleThreadSelect = (threadId: number | string) => {
    return router.push(`/thread-conversation/${threadId}`)
  }
  return (
    <button onClick={() => handleThreadSelect(threadId)} className="px-4 py-2 text-sm bg-gray-700 rounded-md border border-gray-200 hover:bg-gray-900 transition-all duration-200 active:transform active:scale-95">
      View Messages
    </button>
  )
}