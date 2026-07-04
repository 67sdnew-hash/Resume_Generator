const API = process.env.API_BASE || 'http://localhost:4000';
const fetch = global.fetch || require('node-fetch');

async function createGeneration() {
  const res = await fetch(`${API}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profile: { contact: { fullName: 'PDF Tester' }, experience: [], education: [], skills: { technical: [], soft: [], languages: [], certifications: [] } },
      jobDescription: 'Test job description for PDF endpoint.'
    }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`Generate failed: ${JSON.stringify(body)}`);
  return body.generationId;
}

async function downloadPdf(generationId) {
  const url = `${API}/api/generate-pdf/${generationId}?type=resume`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`PDF request failed: ${res.status}`);
  const contentType = res.headers.get('content-type');
  console.log('Content-Type:', contentType);
  if (!contentType || !contentType.includes('application/pdf')) throw new Error('Not a PDF');
  const data = await res.arrayBuffer();
  console.log('Bytes received:', data.byteLength);
  if (data.byteLength < 100) throw new Error('PDF too small');
  console.log('PDF endpoint OK');
}

(async () => {
  try {
    const id = await createGeneration();
    console.log('Created generation:', id);
    await downloadPdf(id);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
