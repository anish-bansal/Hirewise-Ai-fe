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

    // Determine timeout based on request type
    const timeout = isFormData ? DEFAULT_TIMEOUT : DEFAULT_TIMEOUT_NON_UPLOAD;

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, { 
            ...options, 
            headers,
            signal: controller.signal 
        });

        clearTimeout(timeoutId);

        // Handle 499 status code (client closed connection / timeout)
        if (response.status === 499) {
            throw new TimeoutError('Request timed out. The server took too long to respond. Please try again.');
        }

        if (!response.ok) {
            // Try to parse error message from response
            let errorMessage = response.statusText;
            try {
                const error = await response.json();
                errorMessage = error.message || error.error || response.statusText;
            } catch {
                // If JSON parsing fails, use status text
                errorMessage = response.statusText;
            }

            // Provide user-friendly messages for common status codes
            if (response.status === 408 || response.status === 504) {
                throw new TimeoutError('Request timed out. Please try again.');
            } else if (response.status >= 500) {
                throw new Error(`Server error (${response.status}): ${errorMessage}. Please try again later.`);
            } else {
                throw new Error(errorMessage || `Request failed with status ${response.status}`);
            }
        }

        return response.json();
    } catch (error) {
        clearTimeout(timeoutId);

        // Handle AbortError (timeout)
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw new TimeoutError('Request timed out. The operation took too long. Please try again.');
            }
            // Re-throw our custom errors
            if (error instanceof TimeoutError || error instanceof NetworkError) {
                throw error;
            }
            // Handle network errors
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                throw new NetworkError('Network error. Please check your internet connection and try again.');
            }
        }

        throw error;
    }
}
