// ============================
// ✅ API Service dengan TypeScript Support - UPDATED
// ============================

const API_BASE_URL = 'http://127.0.0.1:8000/api';

// ============================
// 🔹 Types
// ============================

export type PaymentMethod = 'cash' | 'debit' | 'credit';
export type OrderType = 'dine-in' | 'takeaway';
export type OrderStatus = 'pending' | 'processing' | 'ready' | 'completed';
export type MenuStatus = 'available' | 'unavailable';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CreateOrderRequest {
  customer_id?: string;
  order_type: OrderType;
  table_number?: string;
  payment_method?: PaymentMethod;
  order_items: Array<{
    menu_item_id: string;
    quantity: number;
  }>;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category_id: string;
  category_name?: string;
  status: MenuStatus;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  customer_id: string;
  total_amount: number;
  status: OrderStatus;
  order_type: OrderType;
  table_number?: string;
  payment_method: PaymentMethod;
  payment_status: 'pending' | 'paid';
  created_at: string;
  updated_at?: string;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'customer';
  phone?: string;
  status?: 'active' | 'inactive';
  created_at: string;
  updated_at?: string;
}

// ============================
// 🔹 ApiService Class
// ============================

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // ✅ Universal request handler
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      
      // Add auth token if exists
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      };

      console.log(`API Request: ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();
      console.log(`API Response:`, data);

      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // ============================
  // 🔹 Auth APIs
  // ============================

  async login(email: string, password: string) {
    return this.request<{ token: string; user: User }>('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // ============================
  // 🔹 User APIs
  // ============================

  async getUsers<T = {data: User[]}>() {
    return this.request<T>('/users');
  }

  async createUser(userData: {
    email: string;
    password: string;
    full_name: string;
    role: string;
    phone?: string;
  }) {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: { full_name: string; phone?: string }) {
    return this.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================
  // 🔹 Category APIs
  // ============================

  async getCategories<T = Category[]>() {
    return this.request<T>('/categories');
  }

  async createCategory(categoryData: { name: string; description?: string }) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  // ============================
  // 🔹 Menu Item APIs - UPDATED
  // ============================

  async getMenuItems<T = MenuItem[]>(filters?: { category_id?: string; status?: string }) {
    const queryParams = new URLSearchParams();
    if (filters?.category_id) queryParams.append('category_id', filters.category_id);
    if (filters?.status) queryParams.append('status', filters.status);

    const endpoint = `/menu-items${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.request<T>(endpoint);
  }

  async getMenuItem(id: string) {
    return this.request<MenuItem>(`/menu-items/${id}`);
  }

  async createMenuItem(menuData: {
    name: string;
    description?: string;
    price: number;
    category_id: string;
    stock: number;
    image_url?: string;
    status?: MenuStatus;
  }) {
    return this.request<MenuItem>('/menu-items', {
      method: 'POST',
      body: JSON.stringify(menuData),
    });
  }

  async updateMenuItem(id: string, menuData: {
    name: string;
    description?: string;
    price: number;
    category_id: string;
    stock: number;
    image_url?: string;
    status: MenuStatus;
  }) {
    return this.request<MenuItem>(`/menu-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(menuData),
    });
  }

  async deleteMenuItem(id: string) {
    return this.request(`/menu-items/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================
  // 🔹 Order APIs - UPDATED
  // ============================

  async getOrders<T = Order[]>(filters?: { customer_id?: string; status?: string }) {
    const queryParams = new URLSearchParams();
    if (filters?.customer_id) queryParams.append('customer_id', filters.customer_id);
    if (filters?.status) queryParams.append('status', filters.status);

    const endpoint = `/orders${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.request<T>(endpoint);
  }

  async createOrder(orderData: CreateOrderRequest) {
    return this.request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrderStatus(id: string, statusData: { 
    status?: OrderStatus; 
    payment_status?: 'pending' | 'paid' 
  }) {
    return this.request<Order>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });
  }

  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  // ============================
  // 🔹 Payment APIs
  // ============================

  async getPayments<T = any[]>() {
    return this.request<T>('/payments');
  }

  async createPayment(paymentData: {
    order_id: string;
    amount: number;
    method: PaymentMethod;
    status?: string;
    transaction_id?: string;
  }) {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }
}

// ============================
// 🔹 Export Instance
// ============================

export const apiService = new ApiService();
export default apiService;