# DropTag

Instant, hashtag-based file and text sharing. Create a temporary room, share a link, and collaborate without signups.

**Live:** https://droptag.cloud/

## Features

- **Hashtag rooms** — Create or join a room with a name like `#hackathon2026`
- **File sharing** — Upload and download files in-browser
- **Text notes** — Share short text snippets alongside files
- **PIN protection** — Optional room PIN for private sharing
- **Auto-expiry** — Rooms expire after a set time (default 24 hours)
- **No accounts** — Jump in immediately; no email or signup required
- **Short links** — `/r/:hashtag` redirects to the full room URL

## Tech stack

| Layer | Tools |
|-------|-------|
| Frontend | React 18, TypeScript, Vite |
| UI | Tailwind CSS, shadcn/ui, Radix |
| Data | Supabase (Postgres + Storage) |
| State | TanStack Query, React Router |
| Deploy | Vercel |

## Project structure

```
drop-tag/
├── droptag-frontend/     # Vite React app (main application)
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── lib/          # Supabase client, rooms, files, auth
│   │   └── pages/        # Routes (Index, Room, Privacy, Terms)
│   ├── vercel.json       # SPA rewrites for client-side routing
│   └── package.json      # App dependencies and scripts
├── .env.example          # Environment variable template
├── .gitignore
└── package.json          # Root scripts (delegates to droptag-frontend)
```

## Getting started

### Prerequisites

- Node.js 18+
- npm
- A [Supabase](https://supabase.com) project

### 1. Clone and install

```sh
git clone https://github.com/sahilleth/drop-tag.git
cd drop-tag
cd droptag-frontend && npm install
```

Or from the repo root (runs install in `droptag-frontend`):

```sh
cd droptag-frontend && npm install
```

### 2. Configure environment variables

Copy the example env file into `droptag-frontend/` (where Vite runs):

```sh
cp .env.example droptag-frontend/.env.local
```

Fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

> `.env.local` is gitignored. Never commit real keys. On Vercel, set the same variables in the project dashboard instead.

### 3. Run locally

From the repo root:

```sh
npm run dev
```

Or from `droptag-frontend/`:

```sh
npm run dev
```

Open [http://localhost:8080](http://localhost:8080).

## Scripts

Run these from the **repo root**:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build → `droptag-frontend/dist` |
| `npm run lint` | ESLint |
| `npm run test` | Vitest unit tests |

Additional scripts in `droptag-frontend/`:

| Command | Description |
|---------|-------------|
| `npm run preview` | Preview production build locally |
| `npm run test:watch` | Vitest in watch mode |

## Deployment (Vercel)

The app deploys from `droptag-frontend/` on Vercel.

1. Import the GitHub repo in [Vercel](https://vercel.com)
2. Set **Root Directory** to `droptag-frontend`
3. Framework preset: **Vite** (build: `npm run build`, output: `dist`)
4. Add environment variables in the Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

`vercel.json` in `droptag-frontend/` handles SPA routing so deep links like `/room/myroom/files` work in production.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous (public) key |

Never commit `.env.local` or real keys. Use `.env.example` as the template for new contributors.

## Routes

| Path | Description |
|------|-------------|
| `/` | Landing — create or join a room |
| `/room/:hashtag/files` | Room file list and uploads |
| `/room/:hashtag/text` | Room text notes |
| `/r/:hashtag` | Short link redirect |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |

## License

Private project. All rights reserved.
