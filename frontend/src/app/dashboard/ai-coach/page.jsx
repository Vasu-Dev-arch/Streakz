export const metadata = {
  title: 'AI Coach',
  description: 'Get personalized habit recommendations from AI. Describe your goals and receive a custom habit plan to build lasting routines.',
  keywords: ['AI coach', 'AI habits', 'habit generator', 'personalized habits', 'AI recommendation', 'goal based habits'],
  openGraph: {
    title: 'AI Habit Coach',
    description: 'Get personalized habit recommendations powered by AI. Describe your goals and start building lasting routines.',
  },
};

import { AiCoachPageClient } from '../../../components/views/AiCoachPageClient';

export default function AiCoachPage() {
  return <AiCoachPageClient />;
}
