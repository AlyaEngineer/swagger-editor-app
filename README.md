# Swagger Editor App

A web application for editing, viewing, and testing OpenAPI/Swagger specifications. Built as a final project for RS School.

## Features

- Load and edit OpenAPI/Swagger schemas in JSON or YAML, with automatic format detection and conversion
- Real-time schema validation with error indication
- Interactive Swagger Viewer with endpoint list, parameters, request/response details
- User registration and sign-in to save schemas and track request history
- Request history and analytics for authenticated users
- Multi-language support (English, Russian)

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- MUI v9
- next-intl
- Supabase (auth + database)
- Monaco Editor
- Vitest + React Testing Library

## Getting Started

### Installation

```bash
git clone https://github.com/AlyaEngineer/swagger-editor-app.git
cd swagger-editor-app
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase project credentials:

```bash
cp .env.example .env.local
```

- `NEXT_PUBLIC_SUPABASE_URL` - your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` - your Supabase publishable (anon) key

Both values can be found in your Supabase project settings under API.

### Running locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Testing

```bash
npm run test
npm run test:coverage
```

### Linting

```bash
npm run lint
npm run format
```
