# 🎬 CINEASTA KID'S ✨

**Crie histórias mágicas e personalizadas com avatares caricaturais dos seus filhos!**

Aplicação web full-stack que permite criar histórias infantis personalizadas com avatares caricaturais gerados por IA, suportando uso unifamiliar e coletivo (escolas, professores).

---

## 🌟 Funcionalidades Principais

### Para Famílias 👨‍👩‍👧
- **Criar Avatares Caricaturais**: Envie fotos e transforme-as em personagens coloridos e divertidos
- **Gerar Histórias Personalizadas**: A IA cria roteiros educativos com seus personagens
- **Adicionar Áudio**: Grave vozes para os personagens
- **Biblioteca de Histórias**: Gerencie todas as histórias criadas

### Para Educadores 👩‍🏫
- **Gerenciar Turmas**: Crie e organize múltiplas turmas
- **Histórias Educacionais**: Defina objetivos pedagógicos específicos
- **Compartilhar com Alunos**: Distribua histórias para toda a turma

### Sistema de Assinaturas
- **Plano Gratuito**: Funcionalidades básicas para começar
- **Plano Premium**: Recursos avançados e ilimitados

---

## 🎨 Design

Interface lúdica e colorida inspirada no estilo do **"Incrível Mundo de Bob"**:
- Cores vibrantes e alegres
- Tipografia divertida (Fredoka, Comic Neue)
- Animações suaves e interativas
- Layout responsivo para mobile e desktop

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 19** com TypeScript
- **Tailwind CSS 4** para estilização
- **tRPC** para comunicação type-safe com o backend
- **Wouter** para roteamento
- **shadcn/ui** para componentes

### Backend
- **Node.js** com Express
- **tRPC 11** para APIs type-safe
- **Drizzle ORM** para banco de dados
- **MySQL/TiDB** como banco de dados

### Integrações de IA
- **Geração de Imagens**: Avatares caricaturais com IA
- **LLM**: Geração de roteiros educativos
- **Transcrição de Áudio**: Whisper API

### Armazenamento
- **S3** para fotos, avatares e áudios

---

## 📁 Estrutura do Projeto

```
cineasta-kids/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── lib/           # Utilitários e configurações
│   │   └── index.css      # Estilos globais
│   └── public/            # Assets estáticos
├── server/                # Backend Node.js
│   ├── routers.ts         # Rotas tRPC
│   ├── db.ts              # Queries do banco de dados
│   ├── _core/             # Configurações do framework
│   └── *.test.ts          # Testes unitários
├── drizzle/               # Schema e migrações do banco
│   └── schema.ts          # Definição das tabelas
├── shared/                # Código compartilhado
└── storage/               # Helpers de armazenamento S3
```

---

## 🚀 Como Usar

### Instalação

```bash
# Instalar dependências
pnpm install

# Configurar banco de dados
pnpm db:push

# Iniciar servidor de desenvolvimento
pnpm dev
```

### Desenvolvimento

```bash
# Executar testes
pnpm test

# Build para produção
pnpm build

# Iniciar servidor de produção
pnpm start
```

---

## 📖 Fluxo do Usuário

### 1. Criar Avatar
1. Faça login na aplicação
2. Acesse "Criar Avatar"
3. Envie uma foto clara do rosto
4. Dê um nome ao personagem
5. Aguarde a IA gerar o avatar caricatural (10-30 segundos)

### 2. Criar História
1. Acesse "Nova História"
2. Defina título, tema e idade alvo
3. Escolha o número de capítulos (1-10)
4. Adicione objetivo educacional (opcional)
5. Selecione os avatares que participarão
6. Aguarde a IA gerar o roteiro completo (20-60 segundos)

### 3. Visualizar e Compartilhar
1. Acesse sua biblioteca de histórias
2. Clique em uma história para ler
3. Compartilhe com familiares ou alunos
4. Adicione áudios aos personagens (em breve)

---

## 🗄️ Banco de Dados

### Tabelas Principais

- **users**: Usuários do sistema (pais, professores, admin)
- **avatars**: Avatares caricaturais criados
- **stories**: Histórias geradas
- **chapters**: Capítulos das histórias
- **storyCharacters**: Personagens associados às histórias
- **characterAudios**: Áudios gravados para personagens
- **classrooms**: Turmas (modo educacional)
- **classroomStudents**: Alunos das turmas
- **classroomStories**: Histórias compartilhadas com turmas

---

## 🧪 Testes

O projeto inclui testes unitários para as principais funcionalidades:

```bash
# Executar todos os testes
pnpm test

# Executar testes específicos
pnpm test avatar.test.ts
pnpm test story.test.ts
```

Cobertura de testes:
- ✅ Autenticação e logout
- ✅ Listagem de avatares
- ✅ Listagem de histórias
- ✅ Status de assinatura

---

## 🎯 Objetivos Educacionais

O CINEASTA KID'S foi projetado para:

- **Estimular a criatividade** das crianças
- **Fortalecer laços familiares** através de histórias compartilhadas
- **Apoiar educadores** com conteúdo personalizado
- **Ensinar valores** como amizade, coragem, respeito
- **Tornar o aprendizado divertido** e interativo

---

## 🔒 Segurança e Privacidade

- Autenticação via Manus OAuth
- Dados armazenados com segurança
- Imagens e áudios em S3 com acesso controlado
- Validação de entrada em todas as APIs
- Proteção contra acesso não autorizado

---

## 📝 Licença

© 2025 CINEASTA KID'S - Criando histórias mágicas para crianças 🌈

---

## 🤝 Suporte

Para dúvidas, sugestões ou problemas, entre em contato através do dashboard administrativo ou visite nossa página de ajuda.

---

**Transforme momentos especiais em aventuras inesquecíveis! ✨**
