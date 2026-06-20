# Patient Care Assistant

A full-stack healthcare application designed to assist nurses and caregivers in managing patient repositioning routines and care tracking. The application enables nurses to add and manage patient records, monitor repositioning schedules, record completed position changes, and maintain patient care logs. Its primary goal is to help prevent pressure ulcers in immobile patients by ensuring timely repositioning and proper documentation of caregiving activities.

## 🚀 Features

- **Staff Authentication**: Secure login and registration for healthcare staff/nurses.
- **Patient Management**: Add and manage patient profiles, including details like age, department, and bed assignment.
- **Position Change Tracking**: Record every time an immobile patient is moved to a new resting position (e.g., Left Side, Right Side, Back).
- **Proactive Alerts**: In-app notifications to alert nurses when a patient has exceeded the maximum safe time limit in a single position, mitigating the risk of bedsores.
- **Arabic Localization**: Fully localized in Arabic to fit regional hospital environments.

## 🛠 Tech Stack

### Backend
- **Framework**: .NET 8 Minimal API
- **Database**: Entity Framework Core (using SQL Server/LocalDB)
- **Authentication**: JWT Bearer Tokens

### Mobile Application
- **Framework**: React Native with Expo (SDK 54)
- **Navigation**: React Navigation v7 (Native Stack)
- **Styling**: Vanilla React Native Stylesheets
- **HTTP Client**: Axios
  
## 📱 Mobile App (Ready to Use)

You can use the application immediately without running any backend or development tools.
### 📥  Download APK
The pre-built Android APK is available in this repository:
[/APK/PatientCareAssistant.apk](https://github.com/mohamedfayad99/Healthcare/tree/main/APK)

### ⚠️ Requirements
- **Android device only**
- **Enable “Install from unknown sources”**
- **No backend setup required (standalone build)**

## 👨‍💻 Getting Started (For Developers)

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/)
- [Expo Go App](https://expo.dev/client) installed on your mobile device (or an Android/iOS emulator)

### 1. Run the Backend (API)
```bash
cd Backend/Healthcare.Api
dotnet run
```
The API will start running (usually on `http://localhost:5248` or `https://localhost:7112`). *Make sure to update the API base URL in the Mobile App if it differs*.

### 2. Run the Mobile App
```bash
cd MobileApp
npm install
npx expo start
```
Scan the generated QR code with **Expo Go** (Android) or your **Camera App** (iOS) to launch the app on your device.
## 🎯 Project Goal
Patient Care Assistant was developed as a healthcare-focused academic project to support nurses in monitoring and documenting patient repositioning activities. The application aims to improve patient safety, simplify daily caregiving tasks, and help reduce the risk of pressure ulcers through timely reminders and accurate care records.

## 📄 License
This project is for educational and healthcare demonstration purposes.
