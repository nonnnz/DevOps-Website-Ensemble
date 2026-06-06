/** Research & technical report cards shown on /research. */
export const researchCards = [
  {
    title: 'Technical Report',
    description: 'ภาพรวมสถาปัตยกรรมโมเดล วิธีการเทรน และผลการประเมินทั้งหมด',
    tag: 'Overview',
    status: 'Coming soon'
  },
  {
    title: 'Tokenizer Design',
    description: 'การออกแบบ tokenizer สำหรับภาษาไทย เพื่อลดจำนวน token และต้นทุน',
    tag: 'Data',
    status: 'Draft'
  },
  {
    title: 'Dataset Pipeline',
    description: 'กระบวนการรวบรวม ทำความสะอาด และคัดกรองข้อมูลภาษาไทยคุณภาพสูง',
    tag: 'Data',
    status: 'Draft'
  },
  {
    title: 'Pretraining Recipe',
    description: 'สูตรการ pretrain ตั้งแต่ต้น รวมถึง hyperparameters และ schedule',
    tag: 'Training',
    status: 'Coming soon'
  },
  {
    title: 'Safety Alignment',
    description: 'แนวทาง alignment และความปลอดภัยสำหรับบริบทภาษาและวัฒนธรรมไทย',
    tag: 'Safety',
    status: 'Draft'
  },
  {
    title: 'Evaluation Harness',
    description: 'ชุดเครื่องมือและ benchmark สำหรับวัดคุณภาพโมเดลภาษาไทย',
    tag: 'Eval',
    status: 'Open source'
  },
  {
    title: 'Serving Infrastructure',
    description: 'การ deploy บน B200 / LANTA ด้วย vLLM / TGI พร้อม streaming API',
    tag: 'Infra',
    status: 'In progress'
  }
];
