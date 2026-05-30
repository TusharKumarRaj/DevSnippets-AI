import * as SecureStore from 'expo-secure-store';

const API_KEY_STORAGE = 'devsnippets_ai_key';
const API_PROVIDER_STORAGE = 'devsnippets_ai_provider';

export type AiProvider = 'gemini' | 'openai';

export async function getApiKey(): Promise<string | null> {
  return SecureStore.getItemAsync(API_KEY_STORAGE);
}

export async function setApiKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(API_KEY_STORAGE, key);
}

export async function deleteApiKey(): Promise<void> {
  await SecureStore.deleteItemAsync(API_KEY_STORAGE);
}

export async function getProvider(): Promise<AiProvider> {
  const provider = await SecureStore.getItemAsync(API_PROVIDER_STORAGE);
  return (provider as AiProvider) || 'openai';
}

export async function setProvider(provider: AiProvider): Promise<void> {
  await SecureStore.setItemAsync(API_PROVIDER_STORAGE, provider);
}

export async function explainCode(code: string, language: string): Promise<string> {
  let apiKey = await getApiKey();
  const provider = await getProvider();

  if (!apiKey) {
    // Fallback to .env keys if SecureStore is empty
    if (provider === 'gemini') apiKey = process.env.EXPO_PUBLIC_GEMINI_KEY || null;
    if (provider === 'openai') apiKey = process.env.EXPO_PUBLIC_OPENAI_KEY || null;
  }

  if (!apiKey) {
    throw new Error('API key not configured. Go to Settings to add your API key.');
  }

  const prompt = `You are a senior developer. Analyze this ${language} code snippet and provide:

1. **Explanation**: What this code does, step by step.
2. **Summary**: A brief one-liner summary.
3. **Improvements**: Suggestions to improve the code (readability, performance, best practices).

Code:
\`\`\`${language.toLowerCase()}
${code}
\`\`\`

Respond in clean markdown format.`;

  if (provider === 'gemini') {
    return callGemini(apiKey, prompt);
  } else {
    return callOpenAI(apiKey, prompt);
  }
}

async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${res.status} - ${err}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
}

async function callOpenAI(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error: ${res.status} - ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'No response generated.';
}
