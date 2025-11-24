import numpy as np
from PIL import Image
import io

def preprocess_image(image_bytes):
    # Your model was trained on 128x128 images, normalized to [0,1]
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((128, 128))  # IMPORTANT: match training
    img_arr = np.array(img).astype("float32") / 255.0  # IMPORTANT: match training
    img_arr = np.expand_dims(img_arr, axis=0)
    return img_arr