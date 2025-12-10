# 🌿 AgroVision – AI-powered Plant Disease Detection & Farming Assistant  
A mobile-first AI system that detects plant diseases using a custom-trained CNN model, provides multilingual treatment recommendations, offers an AI-powered agricultural chatbot, and includes a smart yield estimator for farmers.

---

## 📌 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [CNN Model Details](#cnn-model-details)
- [Mobile App Features](#mobile-app-features)
- [Installation & Setup](#installation--setup)
  - [Backend Setup (FastAPI)](#backend-setup-fastapi)
  - [Mobile App Setup (React Native)](#mobile-app-setup-react-native)
- [API Endpoints](#api-endpoints)
- [Project Screenshots](#project-screenshots)
- [Results](#results)
- [Contributors](#contributors)
- [License](#license)

---

## 🌱 Overview
AgroVision is a complete AI-powered agricultural decision-support system.  
It combines:
- Convolutional Neural Networks (CNN) for plant disease classification  
- A multilingual agricultural chatbot  
- AI-based treatment recommendations  
- AI yield prediction (Gemini API)  
- A farmer-friendly mobile app (React Native)

The system aims to provide **early disease detection**, **accessible farming knowledge**, and **real-time insights** to empower farmers, especially in rural regions.

---

## ⭐ Features

### 🔍 1. Plant Disease Detection
- Custom Deep CNN (VGG-style architecture)
- Trained on **38,585 images** across **21 classes**
- Achieved **95.56% validation accuracy**
- Displays disease name + confidence score

### 💬 2. Multilingual Chatbot (AI + Gemini API)
Supports **English, Kannada, Hindi, Telugu, Tamil**  
Provides:
- Crop troubleshooting  
- Weather guidance  
- Fertilizer & pesticide help  
- General agricultural Q&A  

### 🧪 3. Treatment Recommendation (AI-based)
Generates:
- Disease overview  
- Organic/chemical treatments  
- Prevention methods  
- Multi-language explanation  

### 📊 4. AI Yield Estimator
Inputs:
- Crop  
- Soil  
- Irrigation  
- Land area  
- Season & region  

Outputs:
- Estimated yield  
- Production value  
- Suggested improvements  
- Risk factors  

### 📱 5. Mobile App (React Native)
Includes:
- Dashboard  
- Plant scanner  
- Chatbot  
- Yield estimation module  
- Multilingual support  

---

## 🧩 System Architecture

[Add architecture diagram here manually]

---

## 🔧 Tech Stack

### **Machine Learning / Deep Learning**
- TensorFlow  
- Keras  
- NumPy  
- Pandas  
- Matplotlib  
- Seaborn  
- Scikit-learn  

### **Backend**
- FastAPI  
- Uvicorn  
- Python 3.10  
- Pillow  

### **Mobile Application**
- React Native  
- Axios  
- React Navigation  
- React Native Paper  
- Image Picker  
- Async Storage  

### **AI Services**
- Google Gemini API (text generation, translation, treatment suggestions)

---

## 🧠 CNN Model Details

- Image size: **128 × 128 × 3**
- Architecture:
  - **5 Convolutional Blocks**
  - Each block: Conv2D → ReLU → Conv2D → ReLU → MaxPooling
  - **Rescaling layer** (1./255)
  - **Data Augmentation:** RandomFlip, RandomRotation(0.2)
  - Dense layer: 1500 units  
  - Output layer: 21 classes (Softmax)
- Training:
  - Epochs: **25**
  - Batch size: **32**
  - Optimizer: Adam (LR = 0.0001)
  - Loss: Categorical Crossentropy

---

## 📱 Mobile App Features

- Camera / gallery image input  
- Sends image to FastAPI backend  
- Displays disease with confidence  
- Multilingual translation  
- Chatbot for agriculture support  
- Yield estimation using Gemini  
- Clean and intuitive UI  

---

## ⚙️ Installation & Setup

---

## 🖥️ Backend Setup (FastAPI)

### 1. Clone the repository
git clone https://github.com/your-username/your-repo-name.git  
cd agro_backend

### 2. Create & activate environment
conda create -n agro_env python=3.10  
conda activate agro_env

### 3. Install dependencies
pip install -r requirements.txt

### 4. Run the backend server
uvicorn app.main:app --host 0.0.0.0 --port 3030 --reload

---

## 📱 Mobile App Setup (React Native)

### 1. Navigate to project
cd AgroVision

### 2. Install packages
npm install

### 3. Start bundler
npm start

### 4. Run app (Android)
npx react-native run-android

> Note: Update local IP inside `ScanScreen.tsx` to point to your backend.

---

## 🔗 API Endpoints

| Endpoint | Method | Description |
|---------|--------|-------------|
| `/api/v1/predict` | POST | Predict plant disease |
| `/api/v1/chat` | POST | Multilingual chatbot |
| `/api/v1/translate` | POST | Language translation |
| `/health` | GET | Backend health check |

---

## 🖼️ Project Screenshots

(Insert images manually)  
<img width="200" height="400" alt="image" src="https://github.com/user-attachments/assets/d478114d-8929-4e7e-bf7b-fc809a719aed" />

- Home Screen  
- Plant Scanner  
- Prediction Output  
- Chatbot  
- Yield Estimator  

---

## 📊 Results

- **Accuracy:** 95.56%  
- **Precision (macro):** 95.83%  
- **Recall (macro):** 95.58%  
- **Top-3 Accuracy:** 99.81%

Outputs saved:
- Confusion matrix  
- Per-class performance  
- Grad-CAM heatmaps  
- Accuracy/loss curves  

---

## 👨‍💻 Contributors

- **Nitish R** – ML, Backend, App Development, UI/UX

---

## 📄 License
MIT License  
