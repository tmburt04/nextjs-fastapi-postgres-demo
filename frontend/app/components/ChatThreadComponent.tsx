'use client'

import React, { useEffect, useState } from "react";
import { ChatThreadMessage } from "../types";
import MessageBubbleList from "./MessageBubbleList";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ChatThreadComponentProps {
  threadId: string;
  authorId: string;
}

export const ChatThreadComponent = ({ threadId, authorId }: ChatThreadComponentProps) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatThreadMessage[]>([]);

  // Fetch the initial messages when the component mounts.
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API_URL}/thread-messages/${threadId}`);
        if (!res.ok) throw new Error("Failed to fetch messages");
        const data: ChatThreadMessage[] = await res.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [threadId]);

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Create a user message.
    const userMessage: ChatThreadMessage = {
      content: input,
      role: "user",
      author_id: authorId,
      created_date: Date.now()
    };

    // Add the user's message.
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content, thread_id: threadId, author_id: authorId })
      });

      if (!response.body) throw new Error("ReadableStream not supported");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let accumulatedText = "";

      // Add a placeholder for the bot's message.
      setMessages((prev) => [
        ...prev,
        { content: "", role: "bot", author_id: "bot", created_date: Date.now() }
      ]);

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        // Use the { stream: !done } option for incremental decoding.
        const chunk = decoder.decode(value, { stream: !done });
        accumulatedText += chunk;

        // Update the bot placeholder message.
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: accumulatedText
          };
          return updated;
        });
      }
    } catch (error) {
      console.error("Error streaming message:", error);
      setMessages((prev) => [
        ...prev,
        {
          content: "Error: Unable to retrieve a response.",
          role: "bot",
          author_id: "bot",
          created_date: Date.now()
        }
      ]);
    }
  };

  return (
    <div className="container mx-auto">
      <div
        style={{
          border: "1px solid #ccc",
          padding: "1rem",
          height: "75vh",
          overflowY: "auto",
          marginBottom: "1rem",
        }}
      >
        <MessageBubbleList messageList={messages} />
      </div>
      <form onSubmit={handleSend} style={{ display: "flex", color: "black" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{ flexGrow: 1, padding: "0.5rem", fontSize: "1rem" }}
        />
        <button type="submit" className="px-4 py-2 bg-gray-800 text-white">
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatThreadComponent;
