/**
 * Seed the database with demo-ready data:
 * models, default API config, feature flags, evaluation results,
 * sample playground logs and sample feedback.
 *
 * Run with:  npm run db:seed   (or: npx prisma db seed)
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** @returns {string} a short pseudo request id (seed only). */
function rid() {
  return 'req_' + Math.random().toString(36).slice(2, 10);
}

async function main() {
  console.log('Seeding Thai LLM portal database...');

  // --- Models -------------------------------------------------------------
  const models = [
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
      download_url: 'https://huggingface.co/thai-llm/thai-llm-base-v0.1/resolve/main/model.safetensors',
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
      download_url: 'https://huggingface.co/thai-llm/thai-llm-instruct-v0.1/resolve/main/model.safetensors',
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
      download_url: 'https://huggingface.co/thai-llm/thai-llm-chat-v0.1/resolve/main/model.safetensors',
      supports_b200: true,
      supports_lanta: true
    }
  ];

  for (const m of models) {
    await prisma.model.upsert({
      where: { model_id: m.model_id },
      update: m,
      create: m
    });
  }
  console.log(`  models: ${models.length}`);

  // --- API config (single row) -------------------------------------------
  const existingConfig = await prisma.apiConfig.findFirst();
  if (!existingConfig) {
    await prisma.apiConfig.create({
      data: {
        mode: 'mock',
        default_backend: 'auto',
        b200_endpoint: '',
        lanta_endpoint: '',
        openai_base_url: '',
        model_server_type: 'vLLM',
        api_key_placeholder: '', // real key stays in env (LLM_API_KEY)
        timeout_seconds: 60,
        max_concurrent_requests: 8,
        rate_limit_per_minute: 60
      }
    });
  }
  console.log('  api_config: ready');

  // --- Feature flags (single row) ----------------------------------------
  const existingFlags = await prisma.featureFlag.findFirst();
  if (!existingFlags) {
    await prisma.featureFlag.create({ data: {} }); // all defaults
  }
  console.log('  feature_flags: ready');

  // --- Evaluation results -------------------------------------------------
  await prisma.evaluationResult.deleteMany();
  const evals = [
    // quality
    { benchmark_name: 'Thai QA', category: 'quality', score: 78.4, metric: '%', notes: 'Thai open-domain QA accuracy' },
    { benchmark_name: 'Thai Reasoning', category: 'quality', score: 71.2, metric: '%', notes: 'Multi-step reasoning in Thai' },
    { benchmark_name: 'Instruction Following', category: 'quality', score: 82.6, metric: '%', notes: 'Thai instruction adherence' },
    { benchmark_name: 'Safety', category: 'quality', score: 91.3, metric: '%', notes: 'Refusal + safe completion rate' },
    { benchmark_name: 'RAG Accuracy', category: 'quality', score: 76.9, metric: '%', notes: 'Grounded answer accuracy' },
    // serving
    { benchmark_name: 'Average Latency', category: 'serving', score: 412, metric: 'ms', notes: 'First token, B200, batch 1' },
    { benchmark_name: 'Throughput', category: 'serving', score: 64.5, metric: 'tokens/s', notes: 'Single stream decode' },
    { benchmark_name: 'Error Rate', category: 'serving', score: 0.4, metric: '%', notes: 'Last 24h' },
    { benchmark_name: 'Uptime', category: 'serving', score: 99.95, metric: '%', notes: 'Last 30 days' }
  ];
  for (const e of evals) {
    await prisma.evaluationResult.create({
      data: { model_id: 'thai-llm-chat-v0.1', ...e }
    });
  }
  console.log(`  evaluation_results: ${evals.length}`);

  // --- Sample playground logs + feedback ---------------------------------
  await prisma.feedback.deleteMany();
  await prisma.playgroundLog.deleteMany();

  const sampleLogs = [
    {
      model_id: 'thai-llm-chat-v0.1',
      backend: 'b200',
      system_prompt: 'You are a helpful Thai assistant.',
      user_prompt: 'ช่วยอธิบาย Machine Learning เป็นภาษาไทยง่าย ๆ',
      assistant_response:
        'Machine Learning คือการสอนให้คอมพิวเตอร์เรียนรู้รูปแบบจากข้อมูลจำนวนมาก แทนการเขียนกฎตายตัว เช่น ป้อนรูปแมวหลายพันรูปเพื่อให้โมเดลจดจำลักษณะของแมวได้เอง',
      temperature: 0.7,
      top_p: 0.95,
      max_tokens: 1024,
      repetition_penalty: 1.1,
      stream: true,
      latency_ms: 380,
      input_tokens: 24,
      output_tokens: 96,
      tokens_per_second: 62.3,
      status: 'success',
      feedback_type: 'good'
    },
    {
      model_id: 'thai-llm-chat-v0.1',
      backend: 'lanta',
      system_prompt: 'You are a helpful Thai assistant.',
      user_prompt: 'สรุปข่าวเศรษฐกิจไทยให้หน่อย',
      assistant_response:
        'นี่คือบทสรุปตัวอย่าง: เศรษฐกิจไทยมีแนวโน้มฟื้นตัวจากภาคการท่องเที่ยวและการส่งออก โดยมีปัจจัยเสี่ยงจากหนี้ครัวเรือนและความผันผวนของค่าเงิน',
      temperature: 0.6,
      top_p: 0.9,
      max_tokens: 800,
      repetition_penalty: 1.1,
      stream: true,
      latency_ms: 455,
      input_tokens: 18,
      output_tokens: 72,
      tokens_per_second: 58.1,
      status: 'success',
      feedback_type: 'bad'
    },
    {
      model_id: 'thai-llm-instruct-v0.1',
      backend: 'b200',
      system_prompt: null,
      user_prompt: 'เขียนโค้ด Python อ่านไฟล์ CSV',
      assistant_response:
        'import pandas as pd\n\ndf = pd.read_csv("data.csv")\nprint(df.head())',
      temperature: 0.3,
      top_p: 0.95,
      max_tokens: 512,
      repetition_penalty: 1.05,
      stream: false,
      latency_ms: 290,
      input_tokens: 14,
      output_tokens: 41,
      tokens_per_second: 70.2,
      status: 'success',
      feedback_type: 'good'
    }
  ];

  for (const s of sampleLogs) {
    const { feedback_type, ...logData } = s;
    const log = await prisma.playgroundLog.create({
      data: { request_id: rid(), ...logData }
    });
    await prisma.feedback.create({
      data: { playground_log_id: log.id, feedback_type }
    });
  }
  console.log(`  playground_logs: ${sampleLogs.length} (+ feedback)`);

  // --- Sample status checks ----------------------------------------------
  await prisma.statusCheck.deleteMany();
  await prisma.statusCheck.createMany({
    data: [
      { backend: 'b200', status: 'online', latency_ms: 38 },
      { backend: 'lanta', status: 'online', latency_ms: 61 },
      { backend: 'chat', status: 'online', latency_ms: 402 }
    ]
  });
  console.log('  status_checks: 3');

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
