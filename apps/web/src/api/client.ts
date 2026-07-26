const API_BASE =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168.'))
    ? ''
    : 'https://lifehub-api.it-nguyenlanh.workers.dev';

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'API request failed');
    throw new Error(`API Error (${response.status}): ${errorText}`);
  }

  return response.json();
}
