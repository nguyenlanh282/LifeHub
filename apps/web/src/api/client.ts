const getApiBase = () => {
  if (typeof window === 'undefined') return 'https://lifehub-api.alita.vn';
  const host = window.location.hostname;
  if (host === 'localhost' || host.startsWith('192.168.')) {
    return '';
  }
  return 'https://lifehub-api.alita.vn';
};

const API_BASE = getApiBase();

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
