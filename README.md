# FIF Web App

Aplicacao web para digitalizar os formularios de `Admissao` e `Rescisao, Ferias e Alteracoes` da FIF.

## Stack

- `Next.js`
- `React`
- `TypeScript`
- `Tailwind CSS`
- `Drizzle ORM`
- `Turso / LibSQL`

## Requisitos

- Node.js 24+
- NPM 11+

## Variaveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```bash
TURSO_DATABASE_URL=libsql://your-database-name.turso.io
TURSO_AUTH_TOKEN=your_turso_auth_token
SESSION_SECRET=replace_with_a_long_random_secret
RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=
ADMIN_NAME=Administrador Inicial
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=troque-essa-senha
RESEND_API_KEY=your_resend_api_key
RESEND_SENDER_EMAIL=notificacoes@example.com
RESEND_SENDER_NAME=RH Flow
RESEND_NOTIFICATION_EMAILS=
```

Se nenhuma variavel for informada, o projeto usa um banco local `local.db` apenas para desenvolvimento.

## Notificacoes por e-mail

O projeto pode enviar notificacoes pelo `Resend` quando:

- um novo usuario e criado
- um novo formulario e registrado pela primeira vez

Para ativar:

1. Gere uma chave de API no Resend
2. Preencha `RESEND_API_KEY`
3. Defina o remetente em `RESEND_SENDER_EMAIL` e `RESEND_SENDER_NAME`
4. Opcionalmente preencha `RESEND_NOTIFICATION_EMAILS` com uma lista separada por virgula

Mesmo sem `RESEND_NOTIFICATION_EMAILS`, o sistema tambem tenta avisar todos os usuarios aprovados com perfil `ADMIN` e `SUPER USER`.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run seed:admin
```

## Primeiro administrador

1. Preencha `ADMIN_NAME`, `ADMIN_EMAIL` e `ADMIN_PASSWORD` no `.env.local`
2. Rode `npm run seed:admin`
3. O admin sera criado apenas se ainda nao existir nenhum admin e se o e-mail nao estiver em uso
4. Depois disso, acesse o login e entre com esse e-mail e senha

## Banco de dados

O app salva os formularios em uma tabela unica de submissions. O payload completo de cada formulario e armazenado em JSON para simplificar a primeira fase do produto e permitir evolucao posterior.

## Estrutura

- `app/`: rotas, paginas e API
- `components/`: componentes reutilizaveis
- `lib/`: configuracoes de formulario, banco e utilitarios
- `design/`: referencia visual exportada do Stitch
- `exemplo/`: planilha original usada como referencia funcional
- `brain/`: memoria local do projeto, ignorada pelo git

## Observacoes

- O escopo atual prioriza UX e persistencia.
- Regras de calculo automatico da planilha ainda nao foram implementadas.
- O PRD do projeto esta em [PRD.md](./PRD.md).
