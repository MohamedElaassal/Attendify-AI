from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
from models.professor import Professor

router = APIRouter(prefix="/api/professors", tags=["professors"])

# Pydantic models
class ProfessorCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    department: Optional[str] = None
    subject: Optional[str] = None

class ProfessorUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    department: Optional[str] = None
    subject: Optional[str] = None
    is_active: Optional[bool] = None

class ProfessorLogin(BaseModel):
    email: EmailStr
    password: str

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

# Routes
@router.post("/register")
async def register_professor(data: ProfessorCreate):
    """Register a new professor (admin only)"""
    try:
        # Check if email already exists
        existing = Professor.get_by_email(data.email)
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        professor_id = Professor.create(
            name=data.name,
            email=data.email,
            password=data.password,
            department=data.department,
            subject=data.subject
        )
        
        return {
            "success": True,
            "message": "Professor registered successfully",
            "professor_id": professor_id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login")
async def login_professor(data: ProfessorLogin):
    """Professor login"""
    try:
        professor = Professor.authenticate(data.email, data.password)
        
        if not professor:
            raise HTTPException(status_code=401, detail="Invalid credentials or account disabled")
        
        return {
            "success": True,
            "message": "Login successful",
            "professor": professor
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def get_all_professors():
    """Get all professors"""
    try:
        professors = Professor.get_all()
        return {
            "success": True,
            "professors": professors or []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{professor_id}")
async def get_professor(professor_id: int):
    """Get professor by ID"""
    try:
        professor = Professor.get_by_id(professor_id)
        
        if not professor:
            raise HTTPException(status_code=404, detail="Professor not found")
        
        return {
            "success": True,
            "professor": professor
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{professor_id}")
async def update_professor(professor_id: int, data: ProfessorUpdate):
    """Update professor"""
    try:
        existing = Professor.get_by_id(professor_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Professor not found")
        
        Professor.update(
            professor_id=professor_id,
            name=data.name,
            email=data.email,
            department=data.department,
            subject=data.subject,
            is_active=data.is_active
        )
        
        return {
            "success": True,
            "message": "Professor updated successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{professor_id}")
async def delete_professor(professor_id: int):
    """Delete professor"""
    try:
        existing = Professor.get_by_id(professor_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Professor not found")
        
        Professor.delete(professor_id)
        
        return {
            "success": True,
            "message": "Professor deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{professor_id}/change-password")
async def change_password(professor_id: int, data: PasswordChange):
    """Change professor password"""
    try:
        professor = Professor.get_by_email_with_password(professor_id)
        if not professor:
            raise HTTPException(status_code=404, detail="Professor not found")
        
        # Verify current password
        prof_data = Professor.get_by_id(professor_id)
        full_prof = Professor.get_by_email(prof_data['email'])
        
        if not Professor.verify_password(data.current_password, full_prof['password_hash']):
            raise HTTPException(status_code=401, detail="Current password is incorrect")
        
        Professor.update_password(professor_id, data.new_password)
        
        return {
            "success": True,
            "message": "Password changed successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
