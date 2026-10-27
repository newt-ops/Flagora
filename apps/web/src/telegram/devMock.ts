async function hmacSha256(key: unknown, data: string): Promise<Uint8Array> {
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    key as BufferSource,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await window.crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    new TextEncoder().encode(data),
  );
  return new Uint8Array(signature);
}

function bufferToHex(buffer: Uint8Array): string {
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function applyBrowserMockTheme(): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--tg-theme-bg-color', '#18222d');
  root.style.setProperty('--tg-theme-secondary-bg-color', '#131a22');
  root.style.setProperty('--tg-theme-text-color', '#ffffff');
  root.style.setProperty('--tg-theme-hint-color', '#708499');
  root.style.setProperty('--tg-theme-link-color', '#62bcf9');
  root.style.setProperty('--tg-theme-button-color', '#2ea6ff');
  root.style.setProperty('--tg-theme-button-text-color', '#ffffff');
  root.style.setProperty('--tg-theme-section-bg-color', '#18222d');
  root.style.setProperty('--tg-theme-section-separator-color', 'rgba(128, 128, 128, 0.16)');
  root.style.setProperty('--tg-theme-header-bg-color', '#18222d');
  root.style.setProperty('--tg-theme-accent-text-color', '#2ea6ff');
  root.style.setProperty('--tg-theme-subtitle-text-color', '#708499');
  root.style.setProperty('--tg-theme-destructive-text-color', '#ef4444');
}

export async function generateDevInitData(customUser?: {
  id?: number;
  first_name?: string;
  last_name?: string;
  username?: string;
}): Promise<string> {
  applyBrowserMockTheme();

  const botToken = 'test_bot_token_12345:ABCdefGHIjklMNOpqrSTUvwxYZ';
  const now = Math.floor(Date.now() / 1000);

  const searchParams =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const customId = searchParams?.get('userId') ? Number(searchParams.get('userId')) : undefined;
  const customName = searchParams?.get('name') ?? undefined;

  const userObj = customUser ?? {
    id: customId || 123456789,
    first_name: customName || 'Dev',
    last_name: 'Player',
    username: customName ? customName.toLowerCase() : 'dev_player',
  };

  const fields: Record<string, string> = {
    auth_date: String(now),
    query_id: 'DEV_QUERY_ID_123',
    user: JSON.stringify(userObj),
  };

  const keys = Object.keys(fields).sort((a, b) => a.localeCompare(b));
  const dataCheckString = keys.map((k) => `${k}=${fields[k]}`).join('\n');

  const webAppDataKey = new TextEncoder().encode('WebAppData');
  const secretKey = await hmacSha256(webAppDataKey, botToken);
  const hashBuffer = await hmacSha256(secretKey, dataCheckString);
  const hash = bufferToHex(hashBuffer);

  const params = new URLSearchParams(fields);
  params.set('hash', hash);
  return params.toString();
}
