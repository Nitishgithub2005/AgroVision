from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from app.predict import predict_disease
from app.utils.model_loader import get_model, get_class_names
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Plant Disease Classification API",
    description="API for predicting plant diseases using CNN model",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model on startup
@app.on_event("startup")
async def startup_event():
    logger.info("Loading model...")
    try:
        get_model()
        logger.info("Model loaded successfully!")
    except Exception as e:
        logger.error(f"Failed to load model: {str(e)}")
        raise

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Plant Disease Classification API",
        "status": "active",
        "endpoints": {
            "predict": "/predict",
            "model_info": "/model-info",
            "classes": "/classes",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.get("/model-info")
async def model_info():
    """Get model information"""
    try:
        model = get_model()
        return {
            "model_type": "CNN",
            "input_shape": [128, 128, 3],
            "input_range": "0-255 (NOT normalized)",
            "total_classes": 21,
            "framework": "TensorFlow/Keras"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting model info: {str(e)}")

@app.get("/classes")
async def get_classes():
    """Get all available plant disease classes"""
    try:
        class_names = get_class_names()
        return {
            "total_classes": len(class_names),
            "classes": class_names
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting classes: {str(e)}")

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Predict plant disease from uploaded image
    
    Parameters:
    - file: Image file (JPEG, PNG)
    
    Returns:
    - predicted_class: Name of the predicted disease
    - confidence: Confidence score
    - top_3_predictions: Top 3 predictions with confidence scores
    """
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400, 
            detail="File must be an image (JPEG, PNG, etc.)"
        )
    
    try:
        # Read image file
        image_bytes = await file.read()
        
        # Get prediction
        result = predict_disease(image_bytes)
        
        return JSONResponse(content=result)
    
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=3030, reload=True)