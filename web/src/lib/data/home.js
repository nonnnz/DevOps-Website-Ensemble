/**
 * Static content for the home page sections.
 * Numbers here are demo snapshots; the /evaluation page pulls live data from the DB.
 */

export const modelHighlights = [
  {
    title: 'Thai-first Tokenizer',
    description: 'A tokenizer designed for Thai script, reducing token count and cost for Thai text.',
    icon: 'tokens'
  },
  {
    title: 'Built from Scratch',
    description: 'Pretrained from the ground up on curated Thai + multilingual data — not a fine-tune.',
    icon: 'spark'
  },
  {
    title: 'API-ready Demo',
    description: 'A live playground backed by a streaming API, ready to plug into real compute.',
    icon: 'bolt'
  },
  {
    title: 'Integration-ready API',
    description: 'A familiar chat-completions interface for engineering teams and product demos.',
    icon: 'plug'
  }
];

export const infraSteps = [
  { label: 'Frontend', sub: 'SvelteKit UI' },
  { label: 'API Gateway', sub: '/api/chat' },
  { label: 'B200 / LANTA', sub: 'GPU compute' },
  { label: 'vLLM / TGI', sub: 'serving engine' },
  { label: 'Streaming Response', sub: 'token by token' }
];

export const evalSnapshot = [
  { label: 'Thai QA', value: 78.4, unit: '%', tone: 'primary' },
  { label: 'Reasoning', value: 71.2, unit: '%', tone: 'primary' },
  { label: 'Safety', value: 91.3, unit: '%', tone: 'success' },
  { label: 'Latency', value: 412, unit: 'ms', tone: 'warning' }
];
