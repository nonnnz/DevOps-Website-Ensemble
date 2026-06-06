/**
 * Client helper: POST to /api/chat and read the NDJSON stream.
 * Calls the provided callbacks as events arrive.
 *
 * @param {object} payload  { messages, model, backend, agent_mode?, temperature, top_p, max_tokens, repetition_penalty, stream }
 * @param {object} handlers
 * @param {(meta:object)=>void}    [handlers.onMeta]
 * @param {(content:string)=>void} [handlers.onDelta]
 * @param {(done:object)=>void}    [handlers.onDone]
 * @param {(message:string)=>void} [handlers.onError]
 * @param {(content:string)=>void} [handlers.onThinking]       agent mode — thinking block
 * @param {(ev:object)=>void}      [handlers.onThinkingRetry]  agent mode — retry notification
 * @param {AbortSignal} [signal]
 * @param {string} [url] endpoint to POST to (defaults to /api/chat)
 * @returns {Promise<void>}
 */
export async function streamChatRequest(payload, handlers = {}, signal, url = '/api/chat') {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '');
    handlers.onError?.(text || `Request failed (${res.status})`);
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  // NDJSON: split on newlines, parse each complete line as JSON.
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      let evt;
      try {
        evt = JSON.parse(trimmed);
      } catch {
        continue;
      }
      if      (evt.type === 'meta')            handlers.onMeta?.(evt);
      else if (evt.type === 'delta')           handlers.onDelta?.(evt.content || '');
      else if (evt.type === 'error')           handlers.onError?.(evt.message || 'Inference error');
      else if (evt.type === 'done')            handlers.onDone?.(evt);
      else if (evt.type === 'thinking')        handlers.onThinking?.(evt.content || '');
      else if (evt.type === 'thinking_retry')  handlers.onThinkingRetry?.(evt);
    }
  }
}
