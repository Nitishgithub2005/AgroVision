#!/usr/bin/env python
"""
Convert old TensorFlow 2.15 model to TensorFlow 2.20 compatible format
"""
import tensorflow as tf
import os

print(f"TensorFlow version: {tf.__version__}")

# Try to load the model with unsafe mode
try:
    print("Loading model with safe_mode=False...")
    model = tf.keras.models.load_model(
        "models/trained_model.keras",
        compile=False,  # Don't compile yet
        safe_mode=False  # Allow loading older format
    )
    print("✅ Model loaded successfully!")
    
    # Print model summary
    print("\nModel Summary:")
    model.summary()
    
    # Recompile with new optimizer
    print("\nRecompiling model with compatible optimizer...")
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.0001),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    # Save in new format
    print("\nSaving model in new format...")
    model.save("models/trained_model_v2.keras")
    print("✅ Model saved as 'trained_model_v2.keras'")
    
    # Test prediction
    print("\nTesting prediction...")
    import numpy as np
    test_input = np.random.random((1, 128, 128, 3)).astype('float32')
    prediction = model.predict(test_input, verbose=0)
    print(f"Test prediction shape: {prediction.shape}")
    print("✅ Model is working!")
    
    print("\n" + "="*60)
    print("SUCCESS! Your model has been converted.")
    print("Update model_loader.py to use 'trained_model_v2.keras'")
    print("="*60)

except Exception as e:
    print(f"\n❌ Error: {e}")
    print("\nTrying alternative method...")
    
    # Alternative: Load just the weights
    try:
        # Check if .h5 file exists
        if os.path.exists("models/trained_model.h5"):
            print("Found .h5 file, attempting to load...")
            model = tf.keras.models.load_model(
                "models/trained_model.h5",
                compile=False,
                safe_mode=False
            )
            model.compile(
                optimizer=tf.keras.optimizers.Adam(learning_rate=0.0001),
                loss='categorical_crossentropy',
                metrics=['accuracy']
            )
            model.save("models/trained_model_v2.keras")
            print("✅ Converted .h5 to new format!")
        else:
            print("No .h5 file found. Please provide the original training environment model.")
    except Exception as e2:
        print(f"❌ Alternative method also failed: {e2}")
        print("\nRECOMMENDATION: Retrain your model or provide a compatible model file.")