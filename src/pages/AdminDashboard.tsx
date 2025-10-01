import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  BarChart3,
  ChefHat,
  Coffee,
  Cookie,
  Edit3,
  LogOut,
  Package,
  Plus,
  Printer,
  Settings,
  ShoppingBag,
  Trash2,
  Users,
  Utensils,
  TrendingUp,
  DollarSign,
  Clock,
  Eye,
  X,
  Check,
  RefreshCw,
  Loader2
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import apiService, { MenuStatus, OrderStatus } from "../service/api";

// Types
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
  status: string;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  phone?: string;
  status?: string;
  created_at: string;
}

interface Order {
  id: string;
  customer_id: string;
  order_type: string;
  table_number?: string;
  status: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  created_at: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // States
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
  const [isViewUserOpen, setIsViewUserOpen] = useState(false);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Form state for new menu item
  const [newMenuItem, setNewMenuItem] = useState({
    name: "",
    category_id: "",
    price: "",
    stock: "",
    description: "",
    image_url: ""
  });


  // Fetch functions
  const fetchCategories = async () => {
    try {
      const response = await apiService.getCategories<Category[]>();
      if (response.success && response.data) {
        setCategories(response.data);
        // Set default category if none selected
        if (response.data.length > 0 && !newMenuItem.category_id) {
          setNewMenuItem(prev => ({ ...prev, category_id: response.data[0].id }));
        }
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
      const response = await apiService.getMenuItems<MenuItem[]>();
      if (response.success && response.data) {
        setMenuItems(response.data);
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
      toast({
        title: "Error",
        description: "Gagal memuat menu items",
        variant: "destructive",
      });
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await apiService.getUsers<User[]>();
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Gagal memuat users",
        variant: "destructive",
      });
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await apiService.getOrders<Order[]>();
      if (response.success && response.data) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      // Don't show toast for background refresh errors
      if (!refreshing) {
        toast({
          title: "Error",
          description: "Gagal memuat pesanan",
          variant: "destructive",
        });
      }
    }
  };

