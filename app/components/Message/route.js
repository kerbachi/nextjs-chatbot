// import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import ReactMarkdown from "react-markdown";
import React from "react";

export const Message = ({ role, content }) => {
  const isAssistant = role === "assistant";

  return (
    <div
      className={`flex w-full ${
        isAssistant ? "justify-start" : "justify-end"
      } mb-4`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-4 ${
          isAssistant ? "bg-gray-100 text-gray-800" : "bg-blue-500 text-white"
        }`}
      >
        <div className="prose prose-invert">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
