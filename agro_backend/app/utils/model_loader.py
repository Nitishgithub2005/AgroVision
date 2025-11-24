import tensorflow as tf
import os

MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "models", "trained_model.h5")

# Load the model once, reuse everywhere
model = None

def load_model():
    global model
    if model is None:
        print(f"Loading model from: {MODEL_PATH}")
        model = tf.keras.models.load_model(MODEL_PATH)
    return model