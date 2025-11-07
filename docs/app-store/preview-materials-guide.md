# App Store Preview Materials Guide

This guide provides specifications and instructions for creating all visual assets needed for App Store and Google Play Store submissions.

## Table of Contents

1. [App Icon](#app-icon)
2. [Screenshots](#screenshots)
3. [Feature Graphic (Android)](#feature-graphic-android)
4. [Preview Video](#preview-video)
5. [Promotional Graphics](#promotional-graphics)
6. [Release Notes](#release-notes)

---

## App Icon

### Specifications

**iOS App Store**
- Size: 1024 x 1024 pixels
- Format: PNG (no transparency)
- Color Space: RGB
- No rounded corners (iOS applies them automatically)

**Google Play Store**
- Size: 512 x 512 pixels
- Format: PNG (32-bit with transparency)
- Color Space: RGB

**Android Adaptive Icon**
- Foreground: 108 x 108 dp (432 x 432 pixels at xxxhdpi)
- Background: 108 x 108 dp (432 x 432 pixels at xxxhdpi)
- Safe zone: 66 x 66 dp (264 x 264 pixels at xxxhdpi)

### Design Guidelines

**Visual Elements:**
- Symbi ghost character as the central element
- Purple gradient background (#7C3AED to #9333EA)
- Halloween-themed but cute aesthetic
- Simple, recognizable at small sizes
- No text or UI elements

**Design Concept:**
```
┌─────────────────────────┐
│                         │
│    Purple Gradient      │
│    Background           │
│                         │
│       👻 Symbi          │
│    (Ghost Character)    │
│                         │
│   Cute + Spooky         │
│   Purple Glow           │
│                         │
└─────────────────────────┘
```

**Key Features:**
- Symbi ghost in center
- Expressive eyes (bright, friendly)
- Slight dripping effect on edges
- Ethereal glow around character
- Purple color palette
- Rounded, friendly shapes

### Tools

**Recommended Design Tools:**
- Figma (free, web-based)
- Adobe Illustrator
- Sketch
- Affinity Designer

**Icon Generators:**
- [App Icon Generator](https://appicon.co/)
- [MakeAppIcon](https://makeappicon.com/)
- [Icon Kitchen](https://icon.kitchen/)

### File Locations

```
assets/
  icon.png              # 1024x1024 for iOS
  adaptive-icon.png     # 432x432 for Android foreground
  favicon.png           # 48x48 for web
```

---

## Screenshots

### iOS Screenshots

#### Required Sizes

**iPhone 6.7" Display** (iPhone 14 Pro Max, 15 Pro Max)
- Size: 1290 x 2796 pixels
- Quantity: 3-10 screenshots
- Priority: High (most users)

**iPhone 6.5" Display** (iPhone 11 Pro Max, XS Max)
- Size: 1242 x 2688 pixels
- Quantity: 3-10 screenshots
- Priority: High

**iPhone 5.5" Display** (iPhone 8 Plus)
- Size: 1242 x 2208 pixels
- Quantity: 3-10 screenshots
- Priority: Medium (optional)

**iPad Pro 12.9" Display**
- Size: 2048 x 2732 pixels
- Quantity: 3-10 screenshots
- Priority: Low (optional, if supporting iPad)

#### Screenshot Content

**Screenshot 1: Main Screen - "Meet Your Health Companion"**
- Show: Symbi in Active state with step count display
- Highlight: Main animation, step counter, emotional state label
- Caption: "Meet Your Health Companion"
- Background: Clean, minimal UI

**Screenshot 2: Emotional States - "Your Symbi Reflects Your Wellness"**
- Show: 3-4 different emotional states side by side
- Highlight: Sad, Resting, Active, Vibrant states
- Caption: "Your Symbi Reflects Your Wellness"
- Layout: Grid or carousel view

**Screenshot 3: Health Integration - "Seamlessly Connects to Apple Health"**
- Show: Apple Health permission screen or data sync view
- Highlight: Health data types (steps, sleep, HRV)
- Caption: "Seamlessly Connects to Apple Health"
- Include: Privacy badge or lock icon

**Screenshot 4: Customization - "Customize to Your Fitness Level"**
- Show: Threshold configuration screen
- Highlight: Adjustable sliders or input fields
- Caption: "Customize to Your Fitness Level"
- Show: Before/after threshold values

**Screenshot 5: Evolution - "Watch Your Symbi Evolve"**
- Show: Evolution celebration or gallery view
- Highlight: Multiple evolution forms
- Caption: "Watch Your Symbi Evolve"
- Include: Progress indicator (30 days)

**Screenshot 6: Privacy - "Your Data, Your Control"** (Optional)
- Show: Privacy settings or manual entry mode
- Highlight: Data export, deletion options
- Caption: "Your Data, Your Control"
- Include: Privacy policy link

### Android Screenshots

#### Required Sizes

**Phone Screenshots**
- Minimum: 2 screenshots
- Recommended: 4-8 screenshots
- Aspect Ratio: 16:9 or 9:16
- Recommended Size: 1080 x 1920 pixels (portrait)
- Format: PNG or JPEG

**Tablet Screenshots** (Optional)
- 7-inch: 1200 x 1920 pixels
- 10-inch: 1600 x 2560 pixels

#### Screenshot Content

Use the same content as iOS screenshots, adapted for Android:
- Replace "Apple Health" with "Google Fit" or "Health Connect"
- Use Android UI patterns (Material Design)
- Show Android-specific features if any

### Screenshot Design Tips

**Best Practices:**
1. Use device frames (optional but recommended)
2. Add captions/text overlays for clarity
3. Show real app content, not mockups
4. Use consistent branding and colors
5. Highlight key features in each screenshot
6. Keep text readable at small sizes
7. Use high contrast for visibility

**Tools for Creating Screenshots:**
- [Figma](https://figma.com) - Design and mockups
- [Previewed](https://previewed.app) - Device mockups
- [Shotbot](https://shotbot.io) - Automated screenshots
- [Screenshot Creator](https://www.applaunchpad.com) - Templates

**Device Frames:**
- [Facebook Design Resources](https://facebook.design/devices)
- [Mockuphone](https://mockuphone.com)
- [Screely](https://screely.com)

### File Organization

```
docs/app-store/screenshots/
  ios/
    6.7-inch/
      01-main-screen.png
      02-emotional-states.png
      03-health-integration.png
      04-customization.png
      05-evolution.png
    6.5-inch/
      [same as above, resized]
  android/
    phone/
      01-main-screen.png
      02-emotional-states.png
      03-health-integration.png
      04-customization.png
      05-evolution.png
```

---

## Feature Graphic (Android)

### Specifications

- Size: 1024 x 500 pixels
- Format: PNG or JPEG
- File size: Max 1MB
- Required for: Google Play Store

### Design Guidelines

**Content:**
- Symbi character (prominent)
- App name: "Symbi"
- Tagline: "Your Health Companion" or "Transform Your Wellness Journey"
- Purple gradient background
- Halloween-themed elements (subtle)

**Layout:**
```
┌────────────────────────────────────────────────┐
│                                                │
│  [Symbi Ghost]    SYMBI                       │
│                   Your Health Companion        │
│                                                │
└────────────────────────────────────────────────┘
```

**Design Tips:**
- Keep text large and readable
- Use high contrast
- Avoid clutter
- Test at different sizes
- No screenshots or device frames

### Tools

- Figma template: [Feature Graphic Template](https://www.figma.com/community/file/feature-graphic-template)
- Canva: Pre-made templates
- Adobe Photoshop: Custom design

---

## Preview Video

### Specifications

**iOS App Preview**
- Duration: 15-30 seconds
- Format: .mov, .m4v, or .mp4
- Resolution: Match screenshot dimensions
- Orientation: Portrait
- File size: Max 500MB
- Codec: H.264 or HEVC

**Google Play Promo Video**
- Duration: 30 seconds to 2 minutes
- Format: YouTube URL
- Orientation: Portrait or landscape
- Resolution: 1080p minimum

### Video Content Structure

**Suggested Timeline (30 seconds):**

1. **Intro (0-3s)**
   - App icon animation
   - "Symbi" text appears
   - Fade in from purple

2. **Onboarding Preview (3-8s)**
   - Quick swipe through onboarding screens
   - Show permission request
   - Highlight privacy features

3. **Main Feature (8-16s)**
   - Show Symbi reacting to health data
   - Demonstrate state transitions
   - Show step count updating
   - Symbi animation in focus

4. **Additional Features (16-24s)**
   - Quick cuts of:
     - Threshold customization
     - Multiple emotional states
     - Evolution preview

5. **Call to Action (24-30s)**
   - "Start Your Journey Today"
   - App icon
   - "Download Free"
   - Fade to purple

### Video Production Tips

**Recording:**
- Use iOS Simulator or Android Emulator for clean recordings
- Record at highest resolution
- Use screen recording tools:
  - iOS: QuickTime Player (Mac)
  - Android: Android Studio screen recording
  - Cross-platform: OBS Studio

**Editing:**
- Add smooth transitions
- Include background music (royalty-free)
- Add text overlays for key features
- Keep pace quick and engaging
- Export at high quality

**Tools:**
- [iMovie](https://www.apple.com/imovie/) (Mac, free)
- [DaVinci Resolve](https://www.blackmagicdesign.com/products/davinciresolve) (Free)
- [Adobe Premiere Pro](https://www.adobe.com/products/premiere.html)
- [Final Cut Pro](https://www.apple.com/final-cut-pro/)

**Music Resources (Royalty-Free):**
- [Epidemic Sound](https://www.epidemicsound.com)
- [Artlist](https://artlist.io)
- [YouTube Audio Library](https://www.youtube.com/audiolibrary)
- [Free Music Archive](https://freemusicarchive.org)

### Video Script

```
[0-3s] App icon animates in with purple glow
Text: "Symbi"

[3-8s] Quick onboarding flow
Text: "Meet your health companion"
Show: Permission screens, privacy features

[8-16s] Main screen with Symbi animation
Text: "Your wellness, visualized"
Show: Symbi reacting to step count

[16-24s] Feature highlights
Text: "Customize • Evolve • Thrive"
Show: Settings, evolution, multiple states

[24-30s] Call to action
Text: "Start your journey today"
Text: "Download free"
App icon with download arrow
```

---

## Promotional Graphics

### Social Media Assets

**Twitter/X Card**
- Size: 1200 x 628 pixels
- Format: PNG or JPEG
- Content: App icon, tagline, key feature

**Facebook/Instagram Post**
- Size: 1080 x 1080 pixels (square)
- Format: PNG or JPEG
- Content: Symbi character, app name, download link

**Instagram Story**
- Size: 1080 x 1920 pixels
- Format: PNG or JPEG
- Content: Vertical layout, swipe-up CTA

### Press Kit

Create a press kit folder with:
- App icon (various sizes)
- Screenshots (all sizes)
- Feature graphic
- Logo (with and without text)
- Brand colors (hex codes)
- App description (short and long)
- Press release (if applicable)

### File Organization

```
docs/app-store/promotional/
  social-media/
    twitter-card.png
    facebook-post.png
    instagram-story.png
  press-kit/
    app-icon-1024.png
    app-icon-512.png
    logo-with-text.png
    logo-icon-only.png
    brand-colors.txt
    app-description.txt
```

---

## Release Notes

### Version 1.0.0 - Initial Release

**iOS App Store Format:**

```
🎉 Welcome to Symbi!

Meet your new health companion—a Halloween-themed digital pet that brings your wellness data to life.

✨ Features:
• Connect to Apple Health for automatic step tracking
• Watch your Symbi react to your daily activity
• Customize activity thresholds to match your goals
• Beautiful animations with multiple emotional states
• Privacy-first design—your data stays on your device
• Manual entry mode for complete privacy control

🎃 Coming Soon:
• AI-powered multi-metric analysis
• Sleep and HRV tracking
• Interactive breathing exercises
• Generative evolution system

Start your journey with Symbi today! 👻💜
```

**Google Play Store Format:**

```
🎉 Welcome to Symbi!

Meet your new health companion—a Halloween-themed digital pet that brings your wellness data to life.

✨ Features:
• Connect to Google Fit or Health Connect for automatic tracking
• Watch your Symbi react to your daily activity
• Customize activity thresholds to match your goals
• Beautiful animations with multiple emotional states
• Privacy-first design—your data stays on your device
• Manual entry mode for complete privacy control

🎃 Coming Soon:
• AI-powered multi-metric analysis
• Sleep and HRV tracking
• Interactive breathing exercises
• Generative evolution system

Start your journey with Symbi today! 👻💜
```

### Future Release Notes Template

```
Version X.X.X

🆕 New Features:
• [Feature 1]
• [Feature 2]

🐛 Bug Fixes:
• Fixed [issue 1]
• Improved [issue 2]

⚡ Performance:
• Faster [improvement 1]
• Optimized [improvement 2]

Thank you for using Symbi! 💜
```

---

## Production Checklist

### App Icon
- [ ] iOS icon created (1024x1024)
- [ ] Android icon created (512x512)
- [ ] Adaptive icon created (432x432)
- [ ] Icons tested at various sizes
- [ ] Icons follow design guidelines

### Screenshots
- [ ] iOS 6.7" screenshots created (5-8 screenshots)
- [ ] iOS 6.5" screenshots created
- [ ] Android phone screenshots created (4-8 screenshots)
- [ ] Screenshots show real app content
- [ ] Captions added to screenshots
- [ ] Screenshots reviewed for quality

### Feature Graphic (Android)
- [ ] Feature graphic created (1024x500)
- [ ] Text is readable
- [ ] Branding is consistent
- [ ] File size under 1MB

### Preview Video
- [ ] Video script written
- [ ] Video recorded (30 seconds)
- [ ] Video edited with transitions
- [ ] Background music added
- [ ] Video exported at high quality
- [ ] Video uploaded to YouTube (for Android)

### Promotional Materials
- [ ] Social media graphics created
- [ ] Press kit assembled
- [ ] Brand assets organized

### Release Notes
- [ ] iOS release notes written
- [ ] Android release notes written
- [ ] Release notes reviewed for clarity

### Final Review
- [ ] All assets reviewed by team
- [ ] Assets tested on actual devices
- [ ] File names and organization verified
- [ ] Assets uploaded to App Store Connect / Play Console

---

## Resources

### Design Inspiration
- [App Store Screenshots Gallery](https://www.applaunchpad.com/app-store-screenshots/)
- [Mobbin](https://mobbin.com) - Mobile design patterns
- [Dribbble](https://dribbble.com) - Design inspiration

### Tools
- [Figma](https://figma.com) - Design tool
- [Sketch](https://www.sketch.com) - Design tool
- [Canva](https://canva.com) - Quick graphics
- [Previewed](https://previewed.app) - Device mockups

### Guidelines
- [Apple App Store Guidelines](https://developer.apple.com/app-store/product-page/)
- [Google Play Store Guidelines](https://developer.android.com/distribute/marketing-tools/device-art-generator)

### Support
- Internal: Contact design team
- External: Hire freelancer on Fiverr/Upwork if needed

---

## Timeline

**Estimated Time:**
- App Icon: 2-4 hours
- Screenshots: 4-8 hours
- Feature Graphic: 1-2 hours
- Preview Video: 4-8 hours
- Promotional Materials: 2-4 hours
- **Total: 13-26 hours**

**Recommended Schedule:**
- Week 1: App icon and screenshots
- Week 2: Feature graphic and video
- Week 3: Promotional materials and review
- Week 4: Final polish and submission

---

## Notes

- All assets should be created at the highest resolution required
- Use consistent branding across all materials
- Test assets on actual devices before submission
- Keep source files for future updates
- Consider A/B testing different screenshots after launch
