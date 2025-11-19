import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Sparkles, Image, BookOpen, Users, Plus, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { APP_TITLE } from "@/const";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Buscar dados do usuário
  const { data: avatars, isLoading: avatarsLoading } = trpc.avatar.list.useQuery();
  const { data: stories, isLoading: storiesLoading } = trpc.story.list.useQuery();
  const { data: subscription } = trpc.subscription.getStatus.useQuery();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  const isTeacher = user.role === "teacher";
  const isPremium = subscription?.isActive;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      {/* Header */}
      <header className="bg-card border-b-4 border-border shadow-lg">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                🎬 {APP_TITLE}
              </h1>
              <p className="text-muted-foreground mt-1">
                Olá, <span className="font-semibold text-primary">{user.name || "Cineasta"}</span>! 👋
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isPremium ? (
                <div className="bg-warning/20 text-warning-foreground px-4 py-2 rounded-full border-2 border-warning font-semibold">
                  ⭐ Premium
                </div>
              ) : (
                <Link href="/assinatura">
                  <Button variant="outline" className="btn-cartoon border-2 border-warning text-warning">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Upgrade Premium
                  </Button>
                </Link>
              )}
              <Link href="/">
                <Button variant="ghost">Início</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-12">
        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Link href="/avatares/criar">
            <Card className="card-cartoon hover-lift cursor-pointer bg-gradient-to-br from-primary/10 to-primary/20 border-primary/30">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/30 rounded-full flex items-center justify-center mb-4">
                  <Image className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Criar Avatar</CardTitle>
                <CardDescription className="text-base">
                  Transforme uma foto em avatar caricatural
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/historias/criar">
            <Card className="card-cartoon hover-lift cursor-pointer bg-gradient-to-br from-secondary/10 to-secondary/20 border-secondary/30">
              <CardHeader>
                <div className="w-16 h-16 bg-secondary/30 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-secondary" />
                </div>
                <CardTitle className="text-2xl">Nova História</CardTitle>
                <CardDescription className="text-base">
                  Crie uma história personalizada com IA
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {isTeacher && (
            <Link href="/turmas">
              <Card className="card-cartoon hover-lift cursor-pointer bg-gradient-to-br from-success/10 to-success/20 border-success/30">
                <CardHeader>
                  <div className="w-16 h-16 bg-success/30 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-success" />
                  </div>
                  <CardTitle className="text-2xl">Minhas Turmas</CardTitle>
                  <CardDescription className="text-base">
                    Gerencie turmas e compartilhe histórias
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )}
        </div>

        {/* Meus Avatares */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-foreground">Meus Avatares 🎨</h2>
            <Link href="/avatares/criar">
              <Button className="btn-cartoon bg-primary text-primary-foreground">
                <Plus className="mr-2 h-4 w-4" />
                Criar Avatar
              </Button>
            </Link>
          </div>

          {avatarsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : avatars && avatars.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {avatars.map((avatar) => (
                <Card key={avatar.id} className="card-cartoon hover-lift">
                  <CardHeader className="p-0">
                    <div className="aspect-square rounded-t-3xl overflow-hidden bg-muted">
                      <img
                        src={avatar.avatarImageUrl}
                        alt={avatar.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg text-center">{avatar.name}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="card-cartoon bg-muted/30">
              <CardContent className="py-12 text-center">
                <Image className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground mb-4">
                  Você ainda não criou nenhum avatar
                </p>
                <Link href="/avatares/criar">
                  <Button className="btn-cartoon bg-primary text-primary-foreground">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Primeiro Avatar
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Minhas Histórias */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-foreground">Minhas Histórias 📚</h2>
            <Link href="/historias/criar">
              <Button className="btn-cartoon bg-secondary text-secondary-foreground">
                <Plus className="mr-2 h-4 w-4" />
                Nova História
              </Button>
            </Link>
          </div>

          {storiesLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : stories && stories.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story) => (
                <Link key={story.id} href={`/historias/${story.id}`}>
                  <Card className="card-cartoon hover-lift cursor-pointer">
                    <CardHeader>
                      {story.coverImageUrl && (
                        <div className="aspect-video rounded-2xl overflow-hidden bg-muted mb-4">
                          <img
                            src={story.coverImageUrl}
                            alt={story.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardTitle className="text-xl">{story.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {story.theme}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          story.status === 'completed' ? 'bg-success/20 text-success' :
                          story.status === 'generating' ? 'bg-warning/20 text-warning' :
                          story.status === 'published' ? 'bg-primary/20 text-primary' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {story.status === 'completed' ? '✅ Completa' :
                           story.status === 'generating' ? '⏳ Gerando...' :
                           story.status === 'published' ? '🌟 Publicada' :
                           '📝 Rascunho'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="card-cartoon bg-muted/30">
              <CardContent className="py-12 text-center">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground mb-4">
                  Você ainda não criou nenhuma história
                </p>
                <Link href="/historias/criar">
                  <Button className="btn-cartoon bg-secondary text-secondary-foreground">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Primeira História
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
