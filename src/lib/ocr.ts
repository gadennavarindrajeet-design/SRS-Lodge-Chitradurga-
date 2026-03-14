import { createWorker } from 'tesseract.js';

export const scanAadhaar = async (image: string): Promise<{ name?: string, aadhaar?: string }> => {
  const worker = await createWorker('eng');
  const { data: { text } } = await worker.recognize(image);
  await worker.terminate();

  // Simple regex for Aadhaar (12 digits)
  const aadhaarMatch = text.match(/\d{4}\s\d{4}\s\d{4}/) || text.match(/\d{12}/);
  const aadhaar = aadhaarMatch ? aadhaarMatch[0].replace(/\s/g, '') : undefined;

  // Name extraction logic (very basic, usually name is after "Government of India")
  // In a real production app, you'd use a more sophisticated OCR or a specialized API
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let name = undefined;
  
  // Heuristic: Name is often the first line that doesn't contain common Aadhaar keywords
  const keywords = ['government', 'india', 'male', 'female', 'dob', 'year', 'birth', 'address', 'father', 'husband'];
  for (const line of lines) {
    if (line.length > 5 && !keywords.some(k => line.toLowerCase().includes(k)) && !/\d/.test(line)) {
      name = line;
      break;
    }
  }

  return { name, aadhaar };
};
