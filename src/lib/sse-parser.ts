import type { SSEEvent } from "@/types";

/**
 * Parse SSE events from a ReadableStream.
 * Backend POST /api/chat returns lines like:
 *   event: token
 *   data: {"content": "Hello"}
 *
 *   event: done
 *   data: {"model": "claude-opus", "cost": 0.003}
 */
export async function* parseSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>
): AsyncGenerator<SSEEvent> {
  const decoder = new TextDecoder();
  let buffer = "";
  let currentEvent = "";
  let currentData = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("event: ")) {
        currentEvent = line.slice(7).trim();
      } else if (line.startsWith("data: ")) {
        currentData = line.slice(6);
      } else if (line === "") {
        if (currentEvent && currentData) {
          yield { event: currentEvent, data: currentData };
        }
        currentEvent = "";
        currentData = "";
      }
    }
  }

  // Flush remaining
  if (currentEvent && currentData) {
    yield { event: currentEvent, data: currentData };
  }
}
