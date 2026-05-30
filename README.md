# DevSnippets AI

A beautiful, offline-first mobile application built with React Native and Expo for managing and understanding code snippets. Designed with a soft lavender aesthetic and powerful local-first capabilities.

## Features

- **Offline-First Storage**: All snippets are saved locally on your device using an embedded SQLite database.
- **AI Code Explainations**: Connect your Gemini or OpenAI API key to instantly generate step-by-step explanations and improvements for your saved code snippets.
- **File Manager**: Built-in file system explorer to manage exported templates, snippets, and attached screenshots.
- **Secure by Default**: API keys are encrypted and stored safely on-device using iOS Keychain / Android Keystore.
- **Export & Share**: Share your snippets instantly or export them locally as `.js`, `.json`, or `.txt` files.
- **Dark & Light Mode**: Seamless theme switching built right in.

## Tech Stack

- **Framework**: React Native with Expo SDK 55
- **Language**: TypeScript
- **Routing**: Expo Router (File-based routing)
- **Database**: `expo-sqlite`
- **File System**: `expo-file-system`
- **Security**: `expo-secure-store`
- **Storage**: `AsyncStorage`

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env` file in the root of the project and add your API keys (optional, you can also enter these securely inside the app settings):
   ```env
   EXPO_PUBLIC_GEMINI_KEY=your_gemini_key_here
   EXPO_PUBLIC_OPENAI_KEY=your_openai_key_here
   ```

3. **Start the development server**
   ```bash
   npx expo start -c
   ```

4. **Run the app**
   Scan the QR code shown in your terminal using the **Expo Go** app on your iOS or Android device.

## Screenshots & Theme

The app features a cohesive, rounded design system based on a soft lavender and dark navy palette, complete with subtle code-symbol background patterns and fluid micro-interactions.
