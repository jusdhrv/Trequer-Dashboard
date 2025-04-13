# Trequer Dashboard

A real-time monitoring and diagnostics dashboard built with Next.js 13 and Supabase.

[![Vercel](https://img.shields.io/badge/vercel-deployed-brightgreen.svg)](https://trequer-dashboard.vercel.app)
[![Next.js](https://img.shields.io/badge/next.js-13.4.4-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.0.4-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/supabase-managed-green.svg)](https://supabase.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/jusdhrv/Trequer-Dashboard/pulls)
[![Code Style](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)
[![Status](https://img.shields.io/badge/status-in%20development-orange.svg)]()

## 🚀 Quick Start

1. **Clone and Install**

   ```bash
   git clone https://github.com/jusdhrv/Trequer-Dashboard.git
   cd trequer-dashboard
   npm install
   ```

2. **Environment Setup**
   - Copy `.env.example` to `.env.local`
   - Add your Supabase credentials:

     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

3. **Run Development Server**

   ```bash
   npm run dev
   ```

## 🏗️ Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) 13.4.4 (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Backend**: [Supabase](https://supabase.com/) (Database, Auth, Real-time)
- **UI**: Custom components based on [shadcn/ui](https://ui.shadcn.com/)
- **Deployment**: [Vercel](https://vercel.com/)
- **CSS**: [Tailwind CSS](https://tailwindcss.com/) with [PostCSS](https://postcss.org/)

## Project Structure

```
trequer-dashboard/
├── app/              # Next.js 13 app directory
├── components/       # React components
│   ├── ui/          # Reusable UI components
├── data/            # Data utilities and constants
├── docs/            # Documentation files
│   ├── bug-fixes/   # Bug fix documentation
│   ├── features/    # Feature documentation
│   ├── security/    # Security-related documentation
│   └── enhancements/# Enhancement proposals
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and libraries
├── public/          # Static files
├── scripts/         # Build and utility scripts
└── src/             # Source files
```

## Environment Setup

Copy `.env.example` to `.env.local` and configure the following variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# Add other required variables as needed
```

## 📚 Documentation

Detailed documentation is available in the `/docs` directory:

- [Features Documentation](/docs/features/)
- [Bug Fixes History](/docs/bug-fixes/)
- [Enhancements](/docs/enhancements/)
- [Security Guidelines](/docs/security/)

## 🔑 Key Features

- 📊 Real-time dashboard monitoring
- 📥 Notification inbox with real-time updates
- 💾 Data visualization and management
- 🔍 System diagnostics
- ⚙️ Customizable settings

## 🛠️ Development

### Prerequisites

- Node.js 16.x or later
- npm/yarn
- Supabase account

### Key Development Notes

- Uses Next.js App Router for routing
- Implements real-time subscriptions with Supabase
- Follows TypeScript best practices
- Component documentation available in respective directories

## 🤝 Contributing

1. Check [Documentation-Template.md](/docs/Documentation-Template.md) for documentation standards
2. Follow the existing code style and component patterns
3. Add appropriate documentation for new features
4. Ensure all TypeScript types are properly defined

## 📝 License

This project is licensed under the Mozilla Public License 2.0 - see the [LICENSE](LICENSE) file for details.

*Note: This is a personal project currently maintained by a solo developer. While contributions are welcome, please understand that response times may vary.*
