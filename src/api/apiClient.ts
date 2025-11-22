const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Default timeout: 60 seconds for file uploads, 30 seconds for other requests

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

    const isApplicationsJobEndpoint = url.includes('/api/applications/job/');

    // Suppress logging for applications/job endpoint to reduce noise
    if (!isApplicationsJobEndpoint) {
        console.log('API Request:', { url, method: options.method || 'GET', body: options.body });
    }

    const response = await fetch(url, { ...options, headers });

    // Suppress logging for 500 errors on applications/job endpoint
    if (!(isApplicationsJobEndpoint && response.status === 500)) {
        console.log('API Response status:', response.status, response.statusText);
    }

    if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
            errorData = JSON.parse(errorText);
        } catch {
            errorData = { message: errorText || 'An error occurred' };
        }

        // Include status code in error message for better debugging
        const errorMessage = errorData.message || errorData.error || response.statusText;
        const error = new Error(`${response.status}: ${errorMessage}`);
        (error as any).status = response.status;

        // Completely suppress logging for 500 errors on applications/job endpoint
        // These are expected when jobs don't have applications yet
        if (response.status === 500 && isApplicationsJobEndpoint) {
            // Silently throw - will be caught in applications.ts
            throw error;
        }

        // For other errors, log normally
        if (response.status === 500) {
            console.warn('API 500 Error (Backend Issue):', errorText);
        } else {
            console.error('API Error Response:', errorText);
        }

        throw error;
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
