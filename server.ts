import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse incoming JSON bodies
  app.use(express.json());

  // API endpoint for Veterinarian Diagnostics using Gemini API (Lazy Initialization)
  app.post('/api/veterinary-gpt', async (req, res) => {
    try {
      const { category, symptom, details, lang, season } = req.body;

      // Check if API key is provided
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: 'GEMINI_API_KEY is not configured in the server environment. Please configure it in Settings > Secrets.'
        });
      }

      // Initialize the GoogleGenAI client with the key
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Construct a professional, structured veterinary assistant prompt
      const prompt = `
        You are an expert Nepalese Livestock and Poultry Veterinarian Consultant. Your task is to provide a comprehensive, actionable, and visually clear diagnostic report and treatment protocol.

        Input variables:
        - Animal Category: ${category}
        - Main Symptom category selected: ${symptom}
        - Additional Details described by user: ${details || 'None specified'}
        - Selected Language context: ${lang === 'ne' ? 'Nepali (नेपाली)' : 'English'}
        - Current Seasonal phase: ${season || 'General'}

        Ensure your response addresses the user's specific query:
        1. Sickness Details & Pathogen Identification. Describe if it matches coccidiosis (red diarrhea), pullorum/gumboro (white diarrhea), PPR in goats, foot rot, pigeon pox, or oxygen depletion in tilapia. Keep in mind that "red diarrhea/bloody stool" is a key indicator of Coccidiosis whereas "white watery diarrhea" is an indicator of Pullorum/Gumboro or secondary bacterial infection.
        2. Veterinary Remedies & Standard Medicine. Give exact medicine names popular in Nepal (like Amprolium, Tylosin, OTC Terramycin, Virkon-S sanitation, Potassium Permanganate, probiotics) and organic household remedies (like turmeric, ginger extracts, garlic water, neem paste, or oral rehydration salts/electrolytes).
        3. Strict Preventive Measures. Include bio-security guidelines, quarantine procedures, and standard vaccination requirements.
        4. Seasonal Advisory. Give specific tips for Summer (preventing heatstroke, electrolyte treatment, ventilation) and Winter (insulation, high-energy feed, brooding heaters, dry litter) for this animal type.

        Return your output in ${lang === 'ne' ? 'Nepali language with clear bold headings' : 'English language with clear bold headings'}. Maintain high-fidelity formatting, readable bullet points, and realistic dosages matching Nepalese agro-vets.
      `;

      // Call the Gemini model
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
      });

      const explanation = response.text;
      return res.json({ result: explanation });

    } catch (err: any) {
      console.error('Error in veterinary-gpt handler:', err);
      return res.status(500).json({
        error: 'System server-side error: ' + (err.message || err)
      });
    }
  });

  // Vite dev server setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static builds
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
