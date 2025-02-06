'use server'

import {ChatThreadComponent} from "@/app/components/ChatThreadComponent";

export default async function ThreadConversation({ params }: {
  params: { id: string }
}) {
  const threadId = params.id;

  return (
    <div className="container mx-auto px-4 flex flex-col h-full">
      <header className="mb-4">
        <h1 className="text-3xl font-semibold">Thread {threadId}</h1>
      </header>
      <main className="flex-grow">
        <ChatThreadComponent threadId={threadId} authorId="1" />
      </main>
    </div>
  );
}
