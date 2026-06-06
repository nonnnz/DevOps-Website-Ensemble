/**
 * Gallery use cases. Each "Try in Playground" button passes `prompt` to
 * /playground?prompt=... which pre-fills the chat input.
 */
export const useCases = [
  {
    title: 'Thai Chatbot',
    description: 'สนทนาภาษาไทยอย่างเป็นธรรมชาติ เข้าใจบริบทและสำนวนไทย',
    prompt: 'สวัสดีครับ ช่วยแนะนำตัวเองและบอกว่าคุณช่วยอะไรได้บ้าง'
  },
  {
    title: 'Thai OCR Cleanup',
    description: 'แก้ไขและจัดรูปแบบข้อความที่ได้จาก OCR ให้อ่านง่ายขึ้น',
    prompt: 'ช่วยแก้ข้อความ OCR นี้ให้ถูกต้อง: "สวัสด ครบ ยนิดต อนรบ สู ระบบ"'
  },
  {
    title: 'Thai Summarization',
    description: 'สรุปบทความหรือเอกสารภาษาไทยยาว ๆ ให้กระชับ',
    prompt: 'ช่วยสรุปแนวคิดหลักของ Machine Learning ให้เหลือ 3 ข้อสั้น ๆ'
  },
  {
    title: 'Thai RAG Assistant',
    description: 'ตอบคำถามโดยอ้างอิงจากเอกสารที่ให้มา (retrieval-augmented)',
    prompt: 'จากเอกสารนโยบายบริษัท ช่วยตอบว่าพนักงานลาพักร้อนได้กี่วันต่อปี'
  },
  {
    title: 'Thai Customer Service',
    description: 'ผู้ช่วยตอบลูกค้าอย่างสุภาพ รวดเร็ว และตรงประเด็น',
    prompt: 'ลูกค้าถามว่า "สินค้าจะจัดส่งภายในกี่วัน" ช่วยร่างคำตอบที่สุภาพ'
  },
  {
    title: 'Thai Education Tutor',
    description: 'ติวเตอร์ที่อธิบายเนื้อหาวิชาการเป็นภาษาไทยเข้าใจง่าย',
    prompt: 'ช่วยอธิบายทฤษฎีบทพีทาโกรัสให้เด็กมัธยมเข้าใจง่าย ๆ'
  },
  {
    title: 'Thai SQL Assistant',
    description: 'แปลงคำถามภาษาไทยเป็นคำสั่ง SQL พร้อมคำอธิบาย',
    prompt: 'ช่วยเขียน SQL ดึงรายชื่อลูกค้า 10 คนที่สมัครล่าสุด'
  },
  {
    title: 'Thai Government Form Helper',
    description: 'ช่วยกรอกและอธิบายแบบฟอร์มราชการให้เข้าใจง่าย',
    prompt: 'ช่วยอธิบายขั้นตอนการขอหนังสือรับรองถิ่นที่อยู่แบบเข้าใจง่าย'
  }
];

export const galleryImages = [
  {
    title: 'Research Workshop',
    description: 'Atmosphere photos from model research and engineering sessions.',
    src: '',
    alt: 'Research workshop atmosphere'
  },
  {
    title: 'Engineering Lab',
    description: 'Room for lab, compute, and system integration photos.',
    src: '',
    alt: 'Engineering lab atmosphere'
  },
  {
    title: 'Evaluation Session',
    description: 'Benchmarks, testing days, and review sessions.',
    src: '',
    alt: 'Evaluation session atmosphere'
  },
  {
    title: 'Community Meetup',
    description: 'Events, talks, and community learning moments.',
    src: '',
    alt: 'Community meetup atmosphere'
  },
  {
    title: 'Demo Booth',
    description: 'Showcase space for demos and live product trials.',
    src: '',
    alt: 'Demo booth atmosphere'
  },
  {
    title: 'Team Collaboration',
    description: 'Behind-the-scenes collaboration and build progress.',
    src: '',
    alt: 'Team collaboration atmosphere'
  }
];
