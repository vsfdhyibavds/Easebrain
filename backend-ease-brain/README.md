# EaseBrain - Monorepo

A comprehensive mental health support and crisis detection platform with a Flask backend and React/Vue frontend.

## 📁 Repository Structure

```
easebrain/
├── backend-ease-brain/          # Flask backend API
│   ├── app.py                   # Main application
│   ├── models/                  # Database models
│   ├── resources/               # API endpoints
│   ├── routes/                  # Route handlers
│   ├── utils/                   # Utility functions
│   ├── requirements.txt         # Python dependencies
│   └── README.md               # Backend-specific docs
│
└── frontend/                    # React/Vite frontend
    ├── src/                     # React components
    ├── package.json             # Node dependencies
    └── README.md               # Frontend-specific docs
```

## 🚀 Quick Start

### Backend Setup

```bash
cd backend-ease-brain
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Backend runs on `http://localhost:5500`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## 🏗️ Features

### Backend (Flask API)
- **User & Role Management** - Multi-role system (admin, caregiver, patient)
- **Danger Detection System** - AI-powered crisis detection with LLM support
- **Real-time Messaging** - Secure communication between users and caregivers
- **Health Tracking** - Mood, medications, safety plans
- **Admin Dashboard API** - System monitoring and moderation
- **Security** - JWT auth, rate limiting, CSRF protection, audit logging

### Frontend (React)
- **Responsive UI** - Mobile-first design with Tailwind CSS
- **Authentication** - Secure login/signup with JWT
- **Dashboard** - User, caregiver, and admin dashboards
- **Real-time Chat** - Live messaging with WebSocket support
- **Health Tracking** - Track mood, medications, and wellness

## 📚 Documentation

- **Backend Docs**: See [backend-ease-brain/README.md](backend-ease-brain/README.md)
- **Frontend Docs**: See [frontend/README.md](frontend/README.md)
- **API Docs**: Available at `http://localhost:5500/api/docs` (Swagger UI)

## 🔐 Environment Setup

Create a `.env` file in the backend directory:

```bash
# Backend (.env)
FLASK_APP=app.py
FLASK_DEBUG=1
FRONTEND_URL=http://localhost:5173
DATABASE_URL=sqlite:///easebrain_dev.db
SENDGRID_API_KEY=your_key_here
SECRET_KEY=dev-secret-key
JWT_SECRET_KEY=dev-jwt-secret
```

Create a `.env` file in the frontend directory for development.

## ✅ Testing

### Backend Tests
```bash
cd backend-ease-brain
python -m pytest tests/
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🛠️ Development

### Git Workflow
All code changes should be committed to this monorepo. The structure separates backend and frontend concerns while maintaining a unified project history.

### Available Scripts

**Backend:**
- `python app.py` - Start development server
- `python -m pytest` - Run tests
- `flask db migrate` - Create database migration
- `flask db upgrade` - Apply migrations

**Frontend:**
- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit changes (`git commit -m 'Add AmazingFeature'`)
3. Push to branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

## 📞 Support

For issues and questions:
- Check existing documentation in backend and frontend README files
- Review API documentation at `/api/docs`
- Check issue tracker for similar problems
