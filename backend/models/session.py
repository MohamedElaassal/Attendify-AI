from models.database import db

class Session:
    """Modèle pour les sessions/cours"""
    
    @staticmethod
    def create(session_date, course_name, class_name):
        """Créer une nouvelle session"""
        query = """
            INSERT INTO sessions (session_date, course_name, class)
            VALUES (%s, %s, %s)
        """
        session_id = db.execute_query(query, (session_date, course_name, class_name))
        return session_id
    
    @staticmethod
    def get_by_id(session_id):
        """Récupérer une session par ID"""
        query = "SELECT * FROM sessions WHERE session_id = %s"
        return db.fetch_one(query, (session_id,))
    
    @staticmethod
    def get_all():
        """Récupérer toutes les sessions"""
        query = "SELECT * FROM sessions ORDER BY session_date DESC"
        return db.fetch_all(query)
    
    @staticmethod
    def get_by_class(class_name):
        """Récupérer les sessions d'une classe"""
        query = "SELECT * FROM sessions WHERE class = %s ORDER BY session_date DESC"
        return db.fetch_all(query, (class_name,))
    
    @staticmethod
    def get_by_date(session_date):
        """Récupérer les sessions d'une date"""
        query = "SELECT * FROM sessions WHERE session_date = %s"
        return db.fetch_all(query, (session_date,))

class Attendance:
    """Modèle pour les présences"""
    
    @staticmethod
    def create(session_id, student_id, status):
        """Enregistrer une présence"""
        query = """
            INSERT INTO attendance (session_id, student_id, status)
            VALUES (%s, %s, %s)
        """
        attendance_id = db.execute_query(query, (session_id, student_id, status))
        return attendance_id
    
    @staticmethod
    def get_by_session(session_id):
        """Récupérer les présences d'une session"""
        query = """
            SELECT a.*, s.student_name, s.email 
            FROM attendance a
            JOIN students s ON a.student_id = s.student_id
            WHERE a.session_id = %s
        """
        return db.fetch_all(query, (session_id,))
    
    @staticmethod
    def get_by_student(student_id):
        """Récupérer l'historique de présence d'un étudiant"""
        query = """
            SELECT a.*, s.session_date, s.course_name
            FROM attendance a
            JOIN sessions s ON a.session_id = s.session_id
            WHERE a.student_id = %s
            ORDER BY s.session_date DESC
        """
        return db.fetch_all(query, (student_id,))
    
    @staticmethod
    def update_status(attendance_id, status):
        """Mettre à jour le statut de présence"""
        query = "UPDATE attendance SET status = %s WHERE attendance_id = %s"
        db.execute_query(query, (status, attendance_id))
        return True
