# Recallo Mobile 🎤

Recallo Mobile is a voice-based question answering app built with React Native and Expo. Users answer a series of questions by speaking into their device, swipe through questions, and receive instant grades and feedback.

## Features

- 🗣️ **Voice Recording**: Hold-to-record mic button for answering questions
- 💬 **Speech Bubble UI**: Questions displayed in elegant speech bubbles
- 👆 **Swipe Navigation**: Smooth horizontal swiping between questions
- 📊 **Instant Grading**: Get grades (A-F) for each answer
- 💡 **Detailed Feedback**: Tap any question to view detailed feedback
- 🎨 **Dark Mode Support**: Automatic theme switching

## Tech Stack

- React Native
- Expo Router (file-based routing)
- TypeScript
- Expo Haptics for tactile feedback
- React Native Reanimated for smooth animations

## Project Structure

```
app/
  (tabs)/
    index.tsx          # Main Recallo app screen with dashboard
components/
  login-screen.tsx     # Login and registration UI
  auth-initializer.tsx # Authentication state initialization
  daily-questions-widget.tsx  # Dashboard widget for daily questions
  speech-bubble.tsx    # Question display component
  mic-button.tsx       # Voice recording button
  question-swiper.tsx  # Swipeable question interface
  results-screen.tsx   # Results and grades display
  feedback-detail.tsx  # Detailed feedback view
stores/
  auth-store.ts        # Authentication state management
hooks/
  use-auth.ts          # Authentication hook
data/
  mock-data.ts         # Mock questions and results
types/
  question.ts          # TypeScript interfaces
  auth.ts              # Authentication types
```

## How It Works

1. **Welcome Screen**: Start a new session
2. **Question Flow**: 
   - View question in speech bubble
   - Hold mic button to record answer
   - Release to stop recording
   - Swipe left for next question
3. **Results**: View all grades at once
4. **Feedback**: Tap any question for detailed feedback

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## Future Enhancements

- [ ] Actual audio recording with expo-av
- [ ] Integration with LLM API for real evaluation
- [ ] Speech-to-text transcription
- [ ] Question categories and difficulty levels
- [ ] Progress tracking and history
- [ ] Custom question sets

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

