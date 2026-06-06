/**
 * LLM client adapter.
 *
 * Two modes, one interface (an async generator that yields response text deltas):
 *   - mock : realistic Thai demo responses, no external service required
 *   - real : OpenAI-compatible endpoint (vLLM / TGI / Triton) on B200 / LANTA
 *
 * ML DevOps: to wire the real backend, just set LLM_API_MODE=real and
 * LLM_API_BASE_URL / LLM_API_KEY (or the per-backend endpoints). The request
 * shape below is standard OpenAI Chat Completions; `repetition_penalty` is sent
 * as an extra field that vLLM/TGI accept and OpenAI ignores.
 */

import { assertSafeEndpoint } from './security.js';

/** @param {number} ms */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Build a realistic Thai demo answer based on the last user message.
 * @param {string} userPrompt
 * @returns {string}
 */
export function generateMockText(userPrompt) {
  const p = (userPrompt || '').toLowerCase();

  if (/(code|โค้ด|python|เขียนโปรแกรม|function|ฟังก์ชัน)/.test(p)) {
    return [
      'นี่คือตัวอย่างโค้ด Python ที่อ่านง่ายและพร้อมปรับใช้:',
      '',
      '```python',
      'def greet(name: str) -> str:',
      '    """คืนค่าข้อความทักทายเป็นภาษาไทย"""',
      '    return f"สวัสดีคุณ {name} 👋"',
      '',
      'print(greet("ผู้ใช้"))',
      '```',
      '',
      'อธิบาย: ฟังก์ชัน greet รับชื่อแล้วคืนข้อความทักทาย สามารถนำไปต่อยอดกับ API หรือแชทบอทได้ทันที'
    ].join('\n');
  }

  if (/(sql|ฐานข้อมูล|database|query|select)/.test(p)) {
    return [
      'ตัวอย่างคำสั่ง SQL สำหรับดึงข้อมูลผู้ใช้ที่ใช้งานล่าสุด:',
      '',
      '```sql',
      'SELECT id, name, created_at',
      'FROM users',
      "WHERE status = 'active'",
      'ORDER BY created_at DESC',
      'LIMIT 10;',
      '```',
      '',
      'ควรสร้าง index บนคอลัมน์ created_at เพื่อให้ query เร็วขึ้นเมื่อข้อมูลมีจำนวนมาก'
    ].join('\n');
  }

  if (/(สรุป|summar)/.test(p)) {
    return [
      'สรุปประเด็นสำคัญ (ตัวอย่างจากโหมดสาธิต):',
      '',
      '1. ใจความหลักถูกย่อให้กระชับ เข้าใจง่าย',
      '2. คงสาระสำคัญและบริบทภาษาไทยไว้ครบถ้วน',
      '3. เหมาะกับงานสรุปเอกสาร ข่าว หรือบทความยาว',
      '',
      'โมเดลภาษาไทยตัวจริงจะให้บทสรุปที่อ้างอิงเนื้อหาต้นฉบับได้แม่นยำยิ่งขึ้น'
    ].join('\n');
  }

  if (/(แปล|translate)/.test(p)) {
    return 'นี่คือคำแปลตัวอย่าง: โมเดลภาษาไทยนี้ถูกออกแบบให้เข้าใจบริบท วัฒนธรรม และสำนวนภาษาไทยได้อย่างเป็นธรรมชาติ พร้อมรองรับการแปลสองทิศทางระหว่างไทยและอังกฤษ';
  }

  // Generic helpful answer that references the user's question.
  const q = userPrompt ? `เกี่ยวกับ "${userPrompt.trim().slice(0, 80)}"` : 'คำถามของคุณ';
  return [
    `ขอบคุณสำหรับคำถาม ${q} ครับ/ค่ะ`,
    '',
    'นี่คือคำตอบจากโมเดลภาษาไทยที่สร้างขึ้นใหม่ตั้งแต่ต้น (built from scratch) ออกแบบมาเพื่อภาษาไทยโดยเฉพาะ ทั้งด้านการให้เหตุผล ความเข้าใจบริบท และวัฒนธรรมไทย',
    '',
    'โมเดลรองรับการใช้งานผ่าน API ที่เข้ากันได้กับ OpenAI และพร้อมเชื่อมต่อกับการประมวลผลบน B200 หรือ LANTA ในอนาคต'
  ].join('\n');
}

/**
 * Mock streaming generator. Splits the demo text into small chunks to simulate
 * token-by-token streaming (works for Thai which has no word spaces).
 *
 * @param {string} userPrompt
 * @param {{ stream?: boolean }} params
 * @returns {AsyncGenerator<string>}
 */
