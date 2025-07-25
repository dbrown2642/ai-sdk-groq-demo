"use client";

import { Chat, useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState(
    "meta-llama/llama-4-maverick-17b-128e-instruct",
  );

  const { messages, sendMessage, status } = useChat({
    chat: new Chat({
      messages: [],
      transport: new DefaultChatTransport({
        api: "/api/ai-chats",
        body: {
          selectedModelId: selectedModel,
        },
      }),
    }),
    experimental_throttle: 50,
    onError: (error) => {
      console.error("useChat error:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status === "submitted" || status === "streaming")
      return;

    sendMessage({ role: "user", parts: [{ type: "text", text: input }] });
    setInput("");
  };

  const renderMessagePart = (part: UIMessage["parts"][0]) => {
    switch (part.type) {
      case "text":
        return (
          <div className="text-gray-800 dark:text-gray-200">{part.text}</div>
        );
      case "tool-fetchRecords":
        if (part.state === "output-available") {
          return (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-2">
              <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                📊 Fetched Records
              </div>
              <pre className="text-xs text-blue-800 dark:text-blue-300 whitespace-pre-wrap">
                {JSON.stringify(part.output, null, 2)}
              </pre>
            </div>
          );
        }
        return (
          <div className="text-sm text-gray-500 italic">
            🔄 Fetching records...
          </div>
        );
      case "step-start":
        return (
          <div className="border-l-2 border-gray-300 dark:border-gray-600 pl-2 my-2">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Starting new step...
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Groq x AI SDK Chat
          </h1>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            disabled={status === "submitted" || status === "streaming"}
          >
            <option value="meta-llama/llama-4-maverick-17b-128e-instruct">
              Llama 4 Maverick
            </option>
            <option value="deepseek-r1-distill-llama-70b">
              Deepseek R1 Llama 70b
            </option>
            <option value="qwen/qwen3-32b">Qwen 3 32b</option>
          </select>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
              <div className="text-4xl mb-2">💬</div>
              <p>Start a conversation with a Model from Groq</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-3xl rounded-lg px-4 py-3 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
                    Assistant
                  </div>
                )}

                <div className="space-y-2">
                  {message.parts.map((part, partIndex) => (
                    <div key={partIndex}>{renderMessagePart(part)}</div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {(status === "submitted" || status === "streaming") && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 max-w-xs">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Thinking...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your financial data..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={status === "submitted" || status === "streaming"}
            />
            <button
              type="submit"
              disabled={
                !input.trim() ||
                status === "submitted" ||
                status === "streaming"
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
