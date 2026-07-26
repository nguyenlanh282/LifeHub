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

  // Attempt 1: Direct proxied endpoint /api/* on lifehub.alita.vn
  try {
    const response = await fetch(cleanEndpoint, {
      headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
      ...options,
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (primaryErr) {
    console.warn('Relative path fetch warning, falling back to Workers API:', primaryErr);
  }

  // Attempt 2: Direct Workers domain https://lifehub-api.it-nguyenlanh.workers.dev
  const fallbackUrl = `https://lifehub-api.it-nguyenlanh.workers.dev${cleanEndpoint}`;
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
