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

## How to Use This App

### App Flow Overview

```
Dashboard → Leads → Pipeline → Follow-ups → Invoices → Reports
```

### Step-by-Step Guide

#### 1. Dashboard (Home)
- View key metrics: total leads, pipeline value, conversion rates
- See recent leads and upcoming follow-ups at a glance
- Monitor lead sources and revenue trends through charts

#### 2. Leads Management
- **Add New Lead**: Click "Add Lead" button to create a new lead with contact details, company info, and requirements
- **View Leads**: Browse all leads in a table format with sorting and filtering
- **Edit Lead**: Click on any lead to update their information
- **Contact Actions**: Quick actions to call, email, or WhatsApp leads directly
- **Add Notes**: Track all interactions and conversations with each lead

#### 3. Pipeline View
- **Visual Pipeline**: See all leads organized by status columns (New → Contacted → Follow-up → Interested → Proposal → Won/Lost)
- **Drag & Drop**: Move leads between stages by dragging cards
- **Quick Stats**: View total leads, pipeline value, and conversion rates
- **Lead Details**: Click any lead card to view full details and add notes

#### 4. Follow-ups
- View scheduled follow-up reminders
- Track pending and completed follow-ups
- Never miss an important client interaction

#### 5. Invoices
- Manage invoices for won deals
- Track payment status and history

#### 6. Reports
- Analyze sales performance
- View trends and insights
- Export data for further analysis

### Typical User Workflow

1. **Capture Lead** → Add new lead from website inquiry, referral, or cold call
2. **Initial Contact** → Move to "Contacted" after first interaction
3. **Follow-up** → Schedule and track follow-ups in the system
4. **Nurture** → Add notes for each interaction, move through pipeline stages
5. **Close Deal** → Mark as "Won" and create invoice
6. **Analyze** → Review reports to improve sales process

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
- **@dnd-kit** - Drag and drop functionality

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
