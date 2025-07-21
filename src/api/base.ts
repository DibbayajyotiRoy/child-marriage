// Base API configuration and utilities
export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export class BaseApiService {
  protected async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('authToken');

    // --- Enhanced Logging: Check if the token exists ---
    if (!token) {
      console.warn(`[BaseApiService] No auth token found in localStorage for request to ${url}`);
    }
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    // --- Enhanced Logging: Log the final request config ---
    console.log(`[BaseApiService] Making ${config.method || 'GET'} request to ${url}`, {
        headers: config.headers,
    });


    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // --- Enhanced Logging: Attempt to get more error details ---
        const errorData = await response.json().catch(() => ({})); // Gracefully handle non-JSON error responses
        console.error(`[BaseApiService] API Error on ${url}:`, {
            status: response.status,
            statusText: response.statusText,
            responseData: errorData,
        });
        
        throw new ApiError(
          errorData.message || `HTTP Error ${response.status}`,
          response.status,
          errorData.code
        );
      }

      // On success, parse the JSON response
      return await response.json();
    } catch (error) {
      // Re-throw known API errors or create a generic one for network issues
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('[BaseApiService] Network or unknown error:', error);
      throw new ApiError('Network error occurred. Please check the console.', 0);
    }
  }

  protected get<T>(url: string): Promise<T> {
    return this.request<T>(url, { method: 'GET' });
  }

  protected post<T>(url: string, data?: any): Promise<T> {
    return this.request<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  protected put<T>(url: string, data?: any): Promise<T> {
    return this.request<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  protected delete<T>(url: string): Promise<T> {
    return this.request<T>(url, { method: 'DELETE' });
  }
}