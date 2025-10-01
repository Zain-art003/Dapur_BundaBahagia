import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ChefHat, Coffee, Cookie, LogOut, MapPin, Minus, Plus, ShoppingCart, Utensils,
  User, CreditCard, Receipt, History, Clock, Truck, CheckCircle, Calendar,
  Package, RefreshCw, Loader2, AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import apiService, { type PaymentMethod, type OrderType, type MenuStatus } from "../service/api";

// =============================
// ✅ Type Definitions
// =============================
interface Category {
  id: string;
  name: string;
  description?: string;
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id: string;
  category_name?: string;
  stock: number;
  image_url?: string;
  status: MenuStatus;
}

interface OrderItem {
  menu_item_id: string;
  quantity: number;
  price: number;
  subtotal: number;
  menu_name: string;
}

interface Order {
  id: string;
  customer_id: string;
  order_type: OrderType;
  table_number: string | null;
  status: string;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: string;
  created_at: string;
  customer_name?: string;
  customer_email?: string;
  order_items?: OrderItem[];
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  stock: number;
}

// =============================
// ✅ CustomerDashboard Component
// =============================
const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // States
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumber] = useState("");
  const [orderType, setOrderType] = useState<OrderType>("dine-in");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // =============================
  // ✅ Fetch Data Functions
  // =============================
  const fetchCategories = async () => {
    try {
      const response = await apiService.getCategories<Category[]>();
      if (response.success && response.data) {
        setCategories(response.data);
        // Set default selected category to "all" (show all menu)
        if (response.data.length > 0 && !selectedCategory) {
          setSelectedCategory("all");
        }
      } else {
        console.error("Failed to fetch categories:", response.error);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error",
        description: "Gagal memuat kategori",
        variant: "destructive",
      });
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await apiService.getMenuItems<{success: boolean; data: MenuItem[]}>();
      if (response.success && response.data && response.data.data) {
        setMenuItems(response.data.data);
      } else if (response.success && response.data && Array.isArray(response.data)) {
        // Handle direct array response
        setMenuItems(response.data);
      } else {
        console.error("Failed to fetch menu items:", response.error);
        setMenuItems([]); // Set empty array as fallback
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
      setMenuItems([]); // Set empty array as fallback
      toast({
        title: "Error",
        description: "Gagal memuat menu",
        variant: "destructive",
      });
    }
  };

  const fetchOrders = async () => {
    if (!user?.id) return;
    
    try {
      const response = await apiService.getOrders<{success: boolean; data: Order[]}>();
      if (response.success && response.data) {
        let userOrders: Order[] = [];

        if (Array.isArray(response.data)) {
          // Filter orders for current customer
          userOrders = response.data.filter((order: Order) => order.customer_id === user.id);
          setOrders(userOrders);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // Handle nested data structure
          userOrders = response.data.data.filter((order: Order) => order.customer_id === user.id);
          setOrders(userOrders);
        }

        // Debug: Log fetched orders to check total_amount values
        console.log('📦 Fetched orders for customer:', userOrders);
        console.log('💰 Total amounts:', userOrders.map(order => ({
          id: order.id,
          total_amount: order.total_amount,
          total_amount_type: typeof order.total_amount,
          total_amount_parsed: parseFloat(String(order.total_amount)) || 0,
          status: order.status
        })));
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Gagal memuat riwayat pesanan",
        variant: "destructive",
      });
    }
  };

  // Initial data fetch
  useEffect(() => {
    const loadInitialData = async () => {
      setInitialLoading(true);
      await Promise.all([
        fetchCategories(),
        fetchMenuItems(),
        fetchOrders()
      ]);
      setInitialLoading(false);
    };
    
    loadInitialData();
  }, [user?.id]);

  // Auto-refresh orders every 30 seconds
  useEffect(() => {
    if (!user?.id) return;
    
    const interval = setInterval(() => {
      fetchOrders();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [user?.id]);

  // =============================
  // ✅ Manual Refresh Function
  // =============================
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchCategories(),
      fetchMenuItems(),
      fetchOrders()
    ]);
    setRefreshing(false);
    toast({
      title: "Data diperbarui",
      description: "Menu dan pesanan berhasil dimuat ulang",
    });
  };

  // =============================
  // ✅ Cart Logic
  // =============================
  const addToCart = (item: MenuItem) => {
    if (item.stock <= 0) {
      toast({
        title: "Stok habis",
        description: `${item.name} sedang tidak tersedia`,
        variant: "destructive",
      });
      return;
    }

    const existingCartItem = cart.find((cartItem) => cartItem.id === item.id);
    const currentQuantityInCart = existingCartItem ? existingCartItem.quantity : 0;

    if (currentQuantityInCart >= item.stock) {
      toast({
        title: "Stok terbatas",
        description: `Maksimal ${item.stock} item untuk ${item.name}`,
        variant: "destructive",
      });
      return;
    }

    if (existingCartItem) {
      setCart(cart.map((cartItem) =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([
        ...cart,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          image_url: item.image_url,
          stock: item.stock
        }
      ]);
    }

    toast({
      title: "Ditambahkan ke keranjang",
      description: `${item.name} berhasil ditambahkan.`,
    });
  };

  const updateQuantity = (id: string, change: number) => {
    const item = cart.find(cartItem => cartItem.id === id);
    if (!item) return;

    const newQuantity = item.quantity + change;
    
    if (newQuantity <= 0) {
      setCart(cart.filter(cartItem => cartItem.id !== id));
      toast({
        title: "Item dihapus",
        description: `${item.name} dihapus dari keranjang`,
      });
    } else if (newQuantity > item.stock) {
      toast({
        title: "Stok terbatas",
        description: `Maksimal ${item.stock} item untuk ${item.name}`,
        variant: "destructive",
      });
    } else {
      setCart(cart.map(cartItem =>
        cartItem.id === id
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      ));
    }
  };

  const getTotal = () => cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const getTotalItems = () => cart.reduce((total, item) => total + item.quantity, 0);

  // =============================
  // ✅ Checkout Handler
  // =============================
  const handleCheckout = async () => {
    if (!user?.id) {
      toast({
        title: "Login dibutuhkan",
        description: "Silakan login terlebih dahulu.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Keranjang kosong",
        description: "Tambahkan menu terlebih dahulu.",
        variant: "destructive",
      });
      return;
    }

    if (orderType === "dine-in" && !tableNumber.trim()) {
      toast({
        title: "Nomor meja wajib",
        description: "Masukkan nomor meja untuk dine-in.",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      customer_id: user.id,
      order_type: orderType,
      table_number: orderType === "dine-in" ? tableNumber.trim() : null,
      payment_method: paymentMethod,
      order_items: cart.map((item) => ({
        menu_item_id: item.id,
        quantity: item.quantity,
      })),
    };

    setLoading(true);
    try {
      const response = await apiService.createOrder(orderData);

      if (response.success) {
        toast({
          title: "Pesanan berhasil dibuat",
          description: `Pesanan Anda sedang diproses. Order ID: ${response.data?.id?.slice(0, 8)}...`,
        });
        
        // Clear cart and form
        setCart([]);
        setTableNumber("");
        
        // Refresh data
        await Promise.all([fetchOrders(), fetchMenuItems()]);
      } else {
        throw new Error(response.error || "Gagal membuat pesanan");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Gagal membuat pesanan",
        description: error instanceof Error ? error.message : "Terjadi kesalahan. Coba lagi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // ✅ Logout Handler
  // =============================
  const handleLogout = () => {
    localStorage.clear();
    toast({
      title: "Logout berhasil",
      description: "Sampai jumpa kembali!",
    });
    navigate("/");
  };

  // =============================
  // ✅ Helper Functions
  // =============================
  const getFilteredMenuItems = (categoryId: string) => {
    return menuItems.filter((item) => item.category_id === categoryId && item.status === 'available');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatOrderStatus = (status: string) => {
    const statusMap = {
      pending: "Menunggu",
      processing: "Diproses",
      ready: "Siap",
      completed: "Selesai",
      cancelled: "Dibatalkan"
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'processing':
        return 'bg-blue-500';
      case 'ready':
        return 'bg-yellow-500';
      case 'pending':
        return 'bg-gray-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Loading state
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  // =============================
  // ✅ Render UI
  // =============================
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border/60 shadow-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-sm"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-3 border border-white/20 shadow-lg">
                <img
                  src="/logo.png"
                  alt="Logo Dapur Bunda Bahagia"
                  className="h-12 w-12 rounded-full object-cover"
                />
              </div>
            </div>
            <div>
              <h1 className="font-display text-xl font-bold">Dashboard Pelanggan</h1>
              <p className="text-sm text-muted-foreground">
                Selamat datang, {user?.full_name || "Pelanggan"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Cart Summary */}
            <div className="hidden sm:flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">
                {getTotalItems()} item - {formatCurrency(getTotal())}
              </span>
            </div>
            
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Keluar
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Utensils className="h-6 w-6 text-primary" />
                  <span>Menu Restoran</span>
                </CardTitle>
                <CardDescription>Pilih makanan favorit Anda</CardDescription>
              </CardHeader>
              <CardContent>
                {categories.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Kategori menu tidak tersedia</p>
                  </div>
                ) : (
                  <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                    <TabsList className={`grid w-full grid-cols-${Math.min(categories.length + 1, 5)}`}>
                      <TabsTrigger value="all" className="text-sm">
                        Semua Menu
                      </TabsTrigger>
                      {categories.map((cat) => (
                        <TabsTrigger key={cat.id} value={cat.id} className="text-sm">
                          {cat.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {/* Tab untuk semua menu */}
                    <TabsContent value="all">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {menuItems.filter(item => item.status === 'available').length === 0 ? (
                          <div className="col-span-full text-center py-8">
                            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground">
                              Tidak ada menu tersedia
                            </p>
                          </div>
                        ) : (
                          menuItems.filter(item => item.status === 'available').map((item) => (
                            <Card key={item.id} className="hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-3">
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-foreground">{item.name}</h3>
                                    <p className="text-xs text-muted-foreground">
                                      {categories.find(cat => cat.id === item.category_id)?.name || 'Kategori'}
                                    </p>
                                    {item.description && (
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {item.description}
                                      </p>
                                    )}
                                    <div className="flex items-center justify-between mt-2">
                                      <p className="font-bold text-primary">
                                        {formatCurrency(item.price)}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        Stok: {item.stock}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                
                                <Button
                                  onClick={() => addToCart(item)}
                                  disabled={item.stock <= 0}
                                  className="w-full"
                                >
                                  {item.stock <= 0 ? (
                                    "Habis"
                                  ) : (
                                    <>
                                      <Plus className="h-4 w-4 mr-1" />
                                      Tambah ke Keranjang
                                    </>
                                  )}
                                </Button>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    </TabsContent>

                    {categories.map((cat) => (
                      <TabsContent key={cat.id} value={cat.id}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          {getFilteredMenuItems(cat.id).length === 0 ? (
                            <div className="col-span-full text-center py-8">
                              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                              <p className="text-muted-foreground">
                                Tidak ada menu tersedia untuk kategori ini
                              </p>
                            </div>
                          ) : (
                            getFilteredMenuItems(cat.id).map((item) => (
                              <Card key={item.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                      <h3 className="font-semibold text-foreground">{item.name}</h3>
                                      {item.description && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                          {item.description}
                                        </p>
                                      )}
                                      <div className="flex items-center justify-between mt-2">
                                        <p className="font-bold text-primary">
                                          {formatCurrency(item.price)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          Stok: {item.stock}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <Button
                                    onClick={() => addToCart(item)}
                                    disabled={item.stock <= 0}
                                    className="w-full"
                                  >
                                    {item.stock <= 0 ? (
                                      "Habis"
                                    ) : (
                                      <>
                                        <Plus className="h-4 w-4 mr-1" />
                                        Tambah ke Keranjang
                                      </>
                                    )}
                                  </Button>
                                </CardContent>
                              </Card>
                            ))
                          )}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                )}
              </CardContent>
            </Card>

            {/* Order History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="h-6 w-6 text-primary" />
                  <span>Riwayat Pesanan</span>
                </CardTitle>
                <CardDescription>Lihat pesanan Anda sebelumnya</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Belum ada pesanan</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pesan menu favorit Anda sekarang!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="border border-border/40 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold">#{order.id.slice(0, 8)}...</p>
                            <p className="text-sm text-muted-foreground">
                              {order.order_type === 'dine-in' 
                                ? `Dine-in${order.table_number ? ` - Meja ${order.table_number}` : ''}` 
                                : 'Takeaway'
                              }
                            </p>
                          </div>
                          <Badge className={getStatusBadgeVariant(order.status)}>
                            {formatOrderStatus(order.status)}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium">
                            Total: {formatCurrency(order.total_amount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                  <span>Keranjang Pesanan</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Type Selection */}
                <div className="space-y-2">
                  <Label htmlFor="order-type">Tipe Pesanan</Label>
                  <Select value={orderType} onValueChange={(value: OrderType) => setOrderType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dine-in">Dine In</SelectItem>
                      <SelectItem value="takeaway">Takeaway</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Table Number for Dine In */}
                {orderType === "dine-in" && (
                  <div className="space-y-2">
                    <Label htmlFor="table-number">Nomor Meja</Label>
                    <Input
                      id="table-number"
                      placeholder="Contoh: 5"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                    />
                  </div>
                )}

                {/* Payment Method Selection */}
                <div className="space-y-2">
                  <Label htmlFor="payment-method">Metode Pembayaran</Label>
                  <Select value={paymentMethod} onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4" />
                          <span>Tunai</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="debit">
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4" />
                          <span>Kartu Debit</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="credit">
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4" />
                          <span>Kartu Kredit</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Cart Items */}
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Keranjang kosong</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pilih menu untuk mulai memesan
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="border border-border/40 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <p className="text-sm font-semibold">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(item.price)} × {item.quantity}
                          </p>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, -1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, 1)}
                              disabled={item.quantity >= item.stock}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Cart Summary */}
                {cart.length > 0 && (
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Items:</span>
                      <span className="font-medium">{getTotalItems()}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold text-primary">{formatCurrency(getTotal())}</span>
                    </div>

                    <Button
                      onClick={handleCheckout}
                      disabled={cart.length === 0 || loading}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Pesan Sekarang ({paymentMethod === 'cash' ? 'Tunai' : paymentMethod === 'debit' ? 'Kartu Debit' : 'Kartu Kredit'})
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      <Clock className="h-3 w-3 inline mr-1" />
                      Estimasi waktu: 15-20 menit
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;