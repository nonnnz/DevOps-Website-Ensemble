<script>
  import SectionHeader from '$lib/components/SectionHeader.svelte';
  import Button from '$lib/components/Button.svelte';
  import { reveal } from '$lib/utils/reveal.js';

  const REPO = 'https://github.com/peetwan/autofollowdown';

  // Three core compression techniques.
  const techniques = [
    {
      title: 'Quantization',
      desc: 'ลดความละเอียด (precision) ของน้ำหนักโมเดล เช่น int8 เพื่อให้ขนาดเล็กลงและเร็วขึ้น'
    },
    {
      title: 'Pruning',
      desc: 'ตัดน้ำหนักที่สำคัญน้อยออก (เช่น sparsity 50%) เพื่อให้โมเดลเบาลง'
    },
    {
      title: 'Knowledge Distillation',
      desc: 'เทรนโมเดลเล็กให้เลียนแบบโมเดลใหญ่ เพื่อคงความแม่นยำในขนาดที่เล็กลง'
    }
  ];

  const keyPoints = [
    'API เดียวที่ครอบคลุมทั้ง 3 เทคนิคบีบอัดโมเดล',
    'Benchmark จริง: วัดผลกระทบจริงต่อขนาด, latency และความแม่นยำ',
    '"No mocks" — ทุกการทำงานแก้ไขน้ำหนักจริง และทุกตัวเลขมาจากการรันโมเดลจริง',
    'มีเครื่องมือ diagnose สำหรับคนที่รันโมเดลบนฮาร์ดแวร์จำกัดไม่ได้',
    'รองรับหลาย backend: PyTorch, NNI, llm-compressor, NVIDIA ModelOpt, torchao, bitsandbytes, HQQ',
    'ใช้ได้กับ PyTorch modules, Hugging Face model IDs และไฟล์ ONNX'
  ];

  // Code samples kept as strings so Svelte does not parse braces.
  const installCode = `pip install "git+https://github.com/peetwan/autofollowdown"

# สำหรับ demo / examples
pip install "autofollowdown[examples] @ git+https://github.com/peetwan/autofollowdown"`;

  const diagnoseCode = `# เริ่มที่นี่ถ้ารันโมเดลไม่ได้ / ไม่พอ VRAM
autofollowdown diagnose meta-llama/Llama-3.1-8B --problem won't-fit --vram 8
autofollowdown diagnose Qwen/Qwen3-0.6B --device raspberry-pi-5`;

  const compressCode = `autofollowdown auto                                     # offline demo
autofollowdown compress facebook/opt-125m -o small.pt  # บีบอัด + benchmark + บันทึก`;

  const recommendCode = `autofollowdown recommend Qwen/Qwen3-0.6B --goal accuracy
autofollowdown advise <model> --goal size
autofollowdown gpu Qwen/Qwen3-0.6B                     # วางแผน memory สำหรับ GPU ฟรี`;

  const pyOneCmd = `from autofollowdown import compress_and_benchmark

study = compress_and_benchmark(model, eval_loader=test_loader)
study.show()                                  # แสดงตารางเปรียบเทียบ
study.export(study.recommended, "small.pt")   # บันทึกตัวที่ดีที่สุด`;

  const pyManual = `from autofollowdown import ModelCompressor
import copy

ModelCompressor(my_model) \\
    .prune(sparsity=0.5, method="unstructured") \\
    .quantize(method="int8", approach="dynamic") \\
    .export("compressed.pt", format="pt")`;

  const pyAuto = `from autofollowdown import explain, recommend, auto_compress

explain(my_model)                              # จัดอันดับ backend + เหตุผล
compressed, chosen = auto_compress(my_model)   # รัน backend ที่ดีที่สุดที่มี`;

  const exampleOutput = `| Model            | Size MB | Sparsity | Acc   | Size× | Speed× | ΔAcc  |
| baseline         | 1.077   | 0.0%     | 90.4% | —     | —      | —     |
| int8 dynamic     | 0.303   | 0.0%     | 90.4% | 3.56× | 0.60×  | +0.0% |
| prune 50%        | 1.077   | 50.0%    | 91.6% | 1.00× | 1.07×  | +1.1% |
| prune+quantize   | 0.303   | 18.4%    | 91.6% | 3.56× | 0.60×  | +1.1% |`;

  const testCode = `python3 examples/benchmark_digits.py --epochs 8               # CNN บน digits dataset
python3 examples/benchmark_llm.py --model facebook/opt-125m  # LLM perplexity`;
</script>

<svelte:head>
  <title>AutoFollowDown — Super AI Engineer LLM</title>
</svelte:head>

<section class="section pt-28 sm:pt-32">
  <div class="container-app">
    <SectionHeader
      eyebrow="Tool"
      title="AutoFollowDown"
      subtitle="ชุดเครื่องมือเดียวสำหรับบีบอัดโมเดล AI ด้วย Quantization, Pruning และ Knowledge Distillation พร้อม benchmark จริง"
    />
    <div class="flex flex-wrap gap-3">
      <Button href={REPO} size="lg">View on GitHub</Button>
      <Button href={`${REPO}#readme`} size="lg" variant="outline">Full README</Button>
    </div>
    <p class="mt-4 text-sm text-textmuted">
      สรุปประเด็นสำคัญและการใช้งานจาก README ของ
      <a href={REPO} class="text-primary hover:underline">peetwan/autofollowdown</a>
    </p>
  </div>
