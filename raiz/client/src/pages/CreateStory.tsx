import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Sparkles, Loader2, BookOpen } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

export default function CreateStory() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("");
  const [targetAge, setTargetAge] = useState<number>(7);
  const [educationalGoal, setEducationalGoal] = useState("");
  const [selectedAvatars, setSelectedAvatars] = useState<number[]>([]);
  const [numberOfChapters, setNumberOfChapters] = useState<number>(3);
  const [step, setStep] = useState<"info" | "avatars" | "generating">("info");

  const { data: avatars, isLoading: avatarsLoading } = trpc.avatar.list.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.story.create.useMutation({
    onSuccess: (data) => {
      if (data.storyId) {
        // Iniciar geração do roteiro
        generateMutation.mutate({
          storyId: data.storyId,
          characterIds: selectedAvatars,
          numberOfChapters,
        });
      }
    },
    onError: (error) => {
      toast.error(`Erro ao criar história: ${error.message}`);
      setStep("info");
    },
  });

  const generateMutation = trpc.story.generateScript.useMutation({
    onSuccess: () => {
      toast.success("História gerada com sucesso! 🎉");
      utils.story.list.invalidate();
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(`Erro ao gerar roteiro: ${error.message}`);
      setStep("avatars");
    },
  });

  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Por favor, dê um título à história");
      return;
    }
    
    if (!theme.trim()) {
      toast.error("Por favor, descreva o tema da história");
      return;
    }
    
    setStep("avatars");
  };

  const handleSubmitAvatars = () => {
    if (selectedAvatars.length === 0) {
      toast.error("Selecione pelo menos um avatar para a história");
      return;
    }

    setStep("generating");
    createMutation.mutate({
      title: title.trim(),
      theme: theme.trim(),
      targetAge,
      educationalGoal: educationalGoal.trim() || undefined,
    });
  };

  const toggleAvatar = (avatarId: number) => {
    setSelectedAvatars(prev => 
      prev.includes(avatarId)
        ? prev.filter(id => id !== avatarId)
        : [...prev, avatarId]
    );
  };

  if (!user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/5 py-12">
      <div className="container max-w-4xl">
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Button>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            Criar Nova História 📚
          </h1>
          <p className="text-lg text-muted-foreground">
            A IA vai criar um roteiro mágico e educativo para você!
          </p>
        </div>

        {/* Step 1: Informações da História */}
        {step === "info" && (
          <Card className="card-cartoon">
            <CardHeader>
              <CardTitle className="text-2xl">Informações da História</CardTitle>
              <CardDescription>
                Conte-nos sobre a história que você quer criar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitInfo} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-lg font-semibold">
                    Título da História *
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Ex: A Grande Aventura na Floresta Mágica"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-lg py-6 rounded-2xl border-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="theme" className="text-lg font-semibold">
                    Tema / Assunto *
                  </Label>
                  <Textarea
                    id="theme"
                    placeholder="Ex: Uma aventura sobre amizade e coragem, onde os personagens exploram uma floresta mágica e aprendem sobre trabalho em equipe..."
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="text-base rounded-2xl border-2 min-h-32"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="targetAge" className="text-lg font-semibold">
                      Idade Alvo
                    </Label>
                    <Input
                      id="targetAge"
                      type="number"
                      min="3"
                      max="12"
                      value={targetAge}
                      onChange={(e) => setTargetAge(Number(e.target.value))}
                      className="text-lg py-6 rounded-2xl border-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chapters" className="text-lg font-semibold">
                      Número de Capítulos
                    </Label>
                    <Input
                      id="chapters"
                      type="number"
                      min="1"
                      max="10"
                      value={numberOfChapters}
                      onChange={(e) => setNumberOfChapters(Number(e.target.value))}
                      className="text-lg py-6 rounded-2xl border-2"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="educationalGoal" className="text-lg font-semibold">
                    Objetivo Educacional (Opcional)
                  </Label>
                  <Textarea
                    id="educationalGoal"
                    placeholder="Ex: Ensinar sobre a importância da preservação ambiental, valores de amizade, respeito às diferenças..."
                    value={educationalGoal}
                    onChange={(e) => setEducationalGoal(e.target.value)}
                    className="text-base rounded-2xl border-2 min-h-24"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    className="btn-cartoon bg-secondary text-secondary-foreground flex-1"
                  >
                    Próximo: Escolher Personagens
                    <Sparkles className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Seleção de Avatares */}
        {step === "avatars" && (
          <Card className="card-cartoon">
            <CardHeader>
              <CardTitle className="text-2xl">Escolha os Personagens</CardTitle>
              <CardDescription>
                Selecione os avatares que participarão da história
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {avatarsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : avatars && avatars.length > 0 ? (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {avatars.map((avatar) => (
                    <div
                      key={avatar.id}
                      className={`card-cartoon cursor-pointer transition-all ${
                        selectedAvatars.includes(avatar.id)
                          ? "ring-4 ring-primary bg-primary/10"
                          : "hover:ring-2 ring-border"
                      }`}
                      onClick={() => toggleAvatar(avatar.id)}
                    >
                      <div className="aspect-square rounded-2xl overflow-hidden bg-muted mb-3">
                        <img
                          src={avatar.avatarImageUrl}
                          alt={avatar.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-base">{avatar.name}</h3>
                        <Checkbox
                          checked={selectedAvatars.includes(avatar.id)}
                          onCheckedChange={() => toggleAvatar(avatar.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground mb-4">
                    Você ainda não criou nenhum avatar
                  </p>
                  <Link href="/avatares/criar">
                    <Button className="btn-cartoon bg-primary text-primary-foreground">
                      Criar Primeiro Avatar
                    </Button>
                  </Link>
                </div>
              )}

              {avatars && avatars.length > 0 && (
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="btn-cartoon border-2"
                    onClick={() => setStep("info")}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                  </Button>
                  <Button
                    type="button"
                    size="lg"
                    className="btn-cartoon bg-secondary text-secondary-foreground flex-1"
                    onClick={handleSubmitAvatars}
                    disabled={selectedAvatars.length === 0}
                  >
                    Gerar História com IA
                    <Sparkles className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Gerando */}
        {step === "generating" && (
          <Card className="card-cartoon">
            <CardContent className="py-16 text-center">
              <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-soft">
                <BookOpen className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Criando sua história mágica... ✨
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                A inteligência artificial está escrevendo um roteiro incrível para você!
              </p>
              <div className="flex justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
              </div>
              <p className="text-sm text-muted-foreground mt-8">
                Isso pode levar de 20 a 60 segundos...
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
