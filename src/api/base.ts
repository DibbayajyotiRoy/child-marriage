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

    console.log(`[BaseApiService] Making ${config.method || 'GET'} request to ${url}`, {
        headers: config.headers,
    });


    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); 
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

      // --- START: THE FIX ---
      // Check for 204 No Content status. If so, the request was successful
      // but there is no body to parse. Return null to signify this.
      if (response.status === 204) {
        return null as unknown as T;
      }
      // --- END: THE FIX ---

      // If the response was successful and was NOT a 204, it has a body.
      // Now it's safe to parse the JSON.
      return await response.json();
      
    } catch (error) {
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