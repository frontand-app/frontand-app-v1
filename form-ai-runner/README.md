# CLOSED AI Frontend

> Modern React frontend for the CLOSED AI workflow automation platform

## 🚀 Live Demo

- **Local Development**: http://localhost:8080
- **Try the Demo**: http://localhost:8080/flows/cluster-keywords
- **Demo Mode**: No authentication required

## ✨ Features

- **🎯 Workflow Execution** - Run AI workflows through intuitive forms
- **💰 Cost Estimation** - Real-time cost calculation before execution
- **🎨 Modern UI** - Clean design with Tailwind CSS + shadcn/ui
- **📱 Responsive** - Works perfectly on mobile and desktop
- **🚀 Demo Mode** - Test workflows without creating an account
- **⚡ Fast Loading** - Built with Vite for optimal performance

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: React Query
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base shadcn/ui components
│   ├── auth/           # Authentication components
│   ├── oauth/          # OAuth integration
│   └── sharing/        # Workflow sharing features
├── pages/              # Application pages
│   ├── Index.tsx       # Landing page
│   ├── FlowRunner.tsx  # Workflow execution page
│   ├── FlowLibrary.tsx # Browse workflows
│   └── Dashboard.tsx   # User dashboard
├── lib/                # Utilities and integrations
│   ├── api.ts          # API client
│   ├── supabase.ts     # Supabase configuration
│   └── oauth.ts        # OAuth management
├── hooks/              # Custom React hooks
└── workflows/          # Workflow definitions
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm 8+ (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/federicodeponte/form-ai-runner.git
cd form-ai-runner

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

### Available Scripts

```bash
# Development
pnpm run dev          # Start dev server (http://localhost:8080)

# Building
pnpm run build        # Build for production
pnpm run build:dev    # Build for development
pnpm run preview      # Preview production build

# Code Quality
pnpm run lint         # Run ESLint
```

## 🌟 Key Components

### Workflow Execution
- **FlowRunner**: Main workflow execution interface
- **WorkflowLayout**: Responsive layout with input/output sections
- **CreditsDisplay**: Real-time cost estimation and user balance

### Authentication
- **AuthProvider**: Supabase authentication context
- **LoginForm**: User login interface
- **SignUpForm**: User registration interface

### UI Components
- Modern design system based on shadcn/ui
- Consistent color scheme with emerald green theme
- Responsive components for all screen sizes

## 🎨 Design System

### Colors
- **Primary**: Emerald green (#10b981)
- **Background**: Clean whites and light grays
- **Text**: Professional grays for readability
- **Accents**: Blue for info, green for success, red for errors

### Typography
- **Font**: Inter (Google Fonts)
- **Hierarchy**: Clear heading and body text styles
- **Spacing**: Consistent spacing scale

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:8000
VITE_ENVIRONMENT=development
```

### Supabase Setup

The app integrates with Supabase for:
- User authentication
- Database operations
- Real-time subscriptions

## 📱 Demo Workflows

### Keyword Clustering
- **URL**: `/flows/cluster-keywords`
- **Function**: Groups keywords using AI clustering
- **Input**: List of keywords (comma-separated)
- **Output**: Organized keyword groups with similarity scores

### Sentiment Analysis
- **URL**: `/flows/sentiment-analysis`
- **Function**: Analyzes text sentiment and emotions
- **Input**: Text content
- **Output**: Sentiment score and emotion breakdown

## 🛡️ Authentication

### Demo Mode
- Run workflows without account creation
- Limited functionality but full UI experience
- Perfect for testing and demonstrations

### Full Authentication
- Supabase-powered user accounts
- Secure JWT tokens
- User profile management
- Usage tracking and billing

## 🔄 Development Workflow

### Adding New Workflows

1. **Create Workflow Definition**:
   ```typescript
   // src/workflows/my-workflow.ts
   export const myWorkflow = {
     id: 'my-workflow',
     name: 'My Workflow',
     description: 'Description here',
     inputs: [/* input schema */],
     // ... other properties
   };
   ```

2. **Add Route**:
   ```tsx
   <Route path="/flows/my-workflow" element={<FlowRunner />} />
   ```

3. **Update FlowRunner**:
   Add workflow logic to the `FlowRunner` component

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for React + TypeScript
- **Prettier**: Code formatting (recommended)
- **Components**: Functional components with hooks

## 🚀 Deployment

### Build for Production

```bash
pnpm run build
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify

```bash
# Build
pnpm run build

# Upload dist/ folder to Netlify
```

## 🐛 Troubleshooting

### Common Issues

1. **Port 8080 in use**: Change port in `vite.config.ts`
2. **Supabase errors**: Check environment variables
3. **Build errors**: Clear node_modules and reinstall

### Development Tips

- Use React DevTools for debugging
- Check browser console for errors
- Ensure backend is running on port 8000

## 🤝 Contributing

### How to Contribute

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Guidelines

- Write TypeScript with proper types
- Use existing UI components when possible
- Follow the established file structure
- Add comments for complex logic

## 📊 Performance

- **Lighthouse Score**: 90+ (Performance, Accessibility, Best Practices)
- **Bundle Size**: Optimized with Vite tree-shaking
- **Loading Speed**: Fast initial load with code splitting

## 📞 Support

- **GitHub Issues**: [Report bugs and feature requests](https://github.com/federicodeponte/form-ai-runner/issues)
- **Discussions**: Use GitHub Discussions for questions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the CLOSED AI community** 🚀

### Available Scripts

```bash
# Development
pnpm run dev          # Start dev server (http://localhost:8080)

# Building
pnpm run build        # Build for production
pnpm run build:dev    # Build for development
pnpm run preview      # Preview production build

# Code Quality
pnpm run lint         # Run ESLint
```

## 🌟 Key Components

### Workflow Execution
- **FlowRunner**: Main workflow execution interface
- **WorkflowLayout**: Responsive layout with input/output sections
- **CreditsDisplay**: Real-time cost estimation and user balance

### Authentication
- **AuthProvider**: Supabase authentication context
- **LoginForm**: User login interface
- **SignUpForm**: User registration interface

### UI Components
- Modern design system based on shadcn/ui
- Consistent color scheme with emerald green theme
- Responsive components for all screen sizes

## 🎨 Design System

### Colors
- **Primary**: Emerald green (#10b981)
- **Background**: Clean whites and light grays
- **Text**: Professional grays for readability
- **Accents**: Blue for info, green for success, red for errors

### Typography
- **Font**: Inter (Google Fonts)
- **Hierarchy**: Clear heading and body text styles
- **Spacing**: Consistent spacing scale

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:8000
VITE_ENVIRONMENT=development
```

### Supabase Setup

The app integrates with Supabase for:
- User authentication
- Database operations
- Real-time subscriptions

## 📱 Demo Workflows

### Keyword Clustering
- **URL**: `/flows/cluster-keywords`
- **Function**: Groups keywords using AI clustering
- **Input**: List of keywords (comma-separated)
- **Output**: Organized keyword groups with similarity scores

### Sentiment Analysis
- **URL**: `/flows/sentiment-analysis`
- **Function**: Analyzes text sentiment and emotions
- **Input**: Text content
- **Output**: Sentiment score and emotion breakdown

## 🛡️ Authentication

### Demo Mode
- Run workflows without account creation
- Limited functionality but full UI experience
- Perfect for testing and demonstrations

### Full Authentication
- Supabase-powered user accounts
- Secure JWT tokens
- User profile management
- Usage tracking and billing

## 🔄 Development Workflow

### Adding New Workflows

1. **Create Workflow Definition**:
   ```typescript
   // src/workflows/my-workflow.ts
   export const myWorkflow = {
     id: 'my-workflow',
     name: 'My Workflow',
     description: 'Description here',
     inputs: [/* input schema */],
     // ... other properties
   };
   ```

2. **Add Route**:
   ```tsx
   <Route path="/flows/my-workflow" element={<FlowRunner />} />
   ```

3. **Update FlowRunner**:
   Add workflow logic to the `FlowRunner` component

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for React + TypeScript
- **Prettier**: Code formatting (recommended)
- **Components**: Functional components with hooks

## 🚀 Deployment

### Build for Production

```bash
pnpm run build
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify

```bash
# Build
pnpm run build

# Upload dist/ folder to Netlify
```

## 🐛 Troubleshooting

### Common Issues

1. **Port 8080 in use**: Change port in `vite.config.ts`
2. **Supabase errors**: Check environment variables
3. **Build errors**: Clear node_modules and reinstall

### Development Tips

- Use React DevTools for debugging
- Check browser console for errors
- Ensure backend is running on port 8000

## 🤝 Contributing

### How to Contribute

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Guidelines

- Write TypeScript with proper types
- Use existing UI components when possible
- Follow the established file structure
- Add comments for complex logic

## 📊 Performance

- **Lighthouse Score**: 90+ (Performance, Accessibility, Best Practices)
- **Bundle Size**: Optimized with Vite tree-shaking
- **Loading Speed**: Fast initial load with code splitting

## 📞 Support

- **GitHub Issues**: [Report bugs and feature requests](https://github.com/federicodeponte/form-ai-runner/issues)
- **Discussions**: Use GitHub Discussions for questions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the CLOSED AI community** 🚀

### Available Scripts

```bash
# Development
pnpm run dev          # Start dev server (http://localhost:8080)

# Building
pnpm run build        # Build for production
pnpm run build:dev    # Build for development
pnpm run preview      # Preview production build

# Code Quality
pnpm run lint         # Run ESLint
```

## 🌟 Key Components

### Workflow Execution
- **FlowRunner**: Main workflow execution interface
- **WorkflowLayout**: Responsive layout with input/output sections
- **CreditsDisplay**: Real-time cost estimation and user balance

### Authentication
- **AuthProvider**: Supabase authentication context
- **LoginForm**: User login interface
- **SignUpForm**: User registration interface

### UI Components
- Modern design system based on shadcn/ui
- Consistent color scheme with emerald green theme
- Responsive components for all screen sizes

## 🎨 Design System

### Colors
- **Primary**: Emerald green (#10b981)
- **Background**: Clean whites and light grays
- **Text**: Professional grays for readability
- **Accents**: Blue for info, green for success, red for errors

### Typography
- **Font**: Inter (Google Fonts)
- **Hierarchy**: Clear heading and body text styles
- **Spacing**: Consistent spacing scale

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:8000
VITE_ENVIRONMENT=development
```

### Supabase Setup

The app integrates with Supabase for:
- User authentication
- Database operations
- Real-time subscriptions

## 📱 Demo Workflows

### Keyword Clustering
- **URL**: `/flows/cluster-keywords`
- **Function**: Groups keywords using AI clustering
- **Input**: List of keywords (comma-separated)
- **Output**: Organized keyword groups with similarity scores

### Sentiment Analysis
- **URL**: `/flows/sentiment-analysis`
- **Function**: Analyzes text sentiment and emotions
- **Input**: Text content
- **Output**: Sentiment score and emotion breakdown

## 🛡️ Authentication

### Demo Mode
- Run workflows without account creation
- Limited functionality but full UI experience
- Perfect for testing and demonstrations

### Full Authentication
- Supabase-powered user accounts
- Secure JWT tokens
- User profile management
- Usage tracking and billing

## 🔄 Development Workflow

### Adding New Workflows

1. **Create Workflow Definition**:
   ```typescript
   // src/workflows/my-workflow.ts
   export const myWorkflow = {
     id: 'my-workflow',
     name: 'My Workflow',
     description: 'Description here',
     inputs: [/* input schema */],
     // ... other properties
   };
   ```

2. **Add Route**:
   ```tsx
   <Route path="/flows/my-workflow" element={<FlowRunner />} />
   ```

3. **Update FlowRunner**:
   Add workflow logic to the `FlowRunner` component

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for React + TypeScript
- **Prettier**: Code formatting (recommended)
- **Components**: Functional components with hooks

## 🚀 Deployment

### Build for Production

```bash
pnpm run build
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify

```bash
# Build
pnpm run build

# Upload dist/ folder to Netlify
```

## 🐛 Troubleshooting

### Common Issues

1. **Port 8080 in use**: Change port in `vite.config.ts`
2. **Supabase errors**: Check environment variables
3. **Build errors**: Clear node_modules and reinstall

### Development Tips

- Use React DevTools for debugging
- Check browser console for errors
- Ensure backend is running on port 8000

## 🤝 Contributing

### How to Contribute

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Guidelines

- Write TypeScript with proper types
- Use existing UI components when possible
- Follow the established file structure
- Add comments for complex logic

## 📊 Performance

- **Lighthouse Score**: 90+ (Performance, Accessibility, Best Practices)
- **Bundle Size**: Optimized with Vite tree-shaking
- **Loading Speed**: Fast initial load with code splitting

## 📞 Support

- **GitHub Issues**: [Report bugs and feature requests](https://github.com/federicodeponte/form-ai-runner/issues)
- **Discussions**: Use GitHub Discussions for questions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the CLOSED AI community** 🚀
