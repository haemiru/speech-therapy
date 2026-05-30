import { HydrationGuard } from '@/components/shared/HydrationGuard';

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <HydrationGuard>
      <div className="min-h-dvh bg-gradient-to-b from-sky-100 to-sky-200 flex flex-col">
        <div className="flex-1 w-full max-w-md mx-auto flex flex-col">
          {children}
        </div>
      </div>
    </HydrationGuard>
  );
}
