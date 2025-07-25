import "server-only";

import { tool } from "ai";
import { z } from "zod";

// tools available to the LLM
export type ServerTools = {
  fetchRecords: ReturnType<typeof fetchRecordsTool>;
};

export function fetchRecordsTool() {
  return tool({
    description:
      "Fetch records from the user's database to help answer their query. These records serve as the source of truth for all up-to-date financial information from their organization.",
    inputSchema: z.object({}),
    execute: async () => {
      return {
        records: {
          id: 1,
          title: "Record 1",
        },
      };
    },
  });
}