  // Initial data fetch
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchCategories(),
          fetchMenuItems(),
          fetchUsers(),
          fetchOrders()
        ]);
      } catch (error) {
        console.error("Failed to load initial data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !refreshing) {
        handleRefreshAll();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [loading, refreshing]);

  // Add an effect to recalculate stats whenever orders change
  useEffect(() => {
    // Stats will automatically recalculate when orders state changes
    // This ensures real-time updates when new orders are created
  }, [orders, users, menuItems]);

  // Refresh all data
  const handleRefreshAll = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchCategories(),
        fetchMenuItems(),
        fetchUsers(),
        fetchOrders()
      ]);

      // Force re-render by updating a dummy state
      setRefreshing(false);

      toast({
        title: "Data diperbarui",
        description: "Semua data berhasil dimuat ulang",
      });
    } catch (error) {
      setRefreshing(false);
      toast({
        title: "Error",
        description: "Gagal memperbarui data",
        variant: "destructive",
      });
    }
  };

  // Menu item handlers
  const handleAddMenuItem = async () => {
    if (!newMenuItem.name || !newMenuItem.price || !newMenuItem.stock || !newMenuItem.category_id) {
      toast({
        title: "Error",
        description: "Mohon isi semua field yang diperlukan",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const menuData = {
        name: newMenuItem.name,
        description: newMenuItem.description,
        price: parseInt(newMenuItem.price),
        category_id: newMenuItem.category_id,
        stock: parseInt(newMenuItem.stock),
        image_url: newMenuItem.image_url,
        status: "available" as MenuStatus
      };

      const response = await apiService.createMenuItem(menuData);
      
      if (response.success) {
        await fetchMenuItems(); // Refresh menu items
        
        setNewMenuItem({ 
          name: "", 
          category_id: categories.length > 0 ? categories[0].id : "",
          price: "", 
          stock: "", 
          description: "",
          image_url: ""
        });
        setIsAddMenuOpen(false);
        
        toast({
          title: "Menu ditambahkan",
          description: "Item menu baru berhasil ditambahkan ke database",
        });
      } else {
        throw new Error(response.error || "Gagal menambahkan menu");
      }
    } catch (error) {
      console.error("Error adding menu item:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal menambahkan menu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditMenuItem = (item: MenuItem) => {
    setSelectedItem(item);
    setIsEditMenuOpen(true);
  };

  const handleUpdateMenuItem = async () => {
    if (!selectedItem) return;

    setLoading(true);
    try {
      const updateData = {
        name: selectedItem.name,
        description: selectedItem.description,
        price: selectedItem.price,
        category_id: selectedItem.category_id,
        stock: selectedItem.stock,
        image_url: selectedItem.image_url,
        status: selectedItem.status as MenuStatus
      };

      const response = await apiService.updateMenuItem(selectedItem.id, updateData);
      
      if (response.success) {
        await fetchMenuItems(); // Refresh menu items
        setIsEditMenuOpen(false);
        toast({
          title: "Menu diperbarui",
          description: "Item menu berhasil diperbarui",
        });
      } else {
        throw new Error(response.error || "Gagal memperbarui menu");
      }
    } catch (error) {
      console.error("Error updating menu item:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal memperbarui menu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (!confirm("Yakin ingin menghapus menu ini?")) return;

    setLoading(true);
    try {
      const response = await apiService.deleteMenuItem(id);

      if (response.success) {
        await fetchMenuItems(); // Refresh menu items
        toast({
          title: "Item dihapus",
          description: "Menu berhasil dihapus dari sistem",
        });
      } else {
        throw new Error(response.error || "Gagal menghapus menu");
      }
    } catch (error) {
      console.error("Error deleting menu item:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal menghapus menu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  // User handlers
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewUserOpen(true);
  };

  const handleUpdateUser = async (userId: string, userData: { full_name: string; phone?: string }) => {
    try {
      const response = await apiService.updateUser(userId, userData);
      if (response.success) {
        await fetchUsers();
        toast({
          title: "User diperbarui",
          description: "Data pengguna berhasil diperbarui",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memperbarui data pengguna",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Yakin ingin menghapus user ini?")) return;

    try {
      const response = await apiService.deleteUser(id);
      if (response.success) {
        await fetchUsers();
        toast({
          title: "User dihapus",
          description: "Akun pengguna berhasil dihapus",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus pengguna",
        variant: "destructive",
      });
    }
  };

  // Order handlers
  const handleViewOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailOpen(true);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await apiService.updateOrderStatus(orderId, { status: newStatus as OrderStatus });
      if (response.success) {
        await fetchOrders();
        toast({
          title: "Status diperbarui",
          description: `Pesanan ${orderId} diubah ke ${newStatus}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memperbarui status pesanan",
        variant: "destructive",
      });
    }
  };

  const handlePrintReceipt = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      const receiptContent = `
STRUK PEMBAYARAN
Dapur Bunda Bahagia
========================
Order ID: ${order.id}
Tanggal: ${new Date(order.created_at).toLocaleDateString('id-ID')}
${order.order_type === 'dine-in' ? `Meja: ${order.table_number}` : 'Takeaway'}

========================
TOTAL: Rp ${order.total_amount.toLocaleString()}
========================

Terima kasih!
      `;
      
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`<pre>${receiptContent}</pre>`);
        printWindow.document.close();
        printWindow.print();
        
        toast({
          title: "Struk dicetak",
          description: `Struk untuk pesanan ${orderId} sedang dicetak`,
        });
      }
    }
  };

  const handleLogout = () => {
    toast({
      title: "Logout berhasil",
      description: "Sampai jumpa Admin!",
    });
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  // Calculate stats
  const completedOrders = orders.filter(order => order.status === 'completed');
  const pendingOrders = orders.filter(order => order.status === 'pending');
  const processingOrders = orders.filter(order => order.status === 'processing');

  const stats = {
    totalOrders: orders.length,
    completedOrders: completedOrders.length,
    pendingOrders: pendingOrders.length,
    processingOrders: processingOrders.length,
    todayRevenue: completedOrders.reduce((sum, order) => sum + (parseFloat(String(order.total_amount)) || 0), 0),
    activeUsers: users.filter(user => user.status === 'active').length,
    menuItems: menuItems.length,
    availableMenuItems: menuItems.filter(item => item.status === 'available').length,
    lowStockItems: menuItems.filter(item => item.stock < 20 && item.stock > 0).length,
    outOfStockItems: menuItems.filter(item => item.stock === 0).length
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Unknown';
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
        {/* Header */}
        <header className="bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 shadow-lg border-b-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
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
                <h1 className="font-display text-2xl font-bold text-white tracking-wide">Dashboard Admin</h1>
                <p className="text-sm text-orange-100 font-medium">Dapur Bunda Bahagia</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshAll}
                disabled={refreshing}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-200 shadow-lg"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20 shadow-lg">
                <Badge className="bg-white/90 text-orange-600 font-semibold border-0">Administrator</Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="bg-white/10 border-white/20 text-white hover:bg-red-500/20 backdrop-blur-sm transition-all duration-200 shadow-lg"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-md border border-orange-200/60 shadow-lg h-12">
            <TabsTrigger
              value="overview"
              className="flex items-center space-x-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white transition-all duration-200"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="menu"
              className="flex items-center space-x-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white transition-all duration-200"
            >
              <Utensils className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Menu</span>
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="flex items-center space-x-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white transition-all duration-200"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Pesanan</span>
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="flex items-center space-x-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white transition-all duration-200"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Users</span>
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="flex items-center space-x-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white transition-all duration-200"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Laporan</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/90 backdrop-blur-sm border border-orange-200/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Total Pesanan</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Selesai: {stats.completedOrders} | Pending: {stats.pendingOrders}
                      </p>
                    </div>
                    <div className="bg-orange-600 rounded-full p-3 shadow-md">
                      <ShoppingBag className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border border-orange-200/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Total Pendapatan</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">Rp {stats.todayRevenue.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Dari {stats.completedOrders} pesanan selesai
                      </p>
                    </div>
                    <div className="bg-orange-600 rounded-full p-3 shadow-md">
                      <DollarSign className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border border-orange-200/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Menu Tersedia</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.availableMenuItems}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Stok rendah: {stats.lowStockItems} | Habis: {stats.outOfStockItems}
                      </p>
                    </div>
                    <div className="bg-orange-600 rounded-full p-3 shadow-md">
                      <Package className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border border-orange-200/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Pengguna Aktif</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeUsers}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Dari {users.length} total pengguna
                      </p>
                    </div>
                    <div className="bg-orange-600 rounded-full p-3 shadow-md">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-2xl hover:shadow-3xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="font-display text-lg text-gray-900">Pesanan Terbaru</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-200">
                        <div>
                          <p className="font-semibold text-gray-900">{order.id}</p>
                          <p className="text-sm text-gray-600">
                            {order.order_type === 'dine-in' ? `Meja ${order.table_number}` : 'Takeaway'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">Rp {order.total_amount.toLocaleString()}</p>
                          <Badge className={`${order.status === 'completed' ? 'bg-green-600' : 'bg-yellow-600'} text-white`}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-2xl hover:shadow-3xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="font-display text-lg text-gray-900">Menu Tersedia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {menuItems.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-200">
                        <div>
                          <p className="font-semibold text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">{getCategoryName(item.category_id)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">Rp {item.price.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">Stok: {item.stock}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>


          {/* Menu Management Tab */}
          <TabsContent value="menu" className="space-y-6 mt-6">
            <Card className="bg-white/90 backdrop-blur-sm border border-orange-200/60 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-display flex items-center text-gray-900">
                      <Utensils className="mr-2 h-6 w-6 text-orange-600" />
                      Manajemen Menu
                    </CardTitle>
                    <CardDescription className="text-gray-600">Kelola menu restoran</CardDescription>
                  </div>
                  <Dialog open={isAddMenuOpen} onOpenChange={setIsAddMenuOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg">
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Menu
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Tambah Menu Baru</DialogTitle>
                        <DialogDescription>
                          Masukkan detail menu baru
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Nama Menu</Label>
                          <Input
                            id="name"
                            value={newMenuItem.name}
                            onChange={(e) => setNewMenuItem({...newMenuItem, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">Kategori</Label>
                          <Select 
                            value={newMenuItem.category_id} 
                            onValueChange={(value) => setNewMenuItem({...newMenuItem, category_id: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="price">Harga</Label>
                          <Input
                            id="price"
                            type="number"
                            value={newMenuItem.price}
                            onChange={(e) => setNewMenuItem({...newMenuItem, price: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="stock">Stok</Label>
                          <Input
                            id="stock"
                            type="number"
                            value={newMenuItem.stock}
                            onChange={(e) => setNewMenuItem({...newMenuItem, stock: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Deskripsi</Label>
                          <Textarea
                            id="description"
                            value={newMenuItem.description}
                            onChange={(e) => setNewMenuItem({...newMenuItem, description: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="image_url">URL Gambar (Optional)</Label>
                          <Input
                            id="image_url"
                            value={newMenuItem.image_url}
                            onChange={(e) => setNewMenuItem({...newMenuItem, image_url: e.target.value})}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddMenuOpen(false)}>
                          Batal
                        </Button>
                        <Button onClick={handleAddMenuItem} disabled={loading}>
                          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Tambah
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {menuItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-white/70 backdrop-blur-sm border border-orange-200/60 rounded-lg hover:shadow-md transition-all duration-200">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">{getCategoryName(item.category_id)}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-orange-600 font-semibold">Rp {item.price.toLocaleString()}</span>
                          <span className="text-sm text-gray-600">Stok: {item.stock}</span>
                          <Badge className={item.status === 'available' ? 'bg-green-600' : 'bg-red-600'}>
                            {item.status === 'available' ? 'Tersedia' : 'Habis'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditMenuItem(item)} className="border-orange-200 text-orange-700 hover:bg-orange-50">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteMenuItem(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6 mt-6">
            <Card className="bg-white/90 backdrop-blur-sm border border-orange-200/60 shadow-lg">
              <CardHeader>
                <CardTitle className="font-display flex items-center text-gray-900">
                  <ShoppingBag className="mr-2 h-6 w-6 text-orange-600" />
                  Manajemen Pesanan
                </CardTitle>
                <CardDescription className="text-gray-600">Kelola dan pantau pesanan pelanggan</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="p-4 bg-white/70 backdrop-blur-sm border border-orange-200/60 rounded-lg hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{order.id}</h3>
                          <p className="text-sm text-gray-600">
                            {order.order_type === 'dine-in' ? `Meja ${order.table_number}` : 'Takeaway'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.created_at).toLocaleString('id-ID')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-orange-600">Rp {order.total_amount.toLocaleString()}</p>
                          <Badge className={order.status === 'completed' ? 'bg-green-600' : order.status === 'pending' ? 'bg-yellow-600' : 'bg-blue-600'}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 mt-3">
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                        >
                          <SelectTrigger className="w-32 border-orange-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="ready">Ready</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePrintReceipt(order.id)}
                          className="border-orange-200 text-orange-700 hover:bg-orange-50"
                        >
                          <Printer className="mr-1 h-4 w-4" />
                          Cetak Struk
                        </Button>

                        <Button variant="outline" size="sm" onClick={() => handleViewOrderDetail(order)} className="border-orange-200 text-orange-700 hover:bg-orange-50">
                          <Eye className="mr-1 h-4 w-4" />
                          Detail
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6 mt-6">
            <Card className="bg-white/90 backdrop-blur-sm border border-orange-200/60 shadow-lg">
              <CardHeader>
                <CardTitle className="font-display flex items-center text-gray-900">
                  <Users className="mr-2 h-6 w-6 text-orange-600" />
                  Manajemen Pengguna
                </CardTitle>
                <CardDescription className="text-gray-600">Kelola akun pengguna sistem</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-white/70 backdrop-blur-sm border border-orange-200/60 rounded-lg hover:shadow-md transition-all duration-200">
                      <div>
                        <h3 className="font-semibold text-gray-900">{user.full_name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={user.role === 'admin' ? 'bg-purple-600' : 'bg-blue-600'}>
                            {user.role}
                          </Badge>
                          <Badge className={user.status === 'active' ? 'bg-green-600' : 'bg-red-600'}>
                            {user.status || 'active'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewUser(user)} className="border-orange-200 text-orange-700 hover:bg-orange-50">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/90 backdrop-blur-sm border border-orange-200/60 shadow-lg">
                <CardHeader>
                  <CardTitle className="font-display flex items-center text-gray-900">
                    <TrendingUp className="mr-2 h-6 w-6 text-orange-600" />
                    Laporan Penjualan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-orange-50/80 rounded-lg border border-orange-200/60">
                      <span className="text-gray-900 font-medium">Total Pendapatan</span>
                      <span className="font-bold text-orange-600">Rp {stats.todayRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50/80 rounded-lg border border-green-200/60">
                      <span className="text-gray-900 font-medium">Pesanan Selesai</span>
                      <span className="font-bold text-green-600">{stats.completedOrders}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50/80 rounded-lg border border-blue-200/60">
                      <span className="text-gray-900 font-medium">Rata-rata per Pesanan</span>
                      <span className="font-bold text-blue-600">
                        Rp {stats.completedOrders > 0 ? Math.round(stats.todayRevenue / stats.completedOrders).toLocaleString() : 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50/80 rounded-lg border border-yellow-200/60">
                      <span className="text-gray-900 font-medium">Pending Orders</span>
                      <span className="font-bold text-yellow-600">{stats.pendingOrders}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border border-orange-200/60 shadow-lg">
                <CardHeader>
                  <CardTitle className="font-display flex items-center text-gray-900">
                    <Package className="mr-2 h-6 w-6 text-orange-600" />
                    Laporan Stok
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {menuItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-white/70 backdrop-blur-sm border border-orange-200/60 rounded-lg">
                        <div>
                          <span className="text-gray-900 font-medium">{item.name}</span>
                          <p className="text-sm text-gray-600">{getCategoryName(item.category_id)}</p>
                        </div>
                        <div className="text-right">
                          <span className={`font-bold ${item.stock < 20 ? 'text-red-600' : 'text-green-600'}`}>
                            {item.stock}
                          </span>
                          <p className="text-xs text-gray-500">unit</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Menu Dialog */}
      <Dialog open={isEditMenuOpen} onOpenChange={setIsEditMenuOpen}>
        <DialogContent className="bg-white/95 backdrop-blur-md border border-orange-200/60">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Edit Menu</DialogTitle>
            <DialogDescription className="text-gray-600">
              Ubah detail menu yang dipilih
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nama Menu</Label>
                <Input
                  id="edit-name"
                  value={selectedItem.name}
                  onChange={(e) => setSelectedItem({...selectedItem, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Kategori</Label>
                <Select 
                  value={selectedItem.category_id} 
                  onValueChange={(value) => setSelectedItem({...selectedItem, category_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-price">Harga</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={selectedItem.price}
                  onChange={(e) => setSelectedItem({...selectedItem, price: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="edit-stock">Stok</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={selectedItem.stock}
                  onChange={(e) => setSelectedItem({...selectedItem, stock: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Deskripsi</Label>
                <Textarea
                  id="edit-description"
                  value={selectedItem.description || ''}
                  onChange={(e) => setSelectedItem({...selectedItem, description: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={selectedItem.status} 
                  onValueChange={(value) => setSelectedItem({...selectedItem, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Tersedia</SelectItem>
                    <SelectItem value="unavailable">Habis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditMenuOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleUpdateMenuItem} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* View User Dialog */}
      <Dialog open={isViewUserOpen} onOpenChange={setIsViewUserOpen}>
        <DialogContent className="bg-white/95 backdrop-blur-md border border-orange-200/60">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Detail Pengguna</DialogTitle>
            <DialogDescription className="text-gray-600">
              Informasi lengkap pengguna
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Nama</Label>
                  <p className="text-sm text-muted-foreground">{selectedUser.full_name}</p>
                </div>
                <div>
                  <Label className="font-semibold">Email</Label>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="font-semibold">Role</Label>
                  <Badge className={selectedUser.role === 'admin' ? 'bg-purple-500' : 'bg-blue-500'}>
                    {selectedUser.role}
                  </Badge>
                </div>
                <div>
                  <Label className="font-semibold">Status</Label>
                  <Badge className={selectedUser.status === 'active' ? 'bg-green-500' : 'bg-red-500'}>
                    {selectedUser.status || 'active'}
                  </Badge>
                </div>
                <div>
                  <Label className="font-semibold">Telepon</Label>
                  <p className="text-sm text-muted-foreground">{selectedUser.phone || '-'}</p>
                </div>
                <div>
                  <Label className="font-semibold">Bergabung</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedUser.created_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewUserOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Detail Dialog */}
      <Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
        <DialogContent className="max-w-md bg-white/95 backdrop-blur-md border border-orange-200/60">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Detail Pesanan</DialogTitle>
            <DialogDescription className="text-gray-600">
              Informasi lengkap pesanan
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Order ID</Label>
                  <p className="text-sm text-muted-foreground">{selectedOrder.id}</p>
                </div>
                <div>
                  <Label className="font-semibold">Status</Label>
                  <Badge className={selectedOrder.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}>
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div>
                  <Label className="font-semibold">Waktu</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedOrder.created_at).toLocaleString('id-ID')}
                  </p>
                </div>
                <div>
                  <Label className="font-semibold">Tipe</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.order_type === 'dine-in' ? `Dine-in${selectedOrder.table_number ? ` (Meja ${selectedOrder.table_number})` : ''}` : 'Takeaway'}
                  </p>
                </div>
                <div>
                  <Label className="font-semibold">Metode Bayar</Label>
                  <p className="text-sm text-muted-foreground">{selectedOrder.payment_method}</p>
                </div>
                <div>
                  <Label className="font-semibold">Status Bayar</Label>
                  <Badge className={selectedOrder.payment_status === 'paid' ? 'bg-green-500' : 'bg-red-500'}>
                    {selectedOrder.payment_status}
                  </Badge>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <Label className="font-semibold text-lg">Total</Label>
                  <span className="font-bold text-xl text-primary">Rp {selectedOrder.total_amount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => handlePrintReceipt(selectedOrder?.id)}>
              <Printer className="mr-1 h-4 w-4" />
              Cetak Struk
            </Button>
            <Button onClick={() => setIsOrderDetailOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;