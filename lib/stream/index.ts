/**
 * Helper utilities for creating Web Streams API (`ReadableStream`) responses,
 * preserving exact incremental streaming behavior and payload delimiters of the Express server.
 */

const encoder = new TextEncoder();

export function encodeChunk(text: string): Uint8Array {
  return encoder.encode(text);
}

export function createReadableStream(
  executor: (controller: ReadableStreamDefaultController<Uint8Array>) => Promise<void>
): ReadableStream<Uint8Array> {
  return new ReadableStream({
    async start(controller) {
      try {
        await executor(controller);
      } catch (error) {
        console.error("Stream execution error:", error);
        controller.error(error);
      } finally {
        try {
          controller.close();
        } catch {
          // Controller might already be closed
        }
      }
    },
  });
}

export function createEventStreamResponse(stream: ReadableStream<Uint8Array>): Response {
  return new Response(stream, {
    status: 200,
    headers: {
      "Cache-Control": "no-cache",
      "Content-Type": "text/event-stream",
    },
  });
}
