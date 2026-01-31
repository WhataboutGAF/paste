// Using an in-memory Map as a temporary, non-persistent storage solution.
// In a production environment, this would be replaced with a Redis client.

const store = new Map<string, { text: string; timerId: NodeJS.Timeout }>();
const TTL = 5 * 60 * 1000; // 5 minutes
const CODE_LENGTH = 4;
const CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function generateCode(): string {
  let code: string;
  let attempts = 0;
  do {
    code = '';
    for (let i = 0; i < CODE_LENGTH; i++) {
      code += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
    }
    attempts++;
    // In the unlikely event of a collision storm, break the loop.
    if (attempts > 10) {
      throw new Error('Failed to generate a unique code.');
    }
  } while (store.has(code));
  return code;
}

export function storeText(text: string): string {
  const code = generateCode();

  const timerId = setTimeout(() => {
    store.delete(code);
  }, TTL);

  store.set(code, { text, timerId });

  return code;
}

export function retrieveText(code: string): string | null {
  const entry = store.get(code.toUpperCase());

  if (entry) {
    // Clear the auto-delete timer and delete the entry immediately.
    clearTimeout(entry.timerId);
    store.delete(code.toUpperCase());
    return entry.text;
  }

  return null;
}
