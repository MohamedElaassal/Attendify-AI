import cv2
import numpy as np
from config import get_settings
from fastapi import UploadFile

settings = get_settings()

async def validate_image_file(file: UploadFile):
    """Valider et charger une image en mémoire (async pour FastAPI)"""
    if not file or file.filename == '':
        return None, "Aucun fichier sélectionné"
    
    # Vérifier l'extension
    ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
    
    if ext not in settings.allowed_extensions:
        return None, f"Type de fichier non autorisé. Accepté: {', '.join(settings.allowed_extensions)}"
    
    try:
        # Lire l'image directement en mémoire
        file_data = await file.read()
        nparr = np.frombuffer(file_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return None, "Image invalide ou corrompue"
        
        # Reset file position for potential re-read
        await file.seek(0)
        
        return img, "Image chargée avec succès"
    except Exception as e:
        return None, f"Erreur de lecture: {str(e)}"

def validate_image_file_sync(file_data: bytes, filename: str):
    """Valider et charger une image en mémoire (sync version)"""
    if not file_data:
        return None, "Aucun fichier sélectionné"
    
    # Vérifier l'extension
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    
    if ext not in settings.allowed_extensions:
        return None, f"Type de fichier non autorisé. Accepté: {', '.join(settings.allowed_extensions)}"
    
    try:
        nparr = np.frombuffer(file_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return None, "Image invalide ou corrompue"
        
        return img, "Image chargée avec succès"
    except Exception as e:
        return None, f"Erreur de lecture: {str(e)}"
