import cv2
import numpy as np
import json
import os
from config import get_settings

settings = get_settings()

# Désactiver CUDA pour forcer CPU (résoudre les problèmes ONNX)
os.environ['CUDA_VISIBLE_DEVICES'] = '-1'

# Import InsightFace avec gestion d'erreur
try:
    import insightface
    INSIGHTFACE_AVAILABLE = True
except ImportError:
    INSIGHTFACE_AVAILABLE = False
    print("⚠️ InsightFace non trouvé, installez-le avec: pip install insightface")

class FaceRecognitionEngine:
    """Moteur de reconnaissance faciale"""
    
    def __init__(self):
        self.model = None
        if INSIGHTFACE_AVAILABLE:
            self.initialize_model()
        else:
            print("❌ InsightFace non disponible")
    
    def initialize_model(self):
        """Initialiser le modèle InsightFace"""
        try:
            if not INSIGHTFACE_AVAILABLE:
                print("❌ InsightFace non disponible")
                return
            
            # Créer le modèle avec CPU uniquement
            self.model = insightface.app.FaceAnalysis(
                name=settings.face_detection_model,
                providers=['CPUExecutionProvider']  # Forcer CPU
            )
            self.model.prepare(ctx_id=-1)  # -1 pour CPU uniquement
            print(f"✅ Modèle {settings.face_detection_model} initialisé (CPU Mode)")
        except Exception as e:
            import traceback
            print(f"❌ Erreur initialisation modèle: {e}")
            print(traceback.format_exc())
            self.model = None
    
    def extract_face_embedding_from_image(self, img):
        """Extraire l'embedding du visage d'une image (numpy array)"""
        try:
            if self.model is None:
                return None, "Modèle IA non initialisé"
            
            faces = self.model.get(img)
            
            if len(faces) == 0:
                return None, "Aucun visage détecté"
            
            # Prendre le plus grand visage détecté
            face = max(faces, key=lambda f: (f.bbox[2]-f.bbox[0]) * (f.bbox[3]-f.bbox[1]))
            embedding = face.embedding
            
            return embedding, "Succès"
        except Exception as e:
            return None, f"Erreur: {str(e)}"
    
    def extract_face_embedding(self, image_path):
        """Extraire l'embedding du visage d'une image"""
        try:
            if self.model is None:
                return None, "Modèle IA non initialisé"
            
            img = cv2.imread(image_path)
            if img is None:
                return None, "Image non trouvée"
            
            faces = self.model.get(img)
            
            if len(faces) == 0:
                return None, "Aucun visage détecté"
            
            # Prendre le plus grand visage détecté
            face = max(faces, key=lambda f: (f.bbox[2]-f.bbox[0]) * (f.bbox[3]-f.bbox[1]))
            embedding = face.embedding
            
            return embedding, "Succès"
        except Exception as e:
            return None, f"Erreur: {str(e)}"
    
    def extract_multiple_embeddings(self, image_path):
        """Extraire les embeddings de tous les visages d'une image"""
        try:
            if self.model is None:
                return [], "Modèle IA non initialisé"
            
            img = cv2.imread(image_path)
            if img is None:
                return [], "Image non trouvée"
            
            faces = self.model.get(img)
            
            if len(faces) == 0:
                return [], "Aucun visage détecté"
            
            embeddings = [face.embedding for face in faces]
            return embeddings, f"{len(embeddings)} visage(s) détecté(s)"
        except Exception as e:
            return [], f"Erreur: {str(e)}"
    
    def extract_multiple_embeddings_from_image(self, img):
        """Extraire les embeddings de tous les visages d'une image (numpy array)"""
        try:
            if self.model is None:
                return [], "Modèle IA non initialisé"
            
            if img is None:
                return [], "Image non valide"
            
            faces = self.model.get(img)
            
            if len(faces) == 0:
                return [], "Aucun visage détecté"
            
            embeddings = [face.embedding for face in faces]
            return embeddings, f"{len(embeddings)} visage(s) détecté(s)"
        except Exception as e:
            return [], f"Erreur: {str(e)}"
    
    def compare_embeddings(self, embedding1, embedding2):
        """Comparer deux embeddings (similarité cosinus)"""
        from sklearn.metrics.pairwise import cosine_similarity
        
        # Normaliser les vecteurs
        emb1 = np.array(embedding1).reshape(1, -1)
        emb2 = np.array(embedding2).reshape(1, -1)
        
        # Calculer la similarité cosinus
        similarity = cosine_similarity(emb1, emb2)[0][0]
        return float(similarity)
    
    def find_student_by_embedding(self, embedding, students_data, threshold=None):
        """Trouver l'étudiant correspondant basé sur l'embedding"""
        best_match = None
        best_score = 0
        
        # Utiliser le seuil de config ou la valeur par défaut
        similarity_threshold = threshold or settings.face_similarity_threshold
        
        for student in students_data:
            if 'face_embeddings' not in student:
                continue
            
            try:
                stored_embeddings = json.loads(student['face_embeddings'])
                if isinstance(stored_embeddings, dict):
                    stored_embeddings = stored_embeddings.get('embeddings', [])
                
                for stored_emb in stored_embeddings:
                    similarity = self.compare_embeddings(embedding, stored_emb)
                    
                    if similarity > best_score:
                        best_score = similarity
                        best_match = student
            except:
                continue
        
        if best_score >= similarity_threshold:
            return best_match, best_score
        return None, best_score

# Instance globale
face_engine = FaceRecognitionEngine()
