# 🚀 Guia de Deploy - CINEASTA KID'S

Este guia explica como fazer deploy da aplicação CINEASTA KID'S em diferentes plataformas.

---

## 📋 Pré-requisitos

Antes de fazer o deploy, você precisará:

1. **Banco de Dados MySQL/TiDB**
   - Crie um banco de dados MySQL ou TiDB
   - Anote a string de conexão (DATABASE_URL)

2. **Configuração OAuth Manus** (se aplicável)
   - OAUTH_SERVER_URL
   - VITE_OAUTH_PORTAL_URL
   - VITE_APP_ID
   - OWNER_OPEN_ID
   - OWNER_NAME

3. **APIs de IA** (se aplicável)
   - BUILT_IN_FORGE_API_URL
   - BUILT_IN_FORGE_API_KEY
   - VITE_FRONTEND_FORGE_API_KEY
   - VITE_FRONTEND_FORGE_API_URL

4. **Armazenamento S3** (configurado automaticamente via Manus)

---

## 🎯 Deploy no Render

### Opção 1: Deploy Automático via render.yaml

1. **Faça push do código para o GitHub**
   ```bash
   git add .
   git commit -m "Preparar para deploy"
   git push origin main
   ```

2. **Conecte seu repositório no Render**
   - Acesse [Render Dashboard](https://dashboard.render.com/)
   - Clique em "New +" → "Blueprint"
   - Conecte seu repositório GitHub
   - O Render detectará automaticamente o arquivo `render.yaml`

3. **Configure as variáveis de ambiente**
   - O Render solicitará as variáveis marcadas como `sync: false`
   - Preencha todas as variáveis necessárias
   - O `JWT_SECRET` será gerado automaticamente

4. **Deploy**
   - Clique em "Apply" para iniciar o deploy
   - Aguarde a conclusão (5-10 minutos)

### Opção 2: Deploy Manual

1. **Crie um novo Web Service no Render**
   - Acesse [Render Dashboard](https://dashboard.render.com/)
   - Clique em "New +" → "Web Service"
   - Conecte seu repositório GitHub

2. **Configure o serviço**
   - **Name**: cineasta-kids
   - **Runtime**: Node
   - **Build Command**: 
     ```bash
     corepack enable && pnpm install && pnpm build
     ```
   - **Start Command**: 
     ```bash
     pnpm start
     ```

3. **Configure variáveis de ambiente**
   
   Adicione as seguintes variáveis:
   
   ```
   NODE_VERSION=22.16.0
   DATABASE_URL=<sua-connection-string>
   JWT_SECRET=<gere-um-secret-seguro>
   OAUTH_SERVER_URL=<url-oauth>
   VITE_OAUTH_PORTAL_URL=<url-portal>
   VITE_APP_ID=<app-id>
   OWNER_OPEN_ID=<owner-id>
   OWNER_NAME=<owner-name>
   BUILT_IN_FORGE_API_URL=<api-url>
   BUILT_IN_FORGE_API_KEY=<api-key>
   VITE_FRONTEND_FORGE_API_KEY=<frontend-key>
   VITE_FRONTEND_FORGE_API_URL=<frontend-url>
   VITE_APP_TITLE=CINEASTA KID'S
   VITE_APP_LOGO=/logo.svg
   ```

4. **Deploy**
   - Clique em "Create Web Service"
   - Aguarde a conclusão do build

---

## 🐳 Deploy com Docker

### 1. Criar Dockerfile

```dockerfile
FROM node:22-alpine

# Habilitar Corepack para usar pnpm
RUN corepack enable

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Instalar dependências
RUN pnpm install --frozen-lockfile

# Copiar código fonte
COPY . .

# Build da aplicação
RUN pnpm build

# Expor porta
EXPOSE 3000

# Comando de inicialização
CMD ["pnpm", "start"]
```

### 2. Criar .dockerignore

```
node_modules
dist
.git
.env
*.log
```

### 3. Build e Run

```bash
# Build da imagem
docker build -t cineasta-kids .

# Executar container
docker run -p 3000:3000 \
  -e DATABASE_URL="sua-connection-string" \
  -e JWT_SECRET="seu-secret" \
  # ... outras variáveis de ambiente
  cineasta-kids
```

---

## ☁️ Deploy no Vercel

**Nota**: O Vercel é otimizado para aplicações serverless. Esta aplicação usa Express e pode requerer adaptações.

1. **Instalar Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Configurar variáveis de ambiente**
   - Acesse o dashboard do Vercel
   - Vá em Settings → Environment Variables
   - Adicione todas as variáveis necessárias

---

## 🔧 Configuração do Banco de Dados

Após o primeiro deploy, execute as migrações:

```bash
# Se tiver acesso SSH ao servidor
pnpm db:push

# Ou configure um script de inicialização
```

---

## 📊 Monitoramento

### Logs

**Render**:
- Acesse o dashboard do Render
- Clique no seu serviço
- Vá para a aba "Logs"

**Docker**:
```bash
docker logs -f <container-id>
```

### Health Check

A aplicação expõe um endpoint de health check:
```
GET /api/health
```

---

## 🔒 Segurança

### Variáveis Sensíveis

**NUNCA** commite as seguintes variáveis no código:
- DATABASE_URL
- JWT_SECRET
- API Keys (BUILT_IN_FORGE_API_KEY, etc.)
- OAuth credentials

### JWT_SECRET

Gere um secret seguro:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🐛 Troubleshooting

### Erro: "packageManager field indicates Corepack"

**Solução**: Use o comando de build com `corepack enable`:
```bash
corepack enable && pnpm install && pnpm build
```

### Erro: "Cannot find module"

**Solução**: Certifique-se de que todas as dependências foram instaladas:
```bash
pnpm install --frozen-lockfile
```

### Erro de conexão com banco de dados

**Solução**: Verifique:
1. DATABASE_URL está correta
2. Banco de dados está acessível
3. Firewall permite conexões
4. Credenciais estão corretas

### Erro de build do Vite

**Solução**: Limpe o cache e reconstrua:
```bash
rm -rf node_modules dist
pnpm install
pnpm build
```

---

## 📝 Checklist de Deploy

- [ ] Banco de dados MySQL/TiDB criado
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Código commitado e pushed para GitHub
- [ ] Build local testado (`pnpm build`)
- [ ] Testes passando (`pnpm test`)
- [ ] Migrações do banco executadas
- [ ] Health check funcionando
- [ ] Logs monitorados

---

## 🆘 Suporte

Se encontrar problemas durante o deploy:

1. Verifique os logs da aplicação
2. Consulte a documentação da plataforma
3. Revise as variáveis de ambiente
4. Teste localmente com as mesmas configurações

---

**Boa sorte com o deploy! 🚀**
