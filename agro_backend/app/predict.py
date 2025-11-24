# app/predict.py
from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
import numpy as np

from app.utils.model_loader import load_model
from app.utils.preprocess import preprocess_image

router = APIRouter()

# NOTE: keep this list empty or short while debugging.
# You must replace CLASS_NAMES with the real labels later.
CLASS_NAMES = ['Apple___Apple_scab',
 'Apple___Black_rot',
 'Apple___Cedar_apple_rust',
 'Apple___healthy',
 'Blueberry___healthy',
 'Cherry_(including_sour)___Powdery_mildew',
 'Cherry_(including_sour)___healthy',
 'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot',
 'Corn_(maize)___Common_rust_',
 'Corn_(maize)___Northern_Leaf_Blight',
 'Corn_(maize)___healthy',
 'Grape___Black_rot',
 'Grape___Esca_(Black_Measles)',
 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
 'Grape___healthy',
 'Orange___Haunglongbing_(Citrus_greening)',
 'Peach___Bacterial_spot',
 'Peach___healthy',
 'Pepper,_bell___Bacterial_spot',
 'Pepper,_bell___healthy',
 'Potato___Early_blight',
 'Potato___Late_blight',
 'Potato___healthy',
 'Raspberry___healthy',
 'Soybean___healthy',
 'Squash___Powdery_mildew',
 'Strawberry___Leaf_scorch',
 'Strawberry___healthy',
 'Tomato___Bacterial_spot',
 'Tomato___Early_blight',
 'Tomato___Late_blight',
 'Tomato___Leaf_Mold',
 'Tomato___Septoria_leaf_spot',
 'Tomato___Spider_mites Two-spotted_spider_mite',
 'Tomato___Target_Spot',
 'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
 'Tomato___Tomato_mosaic_virus',
 'Tomato___healthy']  # e.g. ["Tomato___Late_blight", "Tomato___Early_blight", ...]


def top_k_from_preds(preds: np.ndarray, k: int = 5):
    """
    preds: numpy array of shape (1, num_classes) or (num_classes,)
    returns list of (index, score) tuples sorted by score desc
    """
    arr = preds.flatten()
    idx = np.argsort(arr)[::-1][:k]
    return [(int(i), float(arr[i])) for i in idx]


@router.post("/predict")
async def predict_image(file: UploadFile = File(...)):
    try:
        # Read file bytes
        file_bytes = await file.read()

        # Preprocess
        img_array = preprocess_image(file_bytes)

        # Load model
        model = load_model()

        # Predict
        preds = model.predict(img_array)  # shape (1, num_classes)
        # safety: convert to numpy
        preds_arr = np.array(preds).flatten()

        # top-1
        class_idx = int(np.argmax(preds_arr))
        confidence = float(np.max(preds_arr))

        # top-k
        topk = top_k_from_preds(preds_arr, k=5)

        # human labels if provided
        class_name = None
        if CLASS_NAMES and class_idx < len(CLASS_NAMES):
            class_name = CLASS_NAMES[class_idx]

        return JSONResponse({
            "class_index": class_idx,
            "class_name": class_name,
            "confidence": confidence,
            "top_k": [{"index": i, "score": s, "label": (CLASS_NAMES[i] if CLASS_NAMES and i < len(CLASS_NAMES) else None)} for i, s in topk],
            "raw_preds_length": int(preds_arr.shape[0]),
        })

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)