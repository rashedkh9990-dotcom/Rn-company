# Anisa AI Assistant - Computer Setup Guide

This guide explains how to set up and run **Anisa AI Assistant** on your Windows, Mac, or Linux computer.

---

## 📋 Requirements (প্রয়োজনীয় সফটওয়্যার)
1. **Node.js** (v18 or higher): Download from [https://nodejs.org/](https://nodejs.org/)
2. **Gemini API Key**: Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

---

## 🚀 Quick Setup on Windows (উইন্ডোজের জন্য সহজ পদ্ধতি)

### Step 1: Download / Export the Project
- From Google AI Studio, click **Settings > Export as ZIP** and extract the folder on your computer.

### Step 2: Run Setup
- Double-click **`setup.bat`**.
- It will install all required packages and prepare the application.

### Step 3: Add Your Gemini API Key
- Open the `.env` file with Notepad or your code editor.
- Replace `MY_GEMINI_API_KEY` with your actual Gemini API key:
  ```env
  GEMINI_API_KEY=AIzaSy...your-actual-api-key
  ```
- Save the file (`Ctrl + S`).

### Step 4: Start Anisa!
- Double-click **`start.bat`**.
- Your web browser will automatically open [http://localhost:3000](http://localhost:3000).
- Click the center orb, allow microphone permission, and start talking!

---

## 🍏 Setup on macOS / Linux (ম্যাক ও লিনাক্সের জন্য পদ্ধতি)

Open your terminal in the project folder and run:

```bash
# 1. Make scripts executable
chmod +x setup.sh start.sh

# 2. Run automated setup
./setup.sh

# 3. Add your Gemini API key to .env
# Edit .env and paste your GEMINI_API_KEY

# 4. Start the application
./start.sh
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠 Manual Setup (Commands)

If you prefer using the command line:

```bash
# 1. Install dependencies
npm install

# 2. Setup environment variables
cp .env.example .env
# Add GEMINI_API_KEY in .env

# 3. Build frontend
npm run build

# 4. Start server
npm start
```

---

## 🎙 Microphone Permission Notice
When you first click the orb to connect:
- Your browser will ask for **Microphone permission**.
- Click **Allow** so Anisa can hear you in real-time.
