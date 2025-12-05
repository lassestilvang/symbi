# Symbi

**Your Biometric Tamagotchi** — A Halloween-themed digital pet that reflects your real-world health through a cute, spooky ghost creature.

![Symbi Screenshot](assets/screenshot.jpeg)

## Features

- **Health-Responsive Ghost**: Your Symbi's mood changes based on your daily steps, sleep, and heart rate variability
- **Multiple Data Sources**: Connect to Apple HealthKit, Google Fit, or enter data manually
- **9 Emotional States**: From Sad to Vibrant, watch your ghost react to your wellness
- **Evolution System**: Maintain healthy habits and watch your Symbi evolve
- **8-Bit Pixel Art**: Retro-style ghost rendered in a classic Tamagotchi frame
- **Interactive Habitat**: Tap to trigger Halloween-themed particle effects
- **Achievement System**: Earn badges and track streaks
- **Customization Studio**: Personalize your Symbi with cosmetic items
- **Privacy-First**: All health data processed locally, works fully offline

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on specific platform
npm run ios      # iOS Simulator
npm run android  # Android Emulator
npm run web      # Web browser
```

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React Native | 0.81.5 | Mobile framework |
| Expo | 54.0.22 | Development platform |
| TypeScript | 5.9.2 | Type safety |
| React | 19.2.0 | UI library |
| Zustand | 5.0.8 | State management |
| React Navigation | 7.x | Screen navigation |
| Lottie | 7.3.4 | Animations |

## Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/        # Full-screen views
├── services/       # Business logic & APIs
├── stores/         # Zustand state stores
├── hooks/          # Custom React hooks
├── types/          # TypeScript definitions
├── constants/      # Theme & configuration
├── utils/          # Helper functions
└── assets/         # Images & animations
```

## Health Integration

| Platform | API | Min Version |
|----------|-----|-------------|
| iOS | HealthKit | iOS 14.0 |
| Android | Google Fit | API 26 |
| All | Manual Entry | — |

## Emotional States

Your Symbi displays different moods based on your health metrics:

| State | Trigger |
|-------|---------|
| 😢 Sad | Low activity (< 2,000 steps) |
| 😌 Resting | Moderate activity (2,000-8,000 steps) |
| 🎉 Active | High activity (> 8,000 steps) |
| ✨ Vibrant | Excellent overall health |
| 🧘 Calm | Good sleep + low stress |
| 😴 Tired | Poor sleep quality |
| 😰 Stressed | High HRV variability |
| 😟 Anxious | Elevated stress indicators |
| 😊 Rested | Great sleep recovery |

## Development

```bash
# Lint code
npm run lint

# Fix lint issues
npm run lint:fix

# Format code
npm run format

# Run tests
npm test

# Run all pre-submission checks
npm run pre-submit
```

## Privacy

Symbi is designed with privacy as a core principle:

- Health data is processed locally on your device
- No health data is sent to external servers
- Manual entry provides full functionality without health permissions
- Works completely offline
- No analytics on health metrics

## Documentation

Detailed documentation is available in the `/docs` folder:

- [App Architecture](docs/app-architecture.md)
- [Accessibility Compliance](docs/accessibility-compliance.md)
- [QA Testing Checklist](docs/qa-testing-checklist.md)
- [App Store Submission Guide](docs/app-store/submission-guide.md)

## License

MIT License — see [LICENSE](LICENSE) for details

---

Built with 👻 and 💜
