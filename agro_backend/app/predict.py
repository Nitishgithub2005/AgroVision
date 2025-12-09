import numpy as np
from PIL import Image
import io
from app.utils.model_loader import get_model, get_class_names
from app.utils.preprocess import preprocess_image

def predict_disease(image_bytes: bytes) -> dict:
    """
    Predict plant disease from image bytes
    
    Args:
        image_bytes: Raw image bytes
        
    Returns:
        Dictionary containing prediction results
    """
    # Load model and class names
    model = get_model()
    class_names = get_class_names()
    
    # Preprocess image (keeps pixel values in 0-255 range)
    processed_image = preprocess_image(image_bytes)
    
    # Make prediction
    predictions = model.predict(processed_image, verbose=0)
    
    # Get predicted class
    predicted_class_idx = np.argmax(predictions[0])
    confidence = float(predictions[0][predicted_class_idx])
    predicted_class = class_names[predicted_class_idx]
    
    # Get top 3 predictions
    top_3_idx = np.argsort(predictions[0])[-3:][::-1]
    top_3_predictions = [
        {
            "class": class_names[idx],
            "confidence": float(predictions[0][idx])
        }
        for idx in top_3_idx
    ]
    
    return {
        "predicted_class": predicted_class,
        "confidence": confidence,
        "top_3_predictions": top_3_predictions
    }