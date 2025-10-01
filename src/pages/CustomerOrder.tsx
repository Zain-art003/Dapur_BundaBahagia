import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShoppingCart,
  Plus,
  Minus,
  ChefHat,
  Clock,
  DollarSign,
  ArrowLeft,
} from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"; // ✅ sudah lengkap

// Mock menu data
const menuItems = {
  "Makanan Utama": [
    { id: 1, name: "Nasi Gudeg", price: 25000, description: "Nasi dengan gudeg khas Yogyakarta", available: true },
    { id: 2, name: "Ayam Bakar", price: 30000, description: "Ayam bakar dengan bumbu rempah", available: true },
    { id: 3, name: "Rendang Daging", price: 35000, description: "Rendang daging sapi khas Padang", available: false },
  ],
  "Makanan Pembuka": [
    { id: 4, name: "Gado-gado", price: 15000, description: "Salad sayuran dengan bumbu kacang", available: true },
    { id: 5, name: "Kerupuk", price: 5000, description: "Kerupuk udang segar", available: true },
    { id: 6, name: "Asinan", price: 10000, description: "Asinan buah segar", available: true },
  ],
  "Minuman": [
    { id: 7, name: "Es Teh Manis", price: 5000, description: "Teh manis dingin segar", available: true },
    { id: 8, name: "Jus Jeruk", price: 8000, description: "Jus jeruk peras asli", available: true },
    { id: 9, name: "Es Kelapa Muda", price: 12000, description: "Kelapa muda segar", available: true },
  ],
};

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

const CustomerOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();   // ✅ ambil data dari state
  const [searchParams] = useSearchParams();

  // Jika ada data cart dari dashboard
  const initialCart = (location.state && location.state.cart) || [];
  const [cart, setCart] = useState<CartItem[]>(initialCart);

  const tableNumber = (location.state && location.state.tableNumber) || "1";
  const orderType = (location.state && location.state.orderType) || "dine-in";

  const customerName = searchParams.get("name") || "Pelanggan"; 
  const [activeCategory, setActiveCategory] = useState("Makanan Utama");

  const addToCart = (item: { id: number; name: string; price: number }) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prev.map(cartItem =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      }
      return prev.filter(cartItem => cartItem.id !== itemId);
    });
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
  if (cart.length === 0) return;

  const newOrder = {
    id: "ORD" + Date.now(),
    date: new Date().toISOString().split("T")[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    items: cart,
    total: getTotalPrice(),
    status: "pending",
    type: orderType,
    table: orderType === "dine-in" ? tableNumber : "-",
    paymentMethod: "Tunai", // default (bisa dikembangkan)
  };

  // Ambil riwayat lama dari localStorage
  const existingHistory = JSON.parse(localStorage.getItem("orderHistory") || "[]");

  // Simpan riwayat baru
  localStorage.setItem("orderHistory", JSON.stringify([...existingHistory, newOrder]));

  alert(`Pesanan berhasil! Order ID: ${newOrder.id}`);

  setCart([]);
  navigate("/customer/dashboard"); // balik ke dashboard setelah pesan
};


  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <header className="bg-card border-b p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/customer/dashboard")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <div>
              <h1 className="text-xl font-bold">Selamat Datang, {customerName}!</h1>
              <p className="text-sm text-muted-foreground">Meja {tableNumber}</p>
            </div>
          </div>
          
          {/* Cart Summary */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="font-bold">Rp {getTotalPrice().toLocaleString()}</p>
            </div>
            <Button 
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="relative"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Pesan ({getTotalItems()})
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5" />
                  Menu Dapur Bunda Bahagia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="Makanan Utama">Makanan Utama</TabsTrigger>
                    <TabsTrigger value="Makanan Pembuka">Pembuka</TabsTrigger>
                    <TabsTrigger value="Minuman">Minuman</TabsTrigger>
                  </TabsList>

                  {Object.entries(menuItems).map(([category, items]) => (
                    <TabsContent key={category} value={category}>
                      <div className="grid gap-4">
                        {items.map((item) => (
                          <div 
                            key={item.id} 
                            className={`border rounded-lg p-4 ${
                              !item.available ? 'opacity-50' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold">{item.name}</h4>
                                  {!item.available && (
                                    <Badge variant="secondary">Habis</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {item.description}
                                </p>
                                <p className="text-lg font-bold text-primary">
                                  Rp {item.price.toLocaleString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {cart.find(cartItem => cartItem.id === item.id) ? (
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => removeFromCart(item.id)}
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="w-8 text-center font-semibold">
                                      {cart.find(cartItem => cartItem.id === item.id)?.quantity || 0}
                                    </span>
                                    <Button
                                      size="sm"
                                      onClick={() => addToCart(item)}
                                      disabled={!item.available}
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => addToCart(item)}
                                    disabled={!item.available}
                                  >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Tambah
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Pesanan Anda
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Keranjang kosong</p>
                    <p className="text-sm">Pilih menu untuk mulai memesan</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="border-b pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium text-sm">{item.name}</h5>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(item.id)}
                            className="h-6 w-6 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">
                            {item.quantity} x Rp {item.price.toLocaleString()}
                          </span>
                          <span className="font-semibold">
                            Rp {(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-primary">
                          Rp {getTotalPrice().toLocaleString()}
                        </span>
                      </div>
                      
                      <Button
                        onClick={handleCheckout}
                        className="w-full mt-4"
                        size="lg"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Pesan Sekarang
                      </Button>
                      
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        Estimasi waktu: 15-20 menit
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrder;