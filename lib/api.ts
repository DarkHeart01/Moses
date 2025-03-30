// Corrected lib/api.ts
const fetchApi = async <T>(url: string, options?: RequestInit & { body?: any }): Promise<T> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers || {})
      };
      
      // Create a new options object without the body property
      const { body, ...restOptions } = options || {};
      
      // Convert the body object to a JSON string if it exists
      const jsonBody = body ? JSON.stringify(body) : undefined;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
        ...restOptions,
        headers,
        body: jsonBody, // Now this is a string, which is a valid BodyInit type
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  };
  
  export default fetchApi;
  