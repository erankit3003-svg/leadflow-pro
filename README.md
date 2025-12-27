# Lead Management CRM

A modern lead management and CRM application built with React, TypeScript, and Tailwind CSS.

## Features

- 📊 Dashboard with analytics and charts
- 👥 Lead management with table and pipeline views
- 📝 Lead notes and comments tracking
- 📅 Follow-up scheduling and reminders
- 📄 Invoice management
- 📈 Reports and analytics

## How to Install

### Prerequisites

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **bun** package manager

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or if using bun
   bun install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or if using bun
   bun run dev
   ```

4. **Open in browser**
   
   Navigate to `http://localhost:5173` to view the application.

### Build for Production

```bash
npm run build
# or
bun run build
```

The production files will be in the `dist` folder.

### Preview Production Build

```bash
npm run preview
# or
bun run preview
```

## Tech Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **React Router** - Navigation
- **Recharts** - Charts and graphs
- **React Hook Form** - Form handling
- **date-fns** - Date utilities

## Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── dashboard/  # Dashboard-specific components
│   ├── layout/     # Layout components (Header, Sidebar)
│   ├── leads/      # Lead management components
│   └── ui/         # shadcn/ui components
├── data/           # Mock data
├── hooks/          # Custom React hooks
├── lib/            # Utility functions
├── pages/          # Page components
└── types/          # TypeScript types
```

## Deployment

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Custom Domain

To connect a custom domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
