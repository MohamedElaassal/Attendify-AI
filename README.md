# AttendifyAI

AI-powered student attendance system using facial recognition.

## Quick Start

### Using Docker

```bash
docker-compose up --build
```

Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/docs

Stop the application:
```bash
docker-compose down
```

### Manual Setup

Backend:
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Configure .env with your MySQL credentials
python app.py
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

Database:
- Import `base.sql` into MySQL

## Tech Stack

Backend: FastAPI, InsightFace, MySQL, OpenCV
Frontend: React, TypeScript, Vite, TailwindCSS

## Environment Variables

Backend `.env` file:
```
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=student_attendance
MYSQL_PORT=3306
FLASK_DEBUG=true
SECRET_KEY=your-secret-key
```

## License

MIT
