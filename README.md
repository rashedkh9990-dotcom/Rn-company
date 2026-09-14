# Anisa AI Assistant - Computer Setup Guide

This guide explains how to set up and run **Anisa AI Assistant** on your Windows, Mac, or Linux computer.

---

## 📋 Requirements (প্রয়োজনীয় সফটওয়্যার)
1. **Node.js** (v18 or higher): Download from [https://nodejs.org/](https://nodejs.org/)
2. **Gemini API Key**: Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

---

## 🚀 Quick Setup on Windows (উইন্ডোজের জন্য সহজ পদ্ধতি)

### Method A: One-Click EXE Launcher (সবচেয়ে সহজ - `.exe` পদ্ধতি)
1. **`anisa-ai-assistant.exe`** ফাইলটিতে ডাবল ক্লিক করুন।
2. এটি স্বয়ংক্রিয়ভাবে Node.js চেক করবে (না থাকলে ব্রাউজারে লিংক খুলবে), প্যাকেজ ইনস্টল করবে এবং `.env` ফাইল তৈরি করবে।
3. `.env` ফাইলে আপনার Gemini API Key বসিয়ে সেভ করুন।
4. ব্রাউজারে স্বয়ংক্রিয়ভাবে [http://localhost:3000](http://localhost:3000) খুলে যাবে এবং আপনি অনীসার সাথে কথা বলা শুরু করতে পারবেন!

### Method B: Using Batch Files
1. **`setup.bat`** ফাইলে ডাবল-ক্লিক করুন।
2. `.env` ফাইলে আপনার Gemini API Key যোগ করুন।
3. **`start.bat`** ফাইলে ডাবল-ক্লিক করে অ্যাপ চালু করুন।

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
