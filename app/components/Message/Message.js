import React from "react";

export const Message = ({ role, content }) => {
  const isAssistant = role === "assistant";

  return (
    <div
      className={`flex w-full mb-4 ${
        isAssistant ? "justify-start" : "justify-end"
      }`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-4 ${
          isAssistant ? "bg-gray-100 text-gray-800" : "bg-blue-500 text-white"
        }`}
        style={{
          alignSelf: isAssistant ? "flex-start" : "flex-end",
        }}
      >
        <div className="prose prose-invert">{content}</div>
      </div>
    </div>
  );
};
