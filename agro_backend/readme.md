# Plant Disease Classification API

FastAPI backend for plant disease classification using a trained CNN model.

## Project Structure

```
agro_backend/
├── venv/
├── app/
│   ├── main.py              # FastAPI application
│   ├── predict.py           # Prediction logic
│   └── utils/
│       ├── model_loader.py  # Model loading utilities
│       └── preprocess.py    # Image preprocessing
├── models/
│   └── trained_model.keras  # Your trained model
├── requirements.txt
└── README.md
```

## Setup Instructions

### 1. Create Virtual Environment

```bash
python -m venv venv
```

### 2. Activate Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Place Your Model

Copy your trained model file to the `models/` directory:
- `trained_model.keras` or `trained_model.h5`

### 5. Run the API

```bash
cd app
python main.py
```

Or using uvicorn directly:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### 1. Root Endpoint
```
GET /
```
Returns API information and available endpoints.

### 2. Health Check
```
GET /health
```
Check if the API is running.

### 3. Model Information
```
GET /model-info
```
Get information about the loaded model.

### 4. Get Classes
```
GET /classes
```
Get all available plant disease classes (38 classes).

### 5. Predict Disease
```
POST /predict
```
Upload an image to predict the plant disease.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: Image file (JPEG, PNG)

**Response:**
```json
{
  "predicted_class": "Tomato___Late_blight",
  "confidence": 0.95,
  "top_3_predictions": [
    {
      "class": "Tomato___Late_blight",
      "confidence": 0.95
    },
    {
      "class": "Tomato___Early_blight",
      "confidence": 0.03
    },
    {
      "class": "Tomato___Bacterial_spot",
      "confidence": 0.01
    }
  ]
}
```

## Testing the API

### Using cURL

```bash
curl -X POST "http://localhost:8000/predict" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@path/to/your/image.jpg"
```

### Using Python

```python
import requests

url = "http://localhost:8000/predict"
files = {"file": open("plant_image.jpg", "rb")}
response = requests.post(url, files=files)
print(response.json())
```

### Using Postman

1. Create a new POST request to `http://localhost:8000/predict`
2. Go to Body tab
3. Select `form-data`
4. Add a key named `file` with type `File`
5. Select your image file
6. Send the request

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Notes

- The model expects 128x128 RGB images
- Images are automatically preprocessed to the correct format
- The API supports JPEG, PNG, and other common image formats
- Model is loaded once on startup for better performance

## Troubleshooting

### Model not found error
Make sure `trained_model.keras` or `trained_model.h5` is in the `models/` directory.

### Import errors
Ensure all dependencies are installed:
```bash
pip install -r requirements.txt
```

### Port already in use
Change the port in `main.py`:
```python
uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
```