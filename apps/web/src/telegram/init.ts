import { isTMA, retrieveRawInitData, bindThemeParamsCssVars } from '@telegram-apps/sdk';

export interface TelegramInitResult {
  initData: string;
  isDev: boolean;
}

export class NotInTelegramError extends Error {
  readonly code = 'NOT_IN_TELEGRAM';
  constructor(message = 'This application must be launched from Telegram.') {
    super(message);
    this.name = 'NotInTelegramError';
  }
}

export async function initTelegramApp(): Promise<TelegramInitResult> {
  const inTelegram = isTMA();

  if (inTelegram) {
    try {
      bindThemeParamsCssVars();
    } catch {
      void 0;
    }

    const raw = retrieveRawInitData();
    if (raw) {
      return {
        initData: raw,
        isDev: false,
      };
    }
  }

  const isBrowserMode =
    import.meta.env.DEV ||
    (typeof window !== 'undefined' &&
      (window.location.search.includes('browser=true') ||
        window.location.search.includes('test=true') ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.localStorage.getItem('flagora_browser_mode') === 'true'));

  if (isBrowserMode) {
    const { generateDevInitData } = await import('./devMock.js');
    const mockInitData = await generateDevInitData();
    return {
      initData: mockInitData,
      isDev: true,
    };
  }

  throw new NotInTelegramError();
}
