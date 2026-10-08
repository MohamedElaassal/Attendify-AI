from models.database import db
import hashlib
import secrets

class Professor:
    """Model for professors"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password with salt"""
        salt = secrets.token_hex(16)
        hash_obj = hashlib.sha256((password + salt).encode())
        return f"{salt}:{hash_obj.hexdigest()}"
    
    @staticmethod
    def verify_password(password: str, password_hash: str) -> bool:
        """Verify password against hash"""
        try:
            salt, stored_hash = password_hash.split(':')
            hash_obj = hashlib.sha256((password + salt).encode())
            return hash_obj.hexdigest() == stored_hash
        except:
            return False
    
    @staticmethod
    def create(name: str, email: str, password: str, department: str = None, subject: str = None):
        """Create a new professor"""
        query = """
            INSERT INTO professors (professor_name, email, password_hash, department, subject)
            VALUES (%s, %s, %s, %s, %s)
        """
        password_hash = Professor.hash_password(password)
        professor_id = db.execute_query(query, (name, email, password_hash, department, subject))
        return professor_id
    
    @staticmethod
    def get_by_id(professor_id: int):
        """Get professor by ID"""
        query = "SELECT professor_id, professor_name, email, department, subject, is_active, created_at FROM professors WHERE professor_id = %s"
        return db.fetch_one(query, (professor_id,))
    
    @staticmethod
    def get_by_email(email: str):
        """Get professor by email (includes password for auth)"""
        query = "SELECT * FROM professors WHERE email = %s"
        return db.fetch_one(query, (email,))
    
    @staticmethod
    def get_all():
        """Get all professors"""
        query = "SELECT professor_id, professor_name, email, department, subject, is_active, created_at FROM professors"
        return db.fetch_all(query)
    
    @staticmethod
    def update(professor_id: int, name: str = None, email: str = None, 
               department: str = None, subject: str = None, is_active: bool = None):
        """Update professor"""
        updates = []
        params = []
        
        if name:
            updates.append("professor_name = %s")
            params.append(name)
        if email:
            updates.append("email = %s")
            params.append(email)
        if department is not None:
            updates.append("department = %s")
            params.append(department)
        if subject is not None:
            updates.append("subject = %s")
            params.append(subject)
        if is_active is not None:
            updates.append("is_active = %s")
            params.append(is_active)
        
        if not updates:
            return False
        
        params.append(professor_id)
        query = f"UPDATE professors SET {', '.join(updates)} WHERE professor_id = %s"
        db.execute_query(query, params)
        return True
    
    @staticmethod
    def update_password(professor_id: int, new_password: str):
        """Update professor password"""
        query = "UPDATE professors SET password_hash = %s WHERE professor_id = %s"
        password_hash = Professor.hash_password(new_password)
        db.execute_query(query, (password_hash, professor_id))
        return True
    
    @staticmethod
    def delete(professor_id: int):
        """Delete a professor"""
        query = "DELETE FROM professors WHERE professor_id = %s"
        db.execute_query(query, (professor_id,))
        return True
    
    @staticmethod
    def authenticate(email: str, password: str):
        """Authenticate professor"""
        professor = Professor.get_by_email(email)
        if professor and Professor.verify_password(password, professor['password_hash']):
            if not professor.get('is_active', True):
                return None
            return {
                'professor_id': professor['professor_id'],
                'professor_name': professor['professor_name'],
                'email': professor['email'],
                'department': professor['department'],
                'subject': professor['subject']
            }
        return None
