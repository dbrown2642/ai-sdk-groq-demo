import "server-only";

import type { InferUIMessageChunk, UIMessage, UIMessageStreamWriter } from "ai";
import {
  convertToModelMessages,
  createUIMessageStream,
  stepCountIs,
  streamText,
} from "ai";
import { fetchRecordsTool } from "./tools";
import { groq } from "@ai-sdk/groq";

export function streamChatResponse(
  messages: UIMessage[],
  selectedModelId: string,
): ReadableStream<InferUIMessageChunk<UIMessage>> {
  return createUIMessageStream({
    onError: (error: unknown) => {
      console.error(error);
      return `Error in streamChatResponse: ${error}`;
    },
    execute: async ({
      writer,
    }: {
      writer: UIMessageStreamWriter<UIMessage>;
    }) => {
      const result = streamText({
        model: groq(selectedModelId),
        tools: {
          fetchRecords: fetchRecordsTool(),
        },
        prepareStep: async ({ stepNumber }) => {
          if (stepNumber === 0) {
            // First step: fetch relevant records
            return {
              toolChoice: "required",
              activeTools: ["fetchRecords"],
              system:
                "You are GroqResponder AI, an AI-powered assistant for financial teams. You have access to fetchRecords tool, which lets you find information relevant to a user's query. You must call the fetchRecords tool as your very first step to retrieve relevant records. In later steps, you will use this information to answer the query.",
            };
          }
          // Second step: respond
          else {
            return { system: "Respond to the user query" };
          }
        },
        stopWhen: stepCountIs(2),
        messages: convertToModelMessages(messages),
      });
      writer.merge(result.toUIMessageStream());
    },
  });
}
