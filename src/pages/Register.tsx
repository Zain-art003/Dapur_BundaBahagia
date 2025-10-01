import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !fullName) {
      toast({
        title: "Error",
        description: "Nama, email, dan password harus diisi!",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
          phone,
          role: "customer", // user baru otomatis jadi customer
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Pendaftaran Berhasil",
          description: "Silakan login menggunakan akun baru kamu.",
        });
        navigate("/login");
      } else {
        toast({
          title: "Gagal Mendaftar",
          description: data.error || "Terjadi kesalahan saat registrasi.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Register error:", error);
      toast({
        title: "Gagal Mendaftar",
        description: "Tidak dapat terhubung ke server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img
              src="/logo.png"
              alt="Logo Dapur Bunda Bahagia"
              className="h-10 w-10"
            />
          </div>
          <CardTitle>Buat Akun Baru</CardTitle>
          <CardDescription>Gabung sebagai pelanggan Dapur Bunda Bahagia</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label>Nama Lengkap</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label>No. Telepon</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Mendaftarkan..." : "Daftar"}
            </Button>
          </form>

          <p className="text-center text-sm mt-4">
            Sudah punya akun?{" "}
            <Button variant="link" className="p-0 text-primary" onClick={() => navigate("/login")}>
              Masuk di sini
            </Button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
