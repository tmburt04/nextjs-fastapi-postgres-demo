'use client'
import React from 'react';
import { useRouter } from "next/navigation";

export const ChatHistoryButton = () => {
  const router = useRouter()
  const handleSelect = () => {
    return router.push(`/`)
  }
  return (
    <button onClick={() => handleSelect()} className="px-4 py-2 text-sm bg-gray-700 rounded-md border border-gray-200 hover:bg-gray-900 transition-all duration-200 active:transform active:scale-95">
      Home
    </button>
  )
}