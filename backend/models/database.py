import mysql.connector
from mysql.connector import Error
from config import get_settings
from contextlib import contextmanager

settings = get_settings()

class Database:
    """Gestion de la connexion MySQL"""
    
    def __init__(self):
        self.connection = None
    
    def connect(self):
        """Établir la connexion MySQL"""
        try:
            self.connection = mysql.connector.connect(
                host=settings.mysql_host,
                user=settings.mysql_user,
                password=settings.mysql_password,
                database=settings.mysql_database,
                port=settings.mysql_port
            )
            if self.connection.is_connected():
                print("✅ Connexion MySQL établie")
                return True
        except Error as e:
            print(f"❌ Erreur de connexion MySQL: {e}")
            return False
    
    def disconnect(self):
        """Fermer la connexion MySQL"""
        if self.connection and self.connection.is_connected():
            self.connection.close()
            print("✅ Connexion MySQL fermée")
    
    def ensure_connection(self):
        """S'assurer que la connexion est active"""
        if not self.connection or not self.connection.is_connected():
            print("⚠️ Connexion perdue, reconnexion...")
            self.connect()
    
    @contextmanager
    def get_cursor(self, dictionary=False):
        """Context manager pour les cursors"""
        self.ensure_connection()
        cursor = self.connection.cursor(dictionary=dictionary)
        try:
            yield cursor
        finally:
            cursor.close()
    
    def execute_query(self, query, params=None):
        """Exécuter une requête (INSERT, UPDATE, DELETE)"""
        try:
            with self.get_cursor() as cursor:
                if params:
                    cursor.execute(query, params)
                else:
                    cursor.execute(query)
                self.connection.commit()
                return cursor.lastrowid
        except Exception as e:
            print(f"❌ Erreur d'exécution: {e}")
            return None
    
    def fetch_one(self, query, params=None):
        """Récupérer une ligne"""
        try:
            with self.get_cursor(dictionary=True) as cursor:
                if params:
                    cursor.execute(query, params)
                else:
                    cursor.execute(query)
                return cursor.fetchone()
        except Exception as e:
            print(f"❌ Erreur fetch_one: {e}")
            return None
    
    def fetch_all(self, query, params=None):
        """Récupérer toutes les lignes"""
        try:
            with self.get_cursor(dictionary=True) as cursor:
                if params:
                    cursor.execute(query, params)
                else:
                    cursor.execute(query)
                return cursor.fetchall()
        except Exception as e:
            print(f"❌ Erreur fetch_all: {e}")
            return []

# Instance globale
db = Database()
