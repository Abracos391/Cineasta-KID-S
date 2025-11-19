import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, BookOpen, Users, Share2, Trash2 } from "lucide-react";
import { Link, useLocation, useRoute } from "wouter";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

export default function StoryView() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/historias/:id");
  const storyId = params?.id ? parseInt(params.id) : null;

  const { data, isLoading } = trpc.story.getById.useQuery(
    { id: storyId! },
    { enabled: !!storyId }
  );

  const utils = trpc.useUtils();
  const deleteMutation = trpc.story.delete.useMutation({
    onSuccess: () => {
      toast.success("História deletada com sucesso");
      utils.story.list.invalidate();
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(`Erro ao deletar: ${error.message}`);
    },
  });

  const handleDelete = () => {
    if (confirm("Tem certeza que deseja deletar esta história?")) {
      deleteMutation.mutate({ id: storyId! });
    }
  };

  if (!user) {
    setLocation("/");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!data || !data.story) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="card-cartoon max-w-md">
          <CardContent className="py-12 text-center">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">História não encontrada</h2>
            <p className="text-muted-foreground mb-6">
              Esta história não existe ou você não tem permissão para visualizá-la.
            </p>
            <Link href="/dashboard">
              <Button className="btn-cartoon bg-primary text-primary-foreground">
                Voltar ao Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { story, chapters, characters } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-12">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Button>
          </Link>
          
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                {story.title}
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                {story.theme}
              </p>
              <div className="flex flex-wrap gap-2">
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
                {story.targetAge && (
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-accent/20 text-accent-foreground">
                    👶 {story.targetAge} anos
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={() => toast.info("Funcionalidade de compartilhamento em breve!")}
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full text-destructive hover:text-destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Personagens */}
        {characters && characters.length > 0 && (
          <Card className="card-cartoon mb-8 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Users className="mr-2 h-6 w-6 text-primary" />
                Personagens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {characters.map((character) => (
                  <div key={character.id} className="flex items-center gap-3 p-3 bg-card rounded-2xl border-2 border-border">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">
                        {character.characterRole === 'protagonist' ? '⭐' :
                         character.characterRole === 'supporting' ? '🎭' : '👤'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{character.characterName}</h3>
                      <p className="text-xs text-muted-foreground">
                        {character.characterRole === 'protagonist' ? 'Protagonista' :
                         character.characterRole === 'supporting' ? 'Coadjuvante' : 'Figurante'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Objetivo Educacional */}
        {story.educationalGoal && (
          <Card className="card-cartoon mb-8 bg-gradient-to-br from-success/5 to-success/10 border-success/30">
            <CardHeader>
              <CardTitle className="text-xl">🎯 Objetivo Educacional</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{story.educationalGoal}</p>
            </CardContent>
          </Card>
        )}

        {/* Capítulos */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-foreground">Capítulos 📖</h2>
          
          {chapters && chapters.length > 0 ? (
            chapters.map((chapter, index) => (
              <Card key={chapter.id} className="card-cartoon">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-secondary">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{chapter.title}</CardTitle>
                      {chapter.narratorText && (
                        <p className="text-sm text-muted-foreground italic">
                          {chapter.narratorText}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-lg max-w-none">
                    <Streamdown>{chapter.content}</Streamdown>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="card-cartoon bg-muted/30">
              <CardContent className="py-12 text-center">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">
                  {story.status === 'generating' 
                    ? 'A história está sendo gerada... Aguarde alguns instantes!'
                    : 'Nenhum capítulo encontrado para esta história.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
