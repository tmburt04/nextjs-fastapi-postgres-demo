'use server'

import React from 'react';
import { ChatThread } from "../types";
import { ViewThreadButton } from "../components/ViewThreadButton";
import CreateThreadButton from '../components/CreateThreadButton';

const API_URL = process.env.NEXT_PUBLIC_API_URL;


async function fetchThreads(userId: number): Promise<ChatThread[]> {
  try {
    const res = await fetch(`${API_URL}/threads/${userId}`, {
      // Revalidate the data every 10 seconds
      next: { revalidate: 10 }
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch threads: ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching threads:", error);
    return [];
  }
}

export const ThreadHistory = async () => {
  const threadList: ChatThread[] = await fetchThreads(1);

  return (
    <div>
      <div className="px-4 py-8">
        <div className='flex justify-between w-full'>
          <h1 className="text-3xl font-semibold mb-6">Chat History</h1>
          <div className="mb-8">
            <CreateThreadButton userId={1} />
          </div>
        </div>
        <div className="max-w-400px" style={{ width: '30vw', minWidth: '250px' }}>
          <div className="space-y-4">
            {threadList?.map((thread) => (
              <div
                key={thread.id}
                className="border rounded-lg p-4 shadow-sm max-w-full"
              >
                <div className="flex justify-between items-start">
                  <h2 className="text-lg font-medium">{thread.name}</h2>
                  <div className="text-sm text-gray-500">
                    {thread.created_date
                      ? new Date(thread.created_date).toLocaleDateString()
                      : <i>Date N/A</i>}
                  </div>
                </div>

                <div className="mt-2 text-sm text-gray-600">Thread ID: {thread.id}</div>
                <div className="mt-4 flex justify-end gap-4">
                  <ViewThreadButton threadId={thread.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreadHistory;
