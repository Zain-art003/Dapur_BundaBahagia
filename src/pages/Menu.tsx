import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChefHat, Clock, Star, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiService, MenuItem, Category } from "@/service/api";

const Menu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch categories first
      const categoriesResponse = await apiService.getCategories();
      if (categoriesResponse.success && categoriesResponse.data) {
        setCategories(categoriesResponse.data as Category[]);
      }

      // Fetch menu items
      const menuResponse = await apiService.getMenuItems();
      if (menuResponse.success && menuResponse.data) {
        setMenuItems(menuResponse.data as MenuItem[]);
      }
    } catch (error) {
      console.error("Failed to fetch menu data:", error);
      // Set empty arrays to prevent errors
      setMenuItems([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredMenuItems = selectedCategory === "all"
    ? menuItems
    : menuItems.filter(item => item.category_id === selectedCategory);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 text-white py-12 px-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="text-white hover:bg-white/20 backdrop-blur-sm border border-white/20 shadow-lg"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-sm"></div>
                  <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-3 border border-white/20 shadow-lg">
                    <img
                      src="/logo.png"
                      alt="Logo Dapur Bunda Bahagia"
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  </div>
                </div>
              </div>
              <h1 className="font-display text-4xl font-bold tracking-wide text-white">Menu Restoran</h1>
              <p className="text-orange-100 mt-2 font-medium">Dapur Bunda Bahagia</p>
            </div>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Categories Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              className={`mb-2 ${selectedCategory === "all" ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-white/80 border-orange-200/60 text-gray-700 hover:bg-orange-50 backdrop-blur-sm'}`}
            >
              Semua Menu
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className={`mb-2 ${selectedCategory === category.id ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-white/80 border-orange-200/60 text-gray-700 hover:bg-orange-50 backdrop-blur-sm'}`}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredMenuItems.length === 0 ? (
          <div className="text-center py-12">
            <ChefHat className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">Menu tidak ditemukan</h3>
            <p className="text-muted-foreground">Belum ada menu yang tersedia untuk kategori ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMenuItems.map((item) => (
              <Card key={item.id} className="bg-white/90 backdrop-blur-sm border border-orange-200/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-gray-900 font-semibold">{item.name}</CardTitle>
                      <Badge
                        variant={item.status === 'available' ? 'default' : 'secondary'}
                        className={item.status === 'available' ? 'bg-green-600 hover:bg-green-700 mt-2' : 'bg-red-600 hover:bg-red-700 mt-2'}
                      >
                        {item.status === 'available' ? 'Tersedia' : 'Habis'}
                      </Badge>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-orange-600">
                        {formatPrice(item.price)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4 line-clamp-2">
                    {item.description || 'Deskripsi menu tidak tersedia'}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Stok: <span className="font-semibold text-gray-900">{item.stock}</span></span>
                    <div className="flex items-center bg-orange-100 px-2 py-1 rounded-full">
                      <Star className="h-4 w-4 text-orange-600 mr-1" />
                      <span className="text-orange-800 font-medium">4.5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-12 py-12 bg-white/80 backdrop-blur-md rounded-lg border border-orange-200/60 shadow-lg">
          <h3 className="text-2xl font-bold mb-4 text-gray-900">Ingin Memesan?</h3>
          <p className="text-gray-600 mb-6">
            Masuk ke sistem untuk melakukan pemesanan atau hubungi kami langsung
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/login')}
              className="bg-orange-600 text-white hover:bg-orange-700 font-semibold shadow-lg"
            >
              Masuk Sistem
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/register')}
              className="border-orange-300 text-orange-700 hover:bg-orange-50 backdrop-blur-sm"
            >
              Daftar Akun
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;