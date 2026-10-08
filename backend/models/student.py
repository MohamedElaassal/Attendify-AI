from models.database import db
import json

class Student:
    """Modèle pour les étudiants"""
    
    @staticmethod
    def create(name, class_name, email, face_embeddings):
        """Créer un nouvel étudiant"""
        query = """
            INSERT INTO students (student_name, class, email, face_embeddings)
            VALUES (%s, %s, %s, %s)
        """
        # face_embeddings peut être une chaîne JSON ou un objet
        if isinstance(face_embeddings, str):
            embeddings_json = face_embeddings
        else:
            embeddings_json = json.dumps(face_embeddings)
        
        student_id = db.execute_query(query, (name, class_name, email, embeddings_json))
        return student_id
    
    @staticmethod
    def get_by_id(student_id):
        """Récupérer un étudiant par ID"""
        query = "SELECT * FROM students WHERE student_id = %s"
        return db.fetch_one(query, (student_id,))
    
    @staticmethod
    def get_all():
        """Récupérer tous les étudiants"""
        query = "SELECT * FROM students"
        return db.fetch_all(query)
    
    @staticmethod
    def get_by_class(class_name):
        """Récupérer tous les étudiants d'une classe"""
        query = "SELECT * FROM students WHERE class = %s"
        return db.fetch_all(query, (class_name,))
    
    @staticmethod
    def update(student_id, name=None, class_name=None, email=None, face_embeddings=None):
        """Mettre à jour un étudiant"""
        updates = []
        params = []
        
        if name:
            updates.append("student_name = %s")
            params.append(name)
        if class_name:
            updates.append("class = %s")
            params.append(class_name)
        if email:
            updates.append("email = %s")
            params.append(email)
        if face_embeddings is not None:
            updates.append("face_embeddings = %s")
            embeddings_json = json.dumps(face_embeddings.tolist())
            params.append(embeddings_json)
        
        if not updates:
            return False
        
        params.append(student_id)
        query = f"UPDATE students SET {', '.join(updates)} WHERE student_id = %s"
        db.execute_query(query, params)
        return True
    
    @staticmethod
    def delete(student_id):
        """Supprimer un étudiant"""
        query = "DELETE FROM students WHERE student_id = %s"
        db.execute_query(query, (student_id,))
        return True
