import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE, getLoginUrl } from "@/const";
import { Sparkles, Users, BookOpen, Mic, Palette, Star } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section com gradiente colorido */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 py-20">
        <div className="container">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="space-y-4 max-w-3xl">
              <h1 className="text-5xl md:text-7xl font-bold text-foreground animate-bounce-soft">
                🎬 {APP_TITLE} 🌟
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-medium">
                Crie histórias mágicas e personalizadas com avatares caricaturais dos seus filhos!
              </p>
              <p className="text-lg text-muted-foreground">
                Transforme fotos em personagens divertidos e gere roteiros educativos incríveis com inteligência artificial.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="lg" className="btn-cartoon bg-primary text-primary-foreground shadow-lg">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Ir para o Dashboard
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button size="lg" className="btn-cartoon bg-primary text-primary-foreground shadow-lg">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Começar Agora - Grátis!
                  </Button>
                </a>
              )}
              <Link href="/sobre">
                <Button size="lg" variant="outline" className="btn-cartoon border-4">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Saiba Mais
                </Button>
              </Link>
            </div>

            {/* Badges informativos */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <div className="bg-success/20 text-success-foreground px-4 py-2 rounded-full border-2 border-success font-semibold">
                ✨ 100% Grátis para começar
              </div>
              <div className="bg-warning/20 text-warning-foreground px-4 py-2 rounded-full border-2 border-warning font-semibold">
                🎨 Avatares com IA
              </div>
              <div className="bg-secondary/20 text-secondary-foreground px-4 py-2 rounded-full border-2 border-secondary font-semibold">
                📚 Histórias educativas
              </div>
            </div>
          </div>
        </div>

        {/* Decoração de fundo */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary/30 rounded-full blur-xl animate-bounce-soft"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-secondary/30 rounded-full blur-xl animate-bounce-soft" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-accent/30 rounded-full blur-xl animate-bounce-soft" style={{ animationDelay: '1s' }}></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Como Funciona? 🚀
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Em poucos passos, você cria histórias incríveis e personalizadas!
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="card-cartoon hover-lift bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                  <Palette className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">1. Crie Avatares</CardTitle>
                <CardDescription className="text-base">
                  Envie fotos e transforme-as em avatares caricaturais coloridos e divertidos!
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2 */}
            <Card className="card-cartoon hover-lift bg-gradient-to-br from-secondary/5 to-secondary/10">
              <CardHeader>
                <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-secondary" />
                </div>
                <CardTitle className="text-2xl">2. Gere Histórias</CardTitle>
                <CardDescription className="text-base">
                  Escolha um tema e a IA cria um roteiro educativo com seus personagens!
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3 */}
            <Card className="card-cartoon hover-lift bg-gradient-to-br from-accent/5 to-accent/10">
              <CardHeader>
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-4">
                  <Mic className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-2xl">3. Adicione Áudio</CardTitle>
                <CardDescription className="text-base">
                  Grave vozes para os personagens e torne a história ainda mais especial!
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Modos de Uso */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Para Quem é? 👨‍👩‍👧‍👦
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Perfeito para famílias e educadores!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Modo Unifamiliar */}
            <Card className="card-cartoon bg-gradient-to-br from-purple/10 to-pink/10 border-purple/30">
              <CardHeader>
                <div className="w-20 h-20 bg-purple/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Users className="w-10 h-10 text-purple" />
                </div>
                <CardTitle className="text-3xl text-center">Modo Familiar 👨‍👩‍👧</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-center text-lg text-muted-foreground">
                  Pais e filhos criam histórias juntos, fortalecendo laços e estimulando a criatividade!
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <Star className="w-5 h-5 text-purple mr-2 mt-0.5 flex-shrink-0" />
                    <span>Crie avatares de toda a família</span>
                  </li>
                  <li className="flex items-start">
                    <Star className="w-5 h-5 text-purple mr-2 mt-0.5 flex-shrink-0" />
                    <span>Histórias personalizadas para cada criança</span>
                  </li>
                  <li className="flex items-start">
                    <Star className="w-5 h-5 text-purple mr-2 mt-0.5 flex-shrink-0" />
                    <span>Grave vozes e sons especiais</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Modo Educacional */}
            <Card className="card-cartoon bg-gradient-to-br from-green/10 to-success/10 border-green/30">
              <CardHeader>
                <div className="w-20 h-20 bg-green/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <BookOpen className="w-10 h-10 text-green" />
                </div>
                <CardTitle className="text-3xl text-center">Modo Educacional 👩‍🏫</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-center text-lg text-muted-foreground">
                  Professores criam histórias para turmas inteiras, tornando o aprendizado mais divertido!
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <Star className="w-5 h-5 text-green mr-2 mt-0.5 flex-shrink-0" />
                    <span>Gerencie múltiplas turmas</span>
                  </li>
                  <li className="flex items-start">
                    <Star className="w-5 h-5 text-green mr-2 mt-0.5 flex-shrink-0" />
                    <span>Histórias com objetivos educacionais</span>
                  </li>
                  <li className="flex items-start">
                    <Star className="w-5 h-5 text-green mr-2 mt-0.5 flex-shrink-0" />
                    <span>Compartilhe histórias com alunos</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-br from-primary via-secondary to-accent">
        <div className="container">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Pronto para Criar Histórias Mágicas? ✨
            </h2>
            <p className="text-xl text-white/90">
              Comece gratuitamente e transforme momentos especiais em aventuras inesquecíveis!
            </p>
            {!isAuthenticated && (
              <a href={getLoginUrl()}>
                <Button size="lg" className="btn-cartoon bg-white text-primary shadow-2xl hover:shadow-lg-yellow">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Criar Minha Primeira História
                </Button>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-card border-t-4 border-border">
        <div className="container">
          <div className="text-center text-muted-foreground">
            <p className="font-semibold">
              © 2025 {APP_TITLE} - Criando histórias mágicas para crianças 🌈
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
