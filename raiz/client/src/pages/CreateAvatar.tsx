import { useState, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Upload, Loader2, ArrowLeft, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function CreateAvatar() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const createMutation = trpc.avatar.create.useMutation({
    onSuccess: () => {
      toast.success("Avatar criado com sucesso! 🎉");
      utils.avatar.list.invalidate();
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(`Erro ao criar avatar: ${error.message}`);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 5MB");
        return;
      }

      // Validar tipo
      if (!file.type.startsWith("image/")) {
        toast.error("Por favor, selecione uma imagem");
        return;
      }

      setPhotoFile(file);

      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Por favor, dê um nome ao avatar");
      return;
    }

    if (!photoFile) {
      toast.error("Por favor, selecione uma foto");
      return;
    }

    // Converter para base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      createMutation.mutate({
        name: name.trim(),
        photoBase64: base64!,
        photoMimeType: photoFile.type,
      });
    };
    reader.readAsDataURL(photoFile);
  };

  if (!user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 py-12">
      <div className="container max-w-3xl">
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Button>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            Criar Avatar Caricatural 🎨
          </h1>
          <p className="text-lg text-muted-foreground">
            Envie uma foto e transforme-a em um personagem divertido!
          </p>
        </div>

        <Card className="card-cartoon">
          <CardHeader>
            <CardTitle className="text-2xl">Informações do Avatar</CardTitle>
            <CardDescription>
              Escolha uma foto clara do rosto para melhores resultados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome do Avatar */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-lg font-semibold">
                  Nome do Personagem *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ex: João Aventureiro, Maria Exploradora..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-lg py-6 rounded-2xl border-2"
                  disabled={createMutation.isPending}
                />
              </div>

              {/* Upload de Foto */}
              <div className="space-y-2">
                <Label className="text-lg font-semibold">Foto do Rosto *</Label>
                <div className="flex flex-col items-center gap-4">
                  {photoPreview ? (
                    <div className="relative w-full max-w-md">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-full aspect-square object-cover rounded-3xl border-4 border-border"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="absolute top-4 right-4 rounded-full"
                        onClick={() => {
                          setPhotoFile(null);
                          setPhotoPreview(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                        disabled={createMutation.isPending}
                      >
                        Trocar Foto
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="w-full max-w-md aspect-square border-4 border-dashed border-border rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors bg-muted/30"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-16 h-16 text-muted-foreground mb-4" />
                      <p className="text-lg font-semibold text-foreground mb-2">
                        Clique para enviar uma foto
                      </p>
                      <p className="text-sm text-muted-foreground">
                        PNG, JPG ou JPEG (máx. 5MB)
                      </p>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={createMutation.isPending}
                  />
                </div>
              </div>

              {/* Dicas */}
              <Card className="bg-accent/10 border-accent/30">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-3 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-accent" />
                    Dicas para um avatar perfeito:
                  </h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start">
                      <span className="mr-2">✨</span>
                      <span>Use uma foto com boa iluminação</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">😊</span>
                      <span>Prefira fotos com o rosto bem visível</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">🎨</span>
                      <span>A IA criará um estilo cartoon colorido e divertido</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">⏱️</span>
                      <span>A geração pode levar de 10 a 30 segundos</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Botões */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  size="lg"
                  className="btn-cartoon bg-primary text-primary-foreground flex-1"
                  disabled={createMutation.isPending || !name.trim() || !photoFile}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Criando Avatar Mágico...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Criar Avatar
                    </>
                  )}
                </Button>
                <Link href="/dashboard">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="btn-cartoon border-2"
                    disabled={createMutation.isPending}
                  >
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
