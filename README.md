# Face Recognition System

A modern web application for real-time face recognition using advanced facial detection and landmark algorithms.

## Features

- **Real-time Face Detection**: Detects and captures faces using TinyFaceDetector
- **User Registration**: Simple interface to register new users with multiple face samples (6-8 images)
- **Facial Recognition**: Identifies registered users in real-time with confidence scores
- **WebSocket Communication**: Real-time data streaming between frontend and backend
- **Responsive UI**: Clean, modern interface built with Tailwind CSS

## Tech Stack

- **Frontend Framework**: [Next.js 16](https://nextjs.org/) with React 19
- **Face Detection**: [face-api.js](https://github.com/justadudewhohacks/face-api.js) (TinyFaceDetector + Face Landmarks)
- **Real-time Communication**: [Socket.IO](https://socket.io/) client
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript & JSX
- **Package Manager**: npm

## Prerequisites

- Node.js 18+ and npm
- Modern web browser with webcam access
- Backend service running on `http://localhost:3001` (configurable via environment variables)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## Usage

### Main Dashboard
- Navigate to the home page to access the face recognition system
- Click "Register User" to add new users to the system
- Use "Start Camera" to begin face detection

### User Registration
1. Click **Register User** from the main dashboard
2. Enter your name and email address
3. Start the camera and capture 6-8 clear face images
4. Submit to register your profile

### Face Recognition
1. On the main dashboard, click **Start Camera**
2. Position your face in view of the webcam
3. The system will detect and recognize your face
4. Results display with user ID and confidence score

## Project Structure

```
my-app/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main dashboard
│   ├── globals.css         # Global styles
│   └── register/
│       └── page.jsx        # User registration page
├── components/
│   └── CameraCapture.jsx   # Camera capture & recognition component
├── public/
│   └── models/             # Pre-trained ML models
└── package.json            # Project dependencies
```

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## API Integration

The frontend communicates with the backend via WebSocket events:

- **Event**: `frame` - Sends captured face image to backend for recognition
- **Event**: `recognized` - Receives recognition results with user_id and confidence

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_SOCKET_URL` | `http://localhost:3001` | Backend WebSocket server URL |

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Requires HTTPS or localhost for webcam access

## Notes

- Models are pre-loaded on application startup
- Captured face images are stored in the browser's state before transmission
- Face images must be clear and unobstructed for accurate recognition
- User registration requires 6-8 different face angles for better accuracy

## License

This project is open-source and available for personal and commercial use.

## Support

For issues or questions, please contact 
- ✉️ Email: alihamzamashooq@gmail.com  
