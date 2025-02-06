import React from "react";
import { ChatThreadMessage } from "../types";

export interface MessageBubbleListProps {
  messageList: ChatThreadMessage[];
}

const MessageBubbleList = ({ messageList }: MessageBubbleListProps) => {
  const formatDate = (msg: ChatThreadMessage) => {
    return msg.created_date;
  };

  const isUser = (msg: ChatThreadMessage) => msg.role === "user";

  return (
    <div>
      {messageList.map((msg, i) => (
        <div
          key={`chat-msg-${i}`}
          className={`p-2 max-w-2xl w-full ${isUser(msg) ? "ml-auto" : "mr-auto"}`}
        >
          <div
            className={`
              p-4 rounded-xl shadow-sm
              ${isUser(msg) ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"}
              max-w-[80%]
            `}
          >
            <div className="text-base mb-2">{msg.content}</div>
            <div
              className={`
                flex justify-between items-center text-xs
                ${isUser(msg) ? "text-blue-50" : "text-gray-600"}
              `}
            >
              <span className="font-medium">
                {isUser(msg)
                  ? "You"
                  : !msg?.role ? 'BOT' : msg.role.charAt(0).toUpperCase() + msg.role.slice(1)}
              </span>
              <span className={isUser(msg) ? "text-blue-100" : "text-gray-500"}>
                {formatDate(msg)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageBubbleList;
