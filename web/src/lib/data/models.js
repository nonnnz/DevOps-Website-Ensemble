/**
 * Fallback model list used when the database is empty or unavailable.
 * Mirrors prisma/seed.js so the site looks complete in a no-DB demo.
 */
export const fallbackModels = [
  {
    model_id: 'thai-llm-base-v0.1',
    display_name: 'Thai LLM Base v0.1',
    model_type: 'base',
    parameters: '8B',
    context_length: 8192,
    max_output_tokens: 4096,
    status: 'active',
    license: 'Apache-2.0',
    hf_url: 'https://huggingface.co/thai-llm/thai-llm-base-v0.1',
    download_url: 'https://huggingface.co/thai-llm/thai-llm-base-v0.1',
    supports_b200: true,
    supports_lanta: true
  },
  {
    model_id: 'thai-llm-instruct-v0.1',
    display_name: 'Thai LLM Instruct v0.1',
    model_type: 'instruct',
    parameters: '8B',
    context_length: 8192,
    max_output_tokens: 4096,
    status: 'active',
    license: 'Apache-2.0',
    hf_url: 'https://huggingface.co/thai-llm/thai-llm-instruct-v0.1',
    download_url: 'https://huggingface.co/thai-llm/thai-llm-instruct-v0.1',
    supports_b200: true,
    supports_lanta: true
  },
  {
    model_id: 'thai-llm-chat-v0.1',
    display_name: 'Thai LLM Chat v0.1',
    model_type: 'chat',
    parameters: '8B',
    context_length: 16384,
    max_output_tokens: 4096,
    status: 'active',
    license: 'Apache-2.0',
    hf_url: 'https://huggingface.co/thai-llm/thai-llm-chat-v0.1',
    download_url: 'https://huggingface.co/thai-llm/thai-llm-chat-v0.1',
    supports_b200: true,
    supports_lanta: true
  }
];
