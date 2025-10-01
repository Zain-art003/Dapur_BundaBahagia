import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChefHat, Eye, EyeOff, LogIn, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fungsi untuk login user
  const loginUser = async (email: string, password: string) => {
    const response = await fetch("http://localhost:8000/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Login gagal");
    }

    return data;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Email dan password harus diisi",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginUser(email, password);

      if (response.success && response.data) {
        const token = `token_${Date.now()}_${response.data.id}`;

        // Simpan user & token ke localStorage
        localStorage.setItem("user", JSON.stringify(response.data));
        localStorage.setItem("token", token);

        toast({
          title: "Login Berhasil",
          description: `Selamat datang ${response.data.role === "admin" ? "Admin" : "Pelanggan"}!`,
        });

        // Arahkan ke dashboard sesuai role
        if (response.data.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/customer/dashboard");
        }
      } else {
        toast({
          title: "Login Gagal",
          description: response.error || "Terjadi kesalahan saat login",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Gagal",
        description: error instanceof Error ? error.message : "Terjadi kesalahan koneksi",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi login demo
  const handleDemoLogin = (role: "admin" | "customer") => {
    if (role === "admin") {
      setEmail("admin@dapurbunda.com");
      setPassword("admin123");
    } else {
      setEmail("customer@example.com");
      setPassword("customer123");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="gradient-card shadow-elegant border-border/50">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <img
                src="/logo.png"
                alt="Logo Dapur Bunda Bahagia"
                className="h-12 w-12"
              />
            </div>

            <div>
              <CardTitle className="font-display text-2xl font-bold text-foreground">
                Masuk Sistem
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                Dapur Bunda Bahagia
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Form Login */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@dapurbunda.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="border-border/60 focus:border-primary transition-smooth"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="border-border/60 focus:border-primary transition-smooth pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold shadow-warm transition-smooth"
                disabled={isLoading}
              >
                {isLoading ? (
                  "Memuat..."
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Masuk
                  </>
                )}
              </Button>
            </form>

            {/* Pemisah Demo */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Demo Akun</span>
              </div>
            </div>

            {/* Tombol Demo Login */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="border-border/60 hover:bg-secondary/80 transition-smooth"
                onClick={() => handleDemoLogin("admin")}
                disabled={isLoading}
              >
                <User className="mr-2 h-4 w-4" />
                Admin
              </Button>
              <Button
                variant="outline"
                className="border-border/60 hover:bg-secondary/80 transition-smooth"
                onClick={() => handleDemoLogin("customer")}
                disabled={isLoading}
              >
                <User className="mr-2 h-4 w-4" />
                Pelanggan
              </Button>
            </div>

            {/* Tombol Navigasi */}
            <div className="text-center space-y-2">
              <Button
                variant="link"
                className="text-muted-foreground hover:text-primary transition-smooth"
                onClick={() => navigate("/")}
                disabled={isLoading}
              >
                Kembali ke Beranda
              </Button>

              {/* ✅ Tombol Baru untuk Registrasi */}
              <Button
                variant="link"
                className="text-primary hover:text-primary/80 font-medium transition-smooth"
                onClick={() => navigate("/register")}
                disabled={isLoading}
              >
                Belum punya akun? Daftar sekarang
              </Button>
            </div>

            {/* Info Akun Demo */}
            <div className="text-xs text-muted-foreground text-center space-y-1 mt-4 p-3 bg-secondary/20 rounded-md">
              <div className="font-medium">Akun Demo:</div>
              <div>Admin: admin@dapurbunda.com / admin123</div>
              <div>Customer: customer@example.com / customer123</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
