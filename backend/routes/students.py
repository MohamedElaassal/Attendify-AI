from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import List, Optional
from pydantic import BaseModel
from models.student import Student
from models.database import db
from utils.face_recognition import face_engine
from utils.file_handler import validate_image_file
import json

router = APIRouter(prefix="/api/students", tags=["students"])

# Pydantic models for responses
class StudentResponse(BaseModel):
    student_id: int
    name: str
    class_name: Optional[str] = None
    email: str
    created_at: str
    
    class Config:
        from_attributes = True

class StudentsListResponse(BaseModel):
    success: bool
    students: List[dict]

class StudentDetailResponse(BaseModel):
    success: bool
    student: dict

class MessageResponse(BaseModel):
    success: bool
    message: str
    student_id: Optional[int] = None
    photos_analyzed: Optional[int] = None

@router.post("/register", response_model=MessageResponse, status_code=201)
async def register_student(
    name: str = Form(...),
    email: str = Form(...),
    class_name: str = Form(default="", alias="class"),
    photos: List[UploadFile] = File(...)
):
    """Enregistrer un nouvel étudiant avec photos"""
    try:
        if not photos or len(photos) == 0:
            raise HTTPException(status_code=400, detail="Au moins une photo est requise")
        
        # Extraire les embeddings de toutes les photos
        all_embeddings = []
        
        for photo in photos:
            img, message = await validate_image_file(photo)
            if img is None:
                raise HTTPException(status_code=400, detail=f"Photo {photo.filename}: {message}")
            
            # Extraire l'embedding directement depuis l'image en mémoire
            embedding, status = face_engine.extract_face_embedding_from_image(img)
            
            if embedding is None:
                raise HTTPException(status_code=400, detail=f"Photo {photo.filename}: {status}")
            
            all_embeddings.append(embedding.tolist())
        
        # Sauvegarder dans la base de données
        embeddings_data = {'embeddings': all_embeddings}
        student_id = Student.create(name, class_name, email, json.dumps(embeddings_data))
        
        return {
            "success": True,
            "message": "Étudiant enregistré avec succès",
            "student_id": student_id,
            "photos_analyzed": len(all_embeddings)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=StudentsListResponse)
async def get_all_students():
    """Récupérer tous les étudiants"""
    try:
        students = Student.get_all()
        
        # Formater les réponses (sans les embeddings pour économiser la bande passante)
        result = []
        for student in students:
            result.append({
                'student_id': student['student_id'],
                'name': student['student_name'],
                'class': student['class'],
                'email': student['email'],
                'created_at': str(student['created_at'])
            })
        
        return {"success": True, "students": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{student_id}", response_model=StudentDetailResponse)
async def get_student(student_id: int):
    """Récupérer les détails d'un étudiant"""
    try:
        student = Student.get_by_id(student_id)
        if not student:
            raise HTTPException(status_code=404, detail="Étudiant non trouvé")
        
        return {
            "success": True,
            "student": {
                'student_id': student['student_id'],
                'name': student['student_name'],
                'class': student['class'],
                'email': student['email'],
                'created_at': str(student['created_at'])
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{student_id}")
async def delete_student(student_id: int):
    """Supprimer un étudiant"""
    try:
        student = Student.get_by_id(student_id)
        if not student:
            raise HTTPException(status_code=404, detail="Étudiant non trouvé")
        
        Student.delete(student_id)
        return {"success": True, "message": "Étudiant supprimé"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/class/{class_name}", response_model=StudentsListResponse)
async def get_class_students(class_name: str):
    """Récupérer les étudiants d'une classe"""
    try:
        students = Student.get_by_class(class_name)
        
        result = []
        for s in students:
            result.append({
                'student_id': s['student_id'],
                'name': s['student_name'],
                'class': s['class'],
                'email': s['email'],
                'created_at': str(s['created_at'])
            })
        
        return {"success": True, "class": class_name, "students": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
