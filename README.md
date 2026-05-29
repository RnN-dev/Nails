# Nails

Landing page completa para Aline Studio, um estudio de Nails Design, com frontend React + TypeScript + Vite, painel administrativo e backend serverless em Netlify Functions.

## Stack

- Frontend: React, TypeScript, Vite, React Router, Framer Motion, Axios e React Hot Toast.
- Backend: Netlify Functions, JWT, bcryptjs e Netlify Blobs.
- Deploy: Netlify gratuito conectado a um repositorio GitHub.

## Estrutura

```txt
/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── assets/
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── netlify/
│   └── functions/
│       ├── auth.ts
│       ├── photos.ts
│       └── utils/
│           └── auth-middleware.ts
├── scripts/
│   └── generate-hash.js
├── netlify.toml
├── .env.example
└── README.md
```

## Configuracao local

1. Clone o repositorio.
2. Copie `.env.example` para `.env`.
3. Gere o hash da senha:

```bash
npm install
node scripts/generate-hash.js "minha_senha_aqui"
```

4. Preencha as variaveis:

```env
ADMIN_EMAIL=seu-email@dominio.com
ADMIN_PASSWORD_HASH=hash_bcrypt_gerado
JWT_SECRET=uma_string_forte_com_no_minimo_32_caracteres
ALLOWED_ORIGIN=http://localhost:8888
```

5. Instale o frontend:

```bash
npm --prefix frontend install
```

6. Rode localmente com Netlify Dev:

```bash
npm run dev
```

Abra `http://localhost:8888`.

## Scripts

```bash
npm run build
npm run typecheck:functions
npm run generate-hash -- "minha_senha_aqui"
npm --prefix frontend run dev
```

## Deploy gratuito na Netlify

1. Suba o projeto para o GitHub.
2. Na Netlify, clique em **Add new site > Import an existing project**.
3. Conecte o repositorio `https://github.com/RnN-dev/Nails.git`.
4. Confirme as configuracoes detectadas pelo `netlify.toml`:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
   - Functions directory: `netlify/functions`
5. Em **Site configuration > Environment variables**, adicione:
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD_HASH`
   - `JWT_SECRET`
   - `ALLOWED_ORIGIN` com a URL final do site
6. Faça o deploy.

## Admin

- Login: `/admin/login`
- Dashboard: `/admin/dashboard`
- O frontend nunca contem senha ou hash.
- O token JWT expira em 8 horas.
- Uploads aceitam JPG, PNG e WEBP ate 5MB.
- A API valida assinatura real do arquivo, nao apenas extensao ou MIME informado pelo navegador.

## API

- `POST /api/auth`: autentica admin e retorna JWT.
- `GET /api/photos`: lista fotos publicas.
- `GET /api/photos/:id/image`: serve a imagem armazenada no Netlify Blobs.
- `POST /api/photos`: cria foto, requer `Authorization: Bearer <token>`.
- `PATCH /api/photos/:id`: edita titulo/categoria, requer token.
- `DELETE /api/photos/:id`: remove foto, requer token.

## GitHub

Quando o Git estiver disponivel no ambiente:

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/RnN-dev/Nails.git
git push -u origin main
```