</section>

<!-- KEY POINTS -->
<section class="section pt-0" use:reveal>
  <div class="container-app">
    <h2 class="mb-6 text-2xl font-bold text-textmain">ประเด็นสำคัญ</h2>

    <div class="grid gap-5 sm:grid-cols-3">
      {#each techniques as t}
        <div class="card-soft card-hover p-6">
          <div class="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 7h16M6 12h12M9 17h6" stroke-linecap="round" />
            </svg>
          </div>
          <h3 class="text-base font-bold text-textmain">{t.title}</h3>
          <p class="mt-2 text-sm leading-relaxed text-textmuted">{t.desc}</p>
        </div>
      {/each}
    </div>

    <div class="card-soft mt-6 p-6">
      <ul class="grid gap-3 sm:grid-cols-2">
        {#each keyPoints as point}
          <li class="flex items-start gap-2 text-sm text-textmain">
            <span class="mt-1 text-primary">▸</span>{point}
          </li>
        {/each}
      </ul>
    </div>
  </div>
</section>

<!-- USAGE -->
<section class="section pt-0" use:reveal>
  <div class="container-app">
    <h2 class="mb-6 text-2xl font-bold text-textmain">การใช้งาน</h2>

    <div class="grid gap-6 lg:grid-cols-2">
      <div class="card-soft p-6">
        <h3 class="text-lg font-bold text-textmain">ติดตั้ง (Installation)</h3>
        <p class="mt-1 text-sm text-textmuted">ต้องการ Python ≥ 3.9 และ PyTorch ≥ 2.1</p>
        <pre class="code-block"><code>{installCode}</code></pre>
      </div>

      <div class="card-soft p-6">
        <h3 class="text-lg font-bold text-textmain">Diagnose (เริ่มที่นี่ถ้ารันไม่ได้)</h3>
        <p class="mt-1 text-sm text-textmuted">วิเคราะห์ว่าทำไมโมเดลรันไม่ได้ และควรบีบอัดอย่างไร</p>
        <pre class="code-block"><code>{diagnoseCode}</code></pre>
      </div>

      <div class="card-soft p-6">
        <h3 class="text-lg font-bold text-textmain">บีบอัด + Benchmark (CLI)</h3>
        <p class="mt-1 text-sm text-textmuted">คำสั่งเดียวจบ: บีบอัด วัดผล และบันทึก</p>
        <pre class="code-block"><code>{compressCode}</code></pre>
      </div>

      <div class="card-soft p-6">
        <h3 class="text-lg font-bold text-textmain">ขอคำแนะนำ (Recommend)</h3>
        <p class="mt-1 text-sm text-textmuted">ให้เครื่องมือแนะนำวิธีตามเป้าหมาย (accuracy / size)</p>
        <pre class="code-block"><code>{recommendCode}</code></pre>
      </div>
    </div>

    <h3 class="mb-4 mt-10 text-lg font-bold text-textmain">Python API</h3>
    <div class="grid gap-6 lg:grid-cols-2">
      <div class="card-soft p-6">
        <p class="mb-2 text-sm font-semibold text-textmuted">คำสั่งเดียว + เลือกอัตโนมัติ</p>
        <pre class="code-block"><code>{pyOneCmd}</code></pre>
      </div>
      <div class="card-soft p-6">
        <p class="mb-2 text-sm font-semibold text-textmuted">ควบคุมทีละขั้น</p>
        <pre class="code-block"><code>{pyManual}</code></pre>
      </div>
      <div class="card-soft p-6 lg:col-span-2">
        <p class="mb-2 text-sm font-semibold text-textmuted">Auto-picker (เลือก backend ที่ดีที่สุด)</p>
        <pre class="code-block"><code>{pyAuto}</code></pre>
      </div>
    </div>
  </div>
</section>

<!-- EXAMPLE OUTPUT -->
<section class="section pt-0" use:reveal>
  <div class="container-app">
    <h2 class="mb-6 text-2xl font-bold text-textmain">ตัวอย่างผลลัพธ์</h2>
    <div class="card-soft p-6">
      <p class="mb-3 text-sm text-textmuted">ผลจากการรัน offline demo (เปรียบเทียบขนาด / ความเร็ว / ความแม่นยำ)</p>
      <pre class="code-block"><code>{exampleOutput}</code></pre>
    </div>

    <div class="card-soft mt-6 p-6">
      <h3 class="text-lg font-bold text-textmain">ทดสอบตัวอย่าง</h3>
      <pre class="code-block"><code>{testCode}</code></pre>
    </div>
  </div>
</section>

<style>
  .code-block {
    margin-top: 0.75rem;
    overflow-x: auto;
    border-radius: 0.75rem;
    background: #0f2a57;
    padding: 1rem;
    font-size: 0.8rem;
    line-height: 1.55;
    color: #e8f1ff;
  }
  .code-block :global(code) {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    white-space: pre;
  }
</style>
