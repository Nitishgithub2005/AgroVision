import numpy as np
from PIL import Image
import io

def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """
    Preprocess image EXACTLY as in the working notebook
    IMPORTANT: Do NOT normalize by 255 - keep pixel values in 0-255 range
    
    Args:
        image_bytes: Raw image bytes
        
    Returns:
        Preprocessed image array ready for prediction
    """
    # Open image from bytes
    image = Image.open(io.BytesIO(image_bytes))
    
    # Convert to RGB if necessary
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Resize to 128x128 (same as training)
    image = image.resize((128, 128))
    
    # Convert to numpy array - KEEP IN 0-255 RANGE (DO NOT DIVIDE BY 255)
    image_array = np.array(image).astype('float32')
    
    # Add batch dimension
    image_array = np.expand_dims(image_array, axis=0)
    
    return image_array