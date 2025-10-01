import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChefHat, Clock, MapPin, Star, Users, Utensils } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/restaurant-hero.jpg";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Utensils className="h-8 w-8" />,
      title: "Menu Lengkap",
      description: "Makanan utama, appetizer, dan minuman berkualitas"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Pesan Online",
      description: "Pesan kapan saja, dine-in atau takeaway"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Layanan Terbaik",
      description: "Pelayanan ramah dan profesional"
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: "Kualitas Terjamin",
      description: "Bahan segar dan cita rasa autentik"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
          <div className="mb-6 flex justify-center">
            <img
              src="/logo.png"
              alt="Logo Dapur Bunda Bahagia"
              className="h-16 w-16"
            />
          </div>
          
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Dapur Bunda Bahagia
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto leading-relaxed">
            Sistem Manajemen Restoran Modern untuk Pengalaman Kuliner Terbaik
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white font-bold px-12 py-6 text-xl transition-all duration-300 shadow-2xl hover:shadow-primary/25 hover:scale-105 border-2 border-primary/20"
              onClick={() => navigate('/login')}
            >
              Masuk Sistem
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-primary font-bold px-12 py-6 text-xl transition-all duration-300 shadow-2xl hover:shadow-white/25 hover:scale-105 bg-white/10 backdrop-blur-sm"
              onClick={() => navigate('/menu')}
            >
              🍽️ Lihat Menu
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-foreground mb-4">
              Fitur Unggulan Sistem Kami
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Teknologi modern untuk mendukung operasional restoran yang efisien
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="gradient-card border-border/50 shadow-card hover:shadow-elegant transition-smooth group">
                <CardContent className="p-8 text-center">
                  <div className="mb-6 text-primary group-hover:text-accent transition-smooth flex justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-4 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-20 px-6 bg-secondary/30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <MapPin className="h-12 w-12 text-primary" />
          </div>
          
          <h2 className="font-display text-3xl font-bold text-foreground mb-6">
            Tentang Restoran Kami
          </h2>
          
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Dapur Bunda Bahagia adalah restoran yang menyajikan masakan Indonesia autentik 
            dengan cita rasa rumahan yang hangat. Kami menggunakan sistem modern untuk 
            memberikan pelayanan terbaik kepada pelanggan.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">3</div>
              <div className="text-sm text-muted-foreground">Kategori Menu</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Sistem Online</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">100%</div>
              <div className="text-sm text-muted-foreground">Pelayanan Terbaik</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6 flex justify-center">
            <ChefHat className="h-10 w-10 text-primary" />
          </div>
          
          <h3 className="font-display text-2xl font-bold mb-4">
            Dapur Bunda Bahagia
          </h3>
          
          <p className="text-background/80 mb-6">
            Sistem Manajemen Restoran Modern
          </p>
          
          <p className="text-sm text-background/60">
            © 2024 Dapur Bunda Bahagia. Semua hak dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;