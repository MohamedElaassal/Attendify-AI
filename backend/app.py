from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn

from config import get_settings
from models.database import db
from routes.students import router as students_router
from routes.attendance import router as attendance_router
from routes.professors import router as professors_router

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for startup and shutdown"""
    # Startup
    print("🚀 Démarrage de l'application...")
    db.connect()
    yield
    # Shutdown
    print("🛑 Arrêt de l'application...")
    db.disconnect()

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="API de reconnaissance faciale pour la gestion des présences",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, spécifiez les domaines autorisés
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(students_router)
app.include_router(attendance_router)
app.include_router(professors_router)

# Root endpoint
@app.get("/")
async def root():
    """Point d'entrée principal"""
    return {
        "app": settings.app_name,
        "version": settings.app_version,
        "endpoints": {
            "health": "/api/health",
            "students": "/api/students",
            "attendance": "/api/attendance",
            "professors": "/api/professors",
            "docs": "/docs",
            "redoc": "/redoc"
        }
    }

# Health check
@app.get("/api/health")
async def health():
    """Vérification de l'état de l'API"""
    return {"status": "ok", "message": "API Backend Running"}

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": exc.detail}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "Erreur interne serveur"}
    )

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=5000,
        reload=settings.debug
    )
