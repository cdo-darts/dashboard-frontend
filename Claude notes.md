Dev Server Running
URL: http://localhost:3000

The server is running in the background. You can now view the app in your browser.

What I've Built
I've created a complete, mobile-first Vue.js dashboard with a sleek cinematic dark glass-panel design. Here's what's included:

🎨 Design & Styling
Cinematic dark theme with radial gradient backgrounds
Glass-morphism effects on all cards (blur, transparency, subtle borders)
Mobile-first responsive design - optimized for phone/tablet usage
Bottom navigation on mobile, top tabs on desktop
Smooth animations and hover effects
Color-coded status indicators with glowing effects
📊 Dashboard Page (index.vue)
System Info Card - Hostname, uptime, API version
CPU Card - Usage percentage with circular progress, core count, frequency
Memory Card - Usage with progress bar, available/used display
Disk Card - Storage usage with progress bar
Temperature Card - CPU temp in °C/°F with status badges (normal/warm/hot/critical)
Network Card - WiFi signal strength, IP addresses, data transfer stats
Autodarts Quick Status - Clickable card showing service status
Features:

Auto-refresh every 5 seconds (configurable in settings)
Real-time connection status indicator
Error handling with retry functionality
Color-coded health indicators (green/yellow/red)
🎯 Autodarts Management Page (autodarts.vue)
Service Status - Shows installed version, latest version, service state
Service Controls - Start, Stop, Restart buttons with loading states
Install/Update - Install new or update existing Autodarts
Update Checker - Manual check for available updates
Live Logs Viewer - Terminal-style log display with configurable line count
Manager availability check - Warns if autodarts-manager is not installed
⚙️ Settings Page (settings.vue)
Display Settings
Dark/Light theme toggle
Dashboard refresh interval slider (1-60 seconds)
Notification Settings
Toggle for update notifications
Toggle for installation completion notifications
Auto-Update Settings
Enable/disable automatic update checks
Configure check interval (hours)
Set preferred check time
Auto-install toggle with warning
Actions
Save settings button (only enabled when changes made)
Reset to defaults with confirmation
🔧 Technical Implementation
API Service (api.js)

Axios-based HTTP client
All API endpoints implemented
Error interceptor for consistent error handling
Configurable base URL via .env file
Reusable Components:

GlassCard.vue - Glass-morphism card wrapper
ToastContainer.vue - Global toast notifications
ConnectionStatus.vue - Connection indicator
StatusBadge.vue - Status badges with color variants
Monitoring Cards:

CPUCard.vue
MemoryCard.vue
DiskCard.vue
TemperatureCard.vue
NetworkCard.vue
SystemInfoCard.vue
AutodartsQuickCard.vue
Composables:

useToast.js - Toast notification system
Theming:

vuetify.js - Custom dark theme colors
global.scss - Glass effects, animations, status colors
🌐 API Configuration
The API base URL is set in .env:


VITE_API_BASE_URL=http://cdo-vertex.local:5001/api
You can change this to point to your actual backend when testing.

📱 Mobile-First Features
Bottom navigation on mobile devices (< 600px)
Full-width cards on mobile, grid layout on desktop
Touch-friendly buttons and controls
Optimized spacing for small screens
Safe area insets for notched devices
🎭 Next Steps
Now that the dev server is running, you can:

View the app at http://localhost:3000
Test the UI and see what adjustments you'd like
Point to your backend by updating the .env file
Make any styling/layout changes you need
Let me know what changes or improvements you'd like to make!