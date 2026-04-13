export const metadata = {
  title: 'Heatmap',
  description: 'View your habit consistency with an interactive heatmap. See your progress over weeks and months at a glance.',
  keywords: ['heatmap', 'habit calendar', 'consistency', 'visualize habits', 'streak visualization'],
};

import { HeatmapPageClient } from '../../../components/views/HeatmapPageClient';

export default function HeatmapPage() {
  return <HeatmapPageClient />;
}
