import tensorflow as tf
import os
import json
from pathlib import Path
from tensorflow.keras.layers import Dense, Conv2D, MaxPool2D, Flatten, Dropout
from tensorflow.keras.models import Sequential

# Global model instance
_model = None
_class_names = None

def create_model_architecture():
    """
    Recreate the exact model architecture from training
    This avoids TensorFlow version compatibility issues
    """
    model = Sequential()
    
    # Building Convolution Layer (exact copy from training code)
    model.add(Conv2D(filters=32, kernel_size=3, padding='same', activation='relu', input_shape=[128, 128, 3]))
    model.add(Conv2D(filters=32, kernel_size=3, activation='relu'))
    model.add(MaxPool2D(pool_size=2, strides=2))
    
    model.add(Conv2D(filters=64, kernel_size=3, padding='same', activation='relu'))
    model.add(Conv2D(filters=64, kernel_size=3, activation='relu'))
    model.add(MaxPool2D(pool_size=2, strides=2))
    
    model.add(Conv2D(filters=128, kernel_size=3, padding='same', activation='relu'))
    model.add(Conv2D(filters=128, kernel_size=3, activation='relu'))
    model.add(MaxPool2D(pool_size=2, strides=2))
    
    model.add(Conv2D(filters=256, kernel_size=3, padding='same', activation='relu'))
    model.add(Conv2D(filters=256, kernel_size=3, activation='relu'))
    model.add(MaxPool2D(pool_size=2, strides=2))
    
    model.add(Conv2D(filters=512, kernel_size=3, padding='same', activation='relu'))
    model.add(Conv2D(filters=512, kernel_size=3, activation='relu'))
    model.add(MaxPool2D(pool_size=2, strides=2))
    
    model.add(Dropout(0.25))
    model.add(Flatten())
    model.add(Dense(units=1500, activation='relu'))
    model.add(Dropout(0.4))
    model.add(Dense(units=38, activation='softmax'))
    
    return model

def get_model():
    """
    Load and return the trained model (singleton pattern)
    """
    global _model
    
    if _model is None:
        model_path = Path("models/trained_model.h5")
        
        if not model_path.exists():
            raise FileNotFoundError(
                "Model file not found. Please place trained_model.h5 in the models/ directory"
            )
        
        print(f"Loading model from {model_path}...")
        
        try:
            # Try loading the full model first
            _model = tf.keras.models.load_model(str(model_path), compile=False)
            print("✅ Loaded full model")
        except Exception as e:
            print(f"⚠️ Could not load full model: {e}")
            print("Rebuilding architecture and loading weights...")
            
            # If that fails, rebuild architecture and load weights
            _model = create_model_architecture()
            _model.load_weights(str(model_path))
            print("✅ Loaded model weights into rebuilt architecture")
        
        # Compile the model
        _model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=0.0001),
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        print(f"Model loaded successfully!")
    
    return _model

def get_class_names():
    """
    Get class names for the model (in exact order from training)
    """
    global _class_names
    
    if _class_names is None:
        class_names_path = Path("models/class_names.json")
        
        if class_names_path.exists():
            with open(class_names_path, 'r') as f:
                _class_names = json.load(f)
        else:
            # Exact class names from your reference code
            _class_names = [
                'Apple___Apple_scab',
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
                'Tomato___healthy'
            ]
    
    return _class_names