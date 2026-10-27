import { ExternalLink, Gamepad2, Play } from './icons.js';

interface NonTelegramFallbackProps {
  botUsername?: string;
  onEnterBrowserMode?: () => void;
}

export function NonTelegramFallback({ botUsername, onEnterBrowserMode }: NonTelegramFallbackProps) {
  const envUsername =
    typeof import.meta !== 'undefined'
      ? import.meta.env?.VITE_TELEGRAM_BOT_USERNAME || import.meta.env?.VITE_BOT_USERNAME
      : undefined;
  const rawUsername = botUsername || envUsername || 'flagora_bot';
  const cleanUsername = rawUsername.replace(/^@/, '');
  const telegramUrl = `https://t.me/${cleanUsername}`;

  const handleBrowserLaunch = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('flagora_browser_mode', 'true');
      if (onEnterBrowserMode) {
        onEnterBrowserMode();
      } else {
        window.location.reload();
      }
    }
  };

  return (
    <div className="flex min-h-[70vh] w-full max-w-md mx-auto flex-col items-center justify-center px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-tg-button/10 text-tg-button shadow-sm">
        <Gamepad2 className="h-10 w-10" />
      </div>

      <h1 className="mt-6 text-2xl font-bold tracking-tight text-tg-text">Flagora</h1>
      <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-tg-button">
        Play on Telegram
      </p>

      <div className="mt-6 rounded-2xl bg-tg-section p-5 text-left shadow-sm">
        <p className="text-sm leading-relaxed text-tg-text">
          Flagora is a fast-paced country flag trivia game built natively for Telegram Mini Apps.
        </p>
        <p className="mt-3 text-xs leading-relaxed text-tg-hint">
          To test your geography knowledge, compete on leaderboards, and battle opponents in live
          1v1 duels, launch from Telegram or enter Browser Preview mode.
        </p>
      </div>

      <a
        href={telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-tg-button px-5 py-3.5 text-sm font-semibold text-tg-button-text shadow-md transition-all active:scale-98 hover:opacity-90 active:opacity-75"
      >
        <span>Open in Telegram</span>
        <ExternalLink className="h-4 w-4" />
      </a>

      <button
        type="button"
        onClick={handleBrowserLaunch}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-tg-secondary-bg px-5 py-3 text-sm font-semibold text-tg-text shadow-sm transition-all hover:opacity-90 active:scale-98"
      >
        <Play className="h-4 w-4 text-tg-button fill-current" />
        <span>Test in Browser (Preview Mode)</span>
      </button>

      <p className="mt-4 text-xs text-tg-hint">
        Requires Telegram on mobile, desktop, or browser preview mode.
      </p>
    </div>
  );
}
