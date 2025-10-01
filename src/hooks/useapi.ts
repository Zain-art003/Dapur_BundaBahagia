import { useState, useEffect, useCallback } from 'react';
import apiService from "@/service/api";

// Generic hook untuk API calls
export function useApi<T>(
  apiCall: () => Promise<any>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall();
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Hook untuk menu items
export function useMenuItems(filters?: { category_id?: string; status?: string }) {
  return useApi(
    () => apiService.getMenuItems(filters),
    [filters?.category_id, filters?.status]
  );
}

// Hook untuk categories
export function useCategories() {
  return useApi(() => apiService.getCategories());
}

// Hook untuk orders
export function useOrders(filters?: { customer_id?: string; status?: string }) {
  return useApi(
    () => apiService.getOrders(filters),
    [filters?.customer_id, filters?.status]
  );
}

// Hook untuk users
export function useUsers() {
  return useApi(() => apiService.getUsers());
}

// Hook untuk dashboard stats
export function useDashboardStats() {
  return useApi(() => apiService.getDashboardStats());
}

// Hook untuk authentication state
export function useAuth() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage untuk existing session
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setToken(savedToken);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    
    setLoading(false);
  }, []);

  const login = (userData: any, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    logout
  };
}

// Hook untuk mutations (create, update, delete)
export function useApiMutation<T = any>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (apiCall: () => Promise<any>): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall();
      if (response.success) {
        return response.data;
      } else {
        setError(response.error || 'Unknown error');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}