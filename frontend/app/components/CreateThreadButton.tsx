'use client'

import React, { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface CreateThreadButtonProps {
  userId: number | string;
  onThreadCreated?: () => void;
}

export const CreateThreadButton: React.FC<CreateThreadButtonProps> = ({ userId, onThreadCreated }) => {
  const [showForm, setShowForm] = useState(false);
  const [threadName, setThreadName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/thread`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: threadName, owner_id: userId }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Reset the form state
      setThreadName("");
      setShowForm(false);

      if (onThreadCreated) {
        onThreadCreated();
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
      location.reload();
    }
  };

  return (
    <div className="my-4">
<button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Create Thread
        </button>
      {showForm && (
        <div className='fixed inset-0 bg-black/75'>
        <div className='p-8 bg-slate-600 max-w-md mx-auto mt-20 rounded-lg'>
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <input
              type="text"
              value={threadName}
              onChange={(e) => setThreadName(e.target.value)}
              placeholder="Thread Name"
              className="border p-2 rounded text-black"
              required
            />
            {error && <div className="text-red-500">{error}</div>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                {loading ? "Creating..." : "Create"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
        </div>
      )}
    </div>
  );
};

export default CreateThreadButton;
