import { AppError } from '../lib/auth.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

export async function generateHabitCoachPlan(goal) {
  if (!goal || typeof goal !== 'string' || !goal.trim()) {
    throw new AppError('goal is required', 400);
  }

  const trimmedGoal = goal.trim();
  if (trimmedGoal.length > 300) {
    throw new AppError('goal must be 300 characters or fewer', 400);
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new AppError('AI service is not configured', 503);
  }

  const systemPrompt = `You are a concise habit coach. When given a user goal, respond ONLY with a valid JSON object - no markdown, no code fences, no extra text.

The JSON must have this exact shape:
{
  "goal": "<restate the goal clearly in one sentence>",
  "habits": [
    {
      "name": "<short habit name, max 6 words>",
      "emoji": "<single relevant emoji>",
      "why": "<one sentence explaining why this habit helps the goal>",
      "frequency": "<e.g. Daily, 3x per week>"
    }
  ],
  "tip": "<one actionable motivational tip, max 2 sentences>"
}

Rules:
- Provide exactly 3 habits
- Keep all text concise and actionable
- Do not include any text outside the JSON object`;

  let groqResponse;
  try {
    groqResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `My goal: ${trimmedGoal}` },
        ],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });
  } catch (err) {
    console.error('[AI] Groq fetch error:', err);
    throw new AppError('Failed to reach AI service', 502);
  }

  if (!groqResponse.ok) {
    const errText = await groqResponse.text().catch(() => '');
    console.error('[AI] Groq error response:', groqResponse.status, errText);
    throw new AppError('AI service returned an error', 502);
  }

  const groqData = await groqResponse.json();
  const rawContent = groqData?.choices?.[0]?.message?.content;

  if (!rawContent) {
    throw new AppError('AI service returned an empty response', 502);
  }

  let plan;
  try {
    const cleaned = rawContent.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
    plan = JSON.parse(cleaned);
  } catch {
    console.error('[AI] Failed to parse LLM response as JSON:', rawContent);
    throw new AppError('AI returned an unexpected format. Please try again.', 502);
  }

  if (
    typeof plan.goal !== 'string' ||
    !Array.isArray(plan.habits) ||
    plan.habits.length !== 3 ||
    plan.habits.some((h) => typeof h.name !== 'string' || typeof h.emoji !== 'string') ||
    typeof plan.tip !== 'string'
  ) {
    console.error('[AI] Unexpected plan structure:', plan);
    throw new AppError('AI returned an unexpected format. Please try again.', 502);
  }

  return plan;
}
