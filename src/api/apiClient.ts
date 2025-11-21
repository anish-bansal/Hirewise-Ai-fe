const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Default timeout: 60 seconds for file uploads, 30 seconds for other requests
const DEFAULT_TIMEOUT = 60000; // 60 seconds
const DEFAULT_TIMEOUT_NON_UPLOAD = 30000; // 30 seconds

export class TimeoutError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TimeoutError';
    }
}

export class NetworkError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NetworkError';
    }
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Handle FormData which shouldn't have Content-Type header set manually
    const isFormData = options.body instanceof FormData;
    if (isFormData) {
        delete (headers as any)['Content-Type'];
    }

    console.log('API Request:', { url, method: options.method || 'GET', body: options.body });

    const response = await fetch(url, { ...options, headers });

    console.log('API Response status:', response.status, response.statusText);

    if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        let errorData;
        try {
            errorData = JSON.parse(errorText);
        } catch {
            errorData = { message: errorText || 'An error occurred' };
        }
        throw new Error(errorData.message || response.statusText);
    }

    const responseText = await response.text();
    console.log('API Response body:', responseText);

    try {
        return JSON.parse(responseText);
    } catch (e) {
        console.error('Failed to parse JSON response:', e);
        throw new Error('Invalid JSON response from server');
    }
}
