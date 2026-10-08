from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import List, Optional
from pydantic import BaseModel
from models.student import Student
from models.session import Session, Attendance
from utils.face_recognition import face_engine
from utils.file_handler import validate_image_file
from datetime import datetime
import json

router = APIRouter(prefix="/api/attendance", tags=["attendance"])

# Pydantic models for responses
class PresentStudent(BaseModel):
    student_id: int
    name: str
    status: str
    confidence: float

class AbsentStudent(BaseModel):
    student_id: int
    name: str
    status: str

class VerifyAttendanceResponse(BaseModel):
    success: bool
    message: str
    session_id: int
    total_students: int
    present: int
    absent: int
    present_students: List[dict]
    absent_students: List[dict]

@router.post("/verify", status_code=201)
async def verify_attendance(
    session_date: str = Form(...),
    course_name: str = Form(...),
    class_name: str = Form(default="", alias="class"),
    group_photo: UploadFile = File(...)
):
    """Vérifier la présence avec une photo de groupe"""
    try:
        # Charger l'image en mémoire
        img, message = await validate_image_file(group_photo)
        if img is None:
            raise HTTPException(status_code=400, detail=message)
        
        # Extraire tous les embeddings de la photo de groupe
        embeddings, message = face_engine.extract_multiple_embeddings_from_image(img)
        
        if len(embeddings) == 0:
            raise HTTPException(status_code=400, detail=message)
        
        # Créer la session
        try:
            session_id = Session.create(session_date, course_name, class_name)
            
            if session_id is None:
                raise HTTPException(status_code=500, detail="Erreur lors de la création de la session")
        except Exception as e:
            print(f"❌ Erreur Session.create: {str(e)}")
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Erreur session: {str(e)}")
        
        # Récupérer tous les étudiants (ou seulement ceux de la classe)
        if class_name:
            students = Student.get_by_class(class_name)
        else:
            students = Student.get_all()
        
        # Vérifier qu'on a des étudiants
        if not students or len(students) == 0:
            raise HTTPException(status_code=400, detail="Aucun étudiant enregistré dans le système")
        
        # Comparer les visages détectés avec les étudiants enregistrés
        attendance_results = []
        detected_students = set()
        
        for embedding in embeddings:
            student, confidence = face_engine.find_student_by_embedding(embedding, students)
            
            if student:
                detected_students.add(student['student_id'])
                attendance_results.append({
                    'student_id': student['student_id'],
                    'name': student['student_name'],
                    'status': 'present',
                    'confidence': float(confidence)
                })
        
        # Enregistrer les présences
        for student in students:
            status = 'present' if student['student_id'] in detected_students else 'absent'
            Attendance.create(session_id, student['student_id'], status)
        
        # Marquer les absents
        absent_students = []
        for student in students:
            if student['student_id'] not in detected_students:
                absent_students.append({
                    'student_id': student['student_id'],
                    'name': student['student_name'],
                    'status': 'absent'
                })
        
        return {
            'success': True,
            'message': 'Présence vérifiée avec succès',
            'session_id': session_id,
            'total_students': len(students),
            'present': len(attendance_results),
            'absent': len(absent_students),
            'present_students': attendance_results,
            'absent_students': absent_students
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erreur détaillée: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@router.get("/session/{session_id}")
async def get_session_attendance(session_id: int):
    """Récupérer les résultats de présence d'une session"""
    try:
        session = Session.get_by_id(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session non trouvée")
        
        attendance_records = Attendance.get_by_session(session_id)
        
        present = [r for r in attendance_records if r['status'] == 'present']
        absent = [r for r in attendance_records if r['status'] == 'absent']
        
        return {
            'success': True,
            'session': {
                'session_id': session['session_id'],
                'date': str(session['session_date']),
                'course': session['course_name'],
                'class': session['class']
            },
            'total': len(attendance_records),
            'present_count': len(present),
            'absent_count': len(absent),
            'present_students': [{'student_id': p['student_id'], 'name': p['student_name'], 'email': p['email']} for p in present],
            'absent_students': [{'student_id': a['student_id'], 'name': a['student_name'], 'email': a['email']} for a in absent]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/student/{student_id}")
async def get_student_attendance(student_id: int):
    """Récupérer l'historique de présence d'un étudiant"""
    try:
        student = Student.get_by_id(student_id)
        if not student:
            raise HTTPException(status_code=404, detail="Étudiant non trouvé")
        
        records = Attendance.get_by_student(student_id)
        
        return {
            'success': True,
            'student': {
                'student_id': student['student_id'],
                'name': student['student_name'],
                'email': student['email']
            },
            'attendance_history': records,
            'total_sessions': len(records),
            'present_count': len([r for r in records if r['status'] == 'present']),
            'absent_count': len([r for r in records if r['status'] == 'absent'])
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions")
async def get_all_sessions():
    """Récupérer toutes les sessions"""
    try:
        sessions = Session.get_all()
        return {
            'success': True,
            'sessions': sessions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
