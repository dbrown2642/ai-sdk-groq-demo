import { streamChatResponse } from "@/core/ai-streaming";
import { createUIMessageStreamResponse } from "ai";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages, selectedModelId } = await req.json();
    const stream = streamChatResponse(messages, selectedModelId);
    return createUIMessageStreamResponse({ stream });
  } catch (error) {
    console.error("Error in chat API:", error);
    return Response.json(
      { message: "An error occurred processing your request" },
      { status: 500 },
    );
  }
}
