'use server'

import { User } from "../types";
import { ChatHistoryButton } from "./ChatHistoryButton";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function fetchUser(): Promise<User> {
  try {
    const res = await fetch(`${API_URL}/users/me`, {
      // Revalidate the data every 10 seconds
      next: { revalidate: 10 }
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch user: ${res.status}`);
    }
    const data = await res.json();
    console.warn(data)
    return data;
  } catch (error) {
    console.error("Error fetching user:", error);
    return {name: "Guest"};
  }
}

export const AppHeader = async () => {
  const user = await fetchUser()
  return (
    <header className="container mx-auto p-4 flex justify-between align-center">
      <div>
        <ChatHistoryButton />
      </div>
      <p>Hello, {user.name}!</p>
    </header>
  )
}