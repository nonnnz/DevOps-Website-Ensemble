/** Fallback evaluation data (mirrors prisma/seed.js) for no-DB demos. */
export const fallbackEvaluations = [
  { model_id: 'thai-llm-chat-v0.1', benchmark_name: 'Thai QA', category: 'quality', score: 78.4, metric: '%', notes: 'Thai open-domain QA accuracy' },
  { model_id: 'thai-llm-chat-v0.1', benchmark_name: 'Thai Reasoning', category: 'quality', score: 71.2, metric: '%', notes: 'Multi-step reasoning in Thai' },
  { model_id: 'thai-llm-chat-v0.1', benchmark_name: 'Instruction Following', category: 'quality', score: 82.6, metric: '%', notes: 'Thai instruction adherence' },
  { model_id: 'thai-llm-chat-v0.1', benchmark_name: 'Safety', category: 'quality', score: 91.3, metric: '%', notes: 'Refusal + safe completion rate' },
  { model_id: 'thai-llm-chat-v0.1', benchmark_name: 'RAG Accuracy', category: 'quality', score: 76.9, metric: '%', notes: 'Grounded answer accuracy' },
  { model_id: 'thai-llm-chat-v0.1', benchmark_name: 'Average Latency', category: 'serving', score: 412, metric: 'ms', notes: 'First token, B200, batch 1' },
  { model_id: 'thai-llm-chat-v0.1', benchmark_name: 'Throughput', category: 'serving', score: 64.5, metric: 'tokens/s', notes: 'Single stream decode' },
  { model_id: 'thai-llm-chat-v0.1', benchmark_name: 'Error Rate', category: 'serving', score: 0.4, metric: '%', notes: 'Last 24h' },
  { model_id: 'thai-llm-chat-v0.1', benchmark_name: 'Uptime', category: 'serving', score: 99.95, metric: '%', notes: 'Last 30 days' }
];
