# Decor - Blinds & Curtains Visualizer

**See your blinds in your home before buying** with advanced perspective mapping technology.

## 🏠 What is Decor?

Decor is a sophisticated web application that lets users:
- Take or upload photos of their windows
- Mark window coordinates with draggable corner points
- Apply realistic blind and curtain designs with perspective mapping
- Fine-tune opacity, scale, positioning, and open/closed states  
- Save, share, and download their visualizations
- Request quotes directly from dealers

## ✨ Features

### Core Functionality
- **Photo Capture**: Camera integration + file upload with drag & drop
- **Window Mapping**: Interactive 4-corner coordinate selection with auto-detect
- **Product Catalog**: Browse roller blinds, venetian blinds, curtains, and shutters
- **Perspective Preview**: Real-time WebGL-based texture mapping with homography
- **Fine Controls**: Opacity, scale, vertical offset, rotation, open/closed states
- **Save & Share**: Generate shareable links and download high-quality images

### Technical Features  
- **Responsive Design**: Mobile-first UI with touch-friendly controls
- **Progressive Enhancement**: Graceful fallback if WebGL unavailable
- **Keyboard Accessibility**: Arrow key nudging for precise coordinate adjustment
- **Memory Efficient**: Optimized for mobile devices with smart image scaling

## 🚀 User Flow

1. **Landing** → Choose to get started
2. **Photo Step** → Take photo (camera) or upload image (file/drag-drop)
3. **Window Coords** → Drag 4 corner handles to mark window boundaries  
4. **Product Selection** → Browse catalog and apply products to see instant preview
5. **Preview & Edit** → Fine-tune with opacity, scale, positioning controls
6. **Save & Share** → Generate shareable links, download images, request quotes

## 🎨 Design System

The app uses a sophisticated design system with:
- **Warm Color Palette**: Premium browns, creams, and sophisticated teals
- **Semantic Tokens**: All colors defined in design system (no hardcoded values)
- **Glass Morphism**: Modern backdrop blur effects and elegant shadows  
- **Smooth Animations**: Spring transitions and interactive hover states
- **Typography**: Inter font family for clean, professional appearance

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui with custom variants
- **State Management**: React Context + useReducer
- **Canvas Rendering**: HTML5 Canvas with WebGL perspective mapping
- **Routing**: React Router for single-page navigation
- **Icons**: Lucide React for consistent iconography

## 📁 Key Components

- `Layout` - Header, navigation, and responsive container
- `PhotoCapture` - Camera integration and file upload UI  
- `WindowSelector` - Interactive coordinate selection with draggable handles
- `CatalogBrowser` - Product grid with categories and filtering
- `PreviewCanvas` - Perspective mapping and texture rendering engine
- `ControlsPanel` - Real-time adjustment sliders and toggles
- `SceneManager` - Save, share, download, and quote request functionality

## 🎯 Browser Support

- **Desktop**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: Chrome/Safari on iOS 14+, Chrome on Android 10+
- **Camera**: Requires HTTPS for camera access (automatically handled)
- **WebGL**: Graceful fallback to 2D canvas if WebGL unavailable

## 🔧 Development

```bash
# Install dependencies
npm install

# Start development server  
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📱 Mobile Considerations

- **Camera-first UI** on mobile devices
- **Touch-optimized** dragging and controls
- **Fluid FABs** and collapsible panels
- **Memory management** with image downscaling
- **Offline fallbacks** for poor connections

## 🎨 Customization

The design system is fully customizable via:
- `src/index.css` - Color tokens, gradients, shadows
- `tailwind.config.ts` - Extended theme configuration  
- Component variants can be extended for client branding

## 🚀 Deployment

Ready for deployment to:
- Vercel (recommended)
- Netlify
- AWS S3 + CloudFront
- Any static hosting provider

## 📄 License

Built with Decor - The AI-powered web app builder.

---

**Ready to visualize your perfect window treatments?** [Get Started →](https://your-domain.com)