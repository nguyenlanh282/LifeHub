const PRIMARY_API = 'https://lifehub-api.alita.vn';
const FALLBACK_API = 'https://lifehub-api.it-nguyenlanh.workers.dev';

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  
  // Local development check
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168.'))) {
    const res = await fetch(cleanEndpoint, {
      headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
      ...options,
    });
    if (!res.ok) throw new Error(`API Error (${res.status})`);
    return res.json();
  }

  // Attempt 1: Primary custom domain lifehub-api.alita.vn
  try {
    const primaryUrl = `${PRIMARY_API}${cleanEndpoint}`;
    const response = await fetch(primaryUrl, {
      headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
      ...options,
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (primaryErr) {
    console.warn('Primary domain fetch warning, falling back to Workers API:', primaryErr);
  }

  // Attempt 2: Fallback Workers domain lifehub-api.it-nguyenlanh.workers.dev
  const fallbackUrl = `${FALLBACK_API}${cleanEndpoint}`;
  const fallbackResponse = await fetch(fallbackUrl, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
  });

  if (!fallbackResponse.ok) {
    const errorText = await fallbackResponse.text().catch(() => 'API request failed');
    throw new Error(`API Error (${fallbackResponse.status}): ${errorText}`);
  }

  return fallbackResponse.json();
}
