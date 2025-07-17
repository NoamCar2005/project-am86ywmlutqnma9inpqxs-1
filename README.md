# AdCraft - AI Creative Generation Platform

A modern, Hebrew-first platform for AI-powered creative content generation, built with React, TypeScript, and Vite.

## 🚀 Features

- **AI-Powered Creative Generation**: Generate videos, images, and content using advanced AI
- **Hebrew-First Design**: Complete RTL support and Hebrew interface
- **Multi-Step Creative Process**: Brief → Avatar → Planning → Preview workflow
- **Marketing Assistant**: AI-powered marketing advice and strategy suggestions
- **Project Management**: Track and manage all your creative projects
- **Credit System**: Manage usage and billing with a credit-based system
- **Responsive Design**: Works perfectly on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + Shadcn/ui
- **State Management**: React Hooks + LocalStorage
- **AI Integration**: Mock system (ready for Make.com integration)
- **Styling**: Tailwind CSS with custom Hebrew RTL support

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd adcraft
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Make.com Integration Setup

The app is designed to work with Make.com as the backend. Here's how to set it up:

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Make.com Integration
VITE_MAKE_WEBHOOK_URL=https://hook.eu1.make.com/your-webhook-url
VITE_MAKE_API_KEY=your_make_api_key_here

# AI Service Configuration
VITE_AI_SERVICE_URL=https://your-ai-service.com/api
VITE_AI_API_KEY=your_ai_api_key_here

# Database Configuration (if using external database)
VITE_DATABASE_URL=your_database_url_here

# Email Service Configuration
VITE_EMAIL_SERVICE_URL=https://your-email-service.com/api
VITE_EMAIL_API_KEY=your_email_api_key_here

# App Configuration
VITE_APP_NAME=AdCraft
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development

# Feature Flags
VITE_ENABLE_REAL_AI=true
VITE_ENABLE_EMAIL_NOTIFICATIONS=true
VITE_ENABLE_ANALYTICS=false
```

### Make.com Workflow Setup

The app expects the following Make.com workflows:

1. **Create Video Workflow** (`create-video`)
   - Input: Project data, creative plan, avatar data
   - Output: Video URL, thumbnail URL, status updates

2. **Generate Plan Workflow** (`generate-plan`)
   - Input: Brief, product URL, creative type
   - Output: AI-generated creative plan with scenes

3. **Process Avatar Workflow** (`process-avatar`)
   - Input: Avatar data (name, age, gender, interests, etc.)
   - Output: Processed avatar insights

4. **File Upload Workflow** (`upload`)
   - Input: File data
   - Output: File URL and metadata

### Integration Points

The app has 6 main integration points ready for Make.com:

```typescript
// AI Services
invokeLLM(params)        // Text generation
generateImage(params)    // Image generation

// File Management
uploadFile(file)         // File uploads
getUploadedFile(id)      // File retrieval

// Communication
sendEmail(data)          // Email notifications

// Project Management
CreativeService          // Video/creative management
ProjectService           // Project management
```

### Switching Between Mock and Real Services

The app automatically switches between mock and real services based on environment variables:

- **No environment variables** = Uses mock services (current state)
- **With environment variables** = Uses real Make.com services

## 🎨 Customization

### Brand Colors

The app uses a custom brand color palette defined in `src/index.css`:

```css
.brand-primary: #1E2849 (Navy)
.brand-secondary: #C3995B (Gold)
```

### Hebrew RTL Support

Complete Hebrew RTL support is implemented throughout the app:

- Text direction: RTL
- Layout: Right-to-left
- Typography: Hebrew-optimized fonts
- Icons: RTL-aware positioning

## 📱 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/ui components
│   ├── creative/       # Creative generation components
│   └── dashboard/      # Dashboard-specific components
├── pages/              # Main application pages
├── lib/                # Utility functions and services
├── hooks/              # Custom React hooks
├── integrations/       # API integration layer
└── entities/           # TypeScript interfaces and types
```

## 🔄 Development Workflow

1. **Feature Development**: Create new components in `src/components/`
2. **Page Creation**: Add new pages in `src/pages/`
3. **API Integration**: Update `src/integrations/core.ts`
4. **Styling**: Use Tailwind CSS classes and custom utilities
5. **Testing**: Test in development mode with `npm run dev`

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting provider

3. **Set environment variables** in your hosting platform

4. **Configure Make.com workflows** with the correct webhook URLs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the code comments
- Open an issue on GitHub

---

**Built with ❤️ for the Hebrew-speaking creative community**