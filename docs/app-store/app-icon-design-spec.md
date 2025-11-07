# Symbi App Icon Design Specification

## Design Concept

The Symbi app icon features the Halloween-themed ghost character in a vibrant purple environment, conveying both the cute and spooky aesthetic of the app.

## Visual Elements

### Primary Element: Symbi Ghost
- **Position**: Centered
- **Size**: 60-70% of icon space
- **Style**: Rounded, friendly ghost shape
- **Color**: Lighter purple (#9333EA) with gradient to darker purple (#7C3AED)
- **Features**:
  - Large, expressive eyes (bright white or light purple)
  - Small smile or neutral expression
  - Slight dripping effect on bottom edges
  - Ethereal glow around character

### Background
- **Style**: Gradient
- **Colors**: 
  - Top: #9333EA (lighter purple)
  - Bottom: #7C3AED (darker purple)
- **Effect**: Subtle radial gradient emanating from Symbi
- **Texture**: Smooth, no noise or patterns

### Accent Elements
- **Glow**: Soft purple glow around Symbi (#A855F7 at 30% opacity)
- **Particles**: 2-3 small sparkle/star particles (optional)
- **Shadow**: Subtle drop shadow beneath Symbi for depth

## Color Palette

```
Primary Purple:   #7C3AED
Secondary Purple: #9333EA
Light Purple:     #A855F7
Accent Purple:    #C084FC
Dark Purple:      #5B21B6
White:            #FFFFFF
```

## Typography

**No text should appear in the app icon.**
- App name is displayed by the OS below the icon
- Keep icon purely visual

## Layout Grid

```
┌─────────────────────────┐
│ ┌─────────────────────┐ │  Outer margin: 8%
│ │                     │ │
│ │   ┌───────────┐     │ │  Safe zone: 80%
│ │   │           │     │ │
│ │   │  👻 Symbi │     │ │  Character: 60-70%
│ │   │           │     │ │
│ │   └───────────┘     │ │
│ │                     │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

## Size Specifications

### iOS
- **App Store**: 1024 x 1024 px (PNG, no transparency)
- **iPhone**: 180 x 180 px (@3x), 120 x 120 px (@2x), 60 x 60 px (@1x)
- **iPad**: 167 x 167 px (@2x), 152 x 152 px (@2x)
- **Settings**: 87 x 87 px (@3x), 58 x 58 px (@2x), 29 x 29 px (@1x)
- **Spotlight**: 120 x 120 px (@3x), 80 x 80 px (@2x), 40 x 40 px (@1x)

### Android
- **Play Store**: 512 x 512 px (PNG, 32-bit with transparency)
- **Launcher**: 192 x 192 px (xxxhdpi), 144 x 144 px (xxhdpi), 96 x 96 px (xhdpi)
- **Adaptive Icon**: 
  - Foreground: 432 x 432 px (108 dp at xxxhdpi)
  - Background: 432 x 432 px (108 dp at xxxhdpi)
  - Safe zone: 264 x 264 px (66 dp at xxxhdpi)

## Design Variations

### Standard Icon (iOS & Android)
- Full Symbi character
- Purple gradient background
- Subtle glow effect

### Adaptive Icon (Android)
- **Foreground Layer**: Symbi character only (transparent background)
- **Background Layer**: Purple gradient
- **Result**: System can apply various shapes (circle, square, rounded square)

## Do's and Don'ts

### ✅ Do:
- Keep design simple and recognizable
- Use high contrast for visibility
- Test at small sizes (29x29 px)
- Maintain consistent branding
- Use vector graphics for scalability
- Export at highest resolution first, then scale down

### ❌ Don't:
- Add text or words
- Use photos or complex imagery
- Include UI elements (buttons, bars)
- Use transparency on iOS
- Make details too small
- Use more than 3-4 colors
- Copy other app icons

## Testing Checklist

- [ ] Icon is recognizable at 29x29 px
- [ ] Icon looks good on light backgrounds
- [ ] Icon looks good on dark backgrounds
- [ ] Icon stands out among other apps
- [ ] Icon matches app's aesthetic
- [ ] Icon works in grayscale
- [ ] Icon has no transparency (iOS)
- [ ] Icon has proper transparency (Android adaptive)
- [ ] All required sizes exported
- [ ] Files named correctly

## Export Settings

### Figma/Sketch Export
```
Format: PNG
Scale: 1x, 2x, 3x
Color Profile: sRGB
Compression: None (for App Store)
```

### Photoshop Export
```
Format: PNG-24
Transparency: No (iOS), Yes (Android)
Color Mode: RGB
Resolution: 72 PPI
```

## File Naming Convention

```
iOS:
- AppIcon-1024.png (App Store)
- AppIcon@3x.png (180x180)
- AppIcon@2x.png (120x120)
- AppIcon.png (60x60)

Android:
- ic_launcher-512.png (Play Store)
- ic_launcher-xxxhdpi.png (192x192)
- ic_launcher-xxhdpi.png (144x144)
- ic_launcher-xhdpi.png (96x96)
- ic_launcher-hdpi.png (72x72)
- ic_launcher-mdpi.png (48x48)

Adaptive (Android):
- ic_launcher_foreground-432.png
- ic_launcher_background-432.png
```

## Design Process

1. **Sketch**: Create rough sketches of icon concepts
2. **Vector**: Create vector version in Figma/Illustrator
3. **Refine**: Adjust colors, proportions, details
4. **Test**: View at various sizes (1024px down to 29px)
5. **Iterate**: Make adjustments based on testing
6. **Export**: Generate all required sizes
7. **Validate**: Check files meet specifications
8. **Implement**: Add to Xcode/Android Studio

## Mockup Preview

Test your icon in context:
- iOS Home Screen mockup
- Android Home Screen mockup
- App Store listing mockup
- Play Store listing mockup

Tools:
- [App Icon Preview](https://appicon.co/)
- [Icon Slate](https://www.kodlian.com/apps/icon-slate)
- [Figma iOS/Android UI Kits](https://www.figma.com/community)

## Accessibility

- **Color Contrast**: Ensure sufficient contrast for visibility
- **Simplicity**: Keep design simple for users with visual impairments
- **Recognition**: Icon should be recognizable without color (grayscale test)

## Brand Consistency

The app icon should align with:
- App's purple color palette
- Halloween theme
- Cute yet spooky aesthetic
- Symbi character design
- Overall brand identity

## Reference Images

Create a mood board with:
- Other health/fitness app icons
- Halloween-themed designs
- Ghost character designs
- Purple gradient examples
- Successful app icons in the category

## Timeline

- **Concept & Sketches**: 2-4 hours
- **Vector Design**: 4-6 hours
- **Refinement**: 2-4 hours
- **Export & Testing**: 1-2 hours
- **Total**: 9-16 hours

## Approval Process

1. Create 3-5 concept variations
2. Present to team for feedback
3. Refine selected concept
4. Test at various sizes
5. Get final approval
6. Export all sizes
7. Implement in project

## Resources

### Design Tools
- [Figma](https://figma.com) - Free, web-based
- [Sketch](https://www.sketch.com) - Mac only
- [Adobe Illustrator](https://www.adobe.com/products/illustrator.html)
- [Affinity Designer](https://affinity.serif.com/designer/)

### Icon Generators
- [App Icon Generator](https://appicon.co/)
- [MakeAppIcon](https://makeappicon.com/)
- [Icon Kitchen](https://icon.kitchen/)

### Inspiration
- [Dribbble - App Icons](https://dribbble.com/tags/app_icon)
- [Behance - Icon Design](https://www.behance.net/search/projects?search=app%20icon)
- [App Store - Health & Fitness](https://apps.apple.com/us/genre/ios-health-fitness/id6013)

## Notes

- Keep source files (Figma/Sketch/AI) for future updates
- Consider seasonal variations (Christmas, Easter, etc.)
- Plan for potential rebrand or icon refresh
- Document design decisions for team reference