export async function* mockStream(userPrompt, params = {}) {
  const text = generateMockText(userPrompt) + '\n\n— (Mock mode) คำตอบนี้สร้างจากเซิร์ฟเวอร์สาธิต ยังไม่ได้เชื่อมต่อ B200/LANTA';

  if (params.stream === false) {
    // Simulate compute time, then return everything at once.
    await sleep(120 + Math.random() * 120);
    yield text;
    return;
  }

  const chunkSize = 3;
  for (let i = 0; i < text.length; i += chunkSize) {
    yield text.slice(i, i + chunkSize);
    await sleep(14 + Math.random() * 14);
  }
}

/**
 * Real OpenAI-compatible streaming generator.
 *
 * @param {object} args
 * @param {string} args.baseUrl   e.g. https://b200.example.com  (without /v1)
 * @param {string} args.apiKey
 * @param {string} args.model
 * @param {Array<{role:string, content:string}>} args.messages
 * @param {object} args.params    { temperature, top_p, max_tokens, repetition_penalty, stream }
 * @param {number} args.timeoutSeconds
 * @returns {AsyncGenerator<string>}
 */
export async function* realStream({ baseUrl, apiKey, model, messages, params, timeoutSeconds }) {
  if (!baseUrl) {
    throw new Error('No inference endpoint configured. Set LLM_API_BASE_URL or a per-backend endpoint.');
  }
  // SSRF guard: never fetch (and never attach the API key to) a private/metadata host.
  assertSafeEndpoint(baseUrl);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), (timeoutSeconds || 60) * 1000);

  const body = {
    model,
    messages,
    temperature: params.temperature,
    top_p: params.top_p,
    max_tokens: params.max_tokens,
    // Extra field accepted by vLLM / TGI; ignored by strict OpenAI servers.
    repetition_penalty: params.repetition_penalty,
    stream: params.stream !== false
  };

  try {
    const res = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`Upstream ${res.status} ${res.statusText}: ${detail.slice(0, 300)}`);
    }

    // Non-streaming: parse one JSON payload.
    if (body.stream === false) {
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content ?? '';
      yield content;
      return;
    }

    // Streaming: parse Server-Sent Events ("data: {...}\n\n", terminated by [DONE]).
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() ?? ''; // keep incomplete last line

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === '[DONE]') return;
        try {
          const json = JSON.parse(payload);
          const delta = json?.choices?.[0]?.delta?.content;
          if (delta) yield delta;
        } catch {
          // Ignore keep-alive / non-JSON lines.
        }
      }
    }
  } finally {
    clearTimeout(timer);
  }
}

/**
 * /v1/completions (text completion) stream — used by modelharbor.
 * Converts the messages array to a single prompt string and reads `choices[0].text`.
 *
 * @param {object} args
 * @returns {AsyncGenerator<string>}
 */
export async function* completionsStream({ baseUrl, apiKey, model, messages, params, timeoutSeconds }) {
  if (!baseUrl) {
    throw new Error('No inference endpoint configured. Set MODELHARBOR_ENDPOINT_URL or LLM_API_BASE_URL.');
  }
  // SSRF guard: never fetch (and never attach the API key to) a private/metadata host.
  assertSafeEndpoint(baseUrl);

  // Flatten messages into a single prompt (ChatML-style)
  const prompt = messages
    .map((m) => `<|im_start|>${m.role}\n${m.content}<|im_end|>`)
    .join('\n') + '\n<|im_start|>assistant\n';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), (timeoutSeconds || 60) * 1000);

  const body = {
    model,
    prompt,
    temperature: params.temperature,
    top_p: params.top_p,
    max_tokens: params.max_tokens,
    repetition_penalty: params.repetition_penalty,
    stream: params.stream !== false
  };

  try {
    const res = await fetch(`${baseUrl}/v1/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`Upstream ${res.status} ${res.statusText}: ${detail.slice(0, 300)}`);
    }

    if (body.stream === false) {
      const data = await res.json();
      yield data?.choices?.[0]?.text ?? '';
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === '[DONE]') return;
        try {
          const json = JSON.parse(payload);
          const delta = json?.choices?.[0]?.text;
          if (delta) yield delta;
        } catch {
          // ignore keep-alive lines
        }
      }
    }
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Unified entry point: returns an async generator of text deltas for either mode.
 *
 * @param {object} args
 * @param {string} args.mode 'mock' | 'real'
 * @param {string} args.apiStyle 'chat' | 'completions'
 * @param {string} args.userPrompt
 * @param {Array<{role:string, content:string}>} args.messages
 * @param {object} args.params
 * @param {string} args.baseUrl
 * @param {string} args.apiKey
 * @param {string} args.model
 * @param {number} args.timeoutSeconds
 * @returns {AsyncGenerator<string>}
 */
export function streamChat(args) {
  if (args.mode === 'real') {
    return args.apiStyle === 'completions' ? completionsStream(args) : realStream(args);
  }
  return mockStream(args.userPrompt, args.params);
}
