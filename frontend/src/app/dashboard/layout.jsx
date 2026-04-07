// Dashboard layout — authenticated shell with sidebar, header, modals.
// The DashboardShell is a Client Component; it handles the auth guard,
// data fetching via useHabits, and provides the HabitsContext to children.
import { DashboardShell } from '../../components/DashboardShell';

export const metadata = {
  title: {
    default: 'Dashboard',
    template: '%s | Streakz',
  },
};

export default function DashboardLayout({ children }) {
  return <DashboardShell>{children}</DashboardShell>;
}
