const translate = require('@vitalets/google-translate-api');

export async function translateText(text: string): Promise<string> {
  const res = await translate(text, { from: 'ta', to: 'en' });
  return res.text;
}
