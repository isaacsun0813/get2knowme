# Testing Different Resolutions

## Quick Methods

### Method 1: Resolution Tester Component (Easiest)

A resolution tester component is now available in development mode:

1. **Look for the "📐 Test Resolutions" button** in the top-right corner
2. Click it to open the panel
3. Click any preset resolution to test it
4. Or enter custom dimensions and click "Apply Custom"

**Note:** The component will guide you to use Chrome DevTools if window resizing isn't available.

### Method 2: Chrome DevTools Device Toolbar (Recommended)

1. **Open DevTools**: Press `F12` or `Cmd/Ctrl + Option + I`
2. **Open Device Toolbar**: Press `Cmd/Ctrl + Shift + M`
3. **Select a device** from the dropdown, or:
4. **Set custom size**: Click the dimensions and enter custom width/height
5. **Test different resolutions** by switching between presets

**Preset devices to test:**
- iPhone 14 Pro (393 × 852)
- iPad Pro (2048 × 2732)
- MacBook Air (1512 × 982)
- Standard 1080p (1920 × 1080)
- Ultrawide (2560 × 1080)

### Method 3: Browser Window Resize

1. **Resize your browser window** manually
2. **Watch the camera adjust** automatically
3. **Check console** for debug info showing calculations

### Method 4: Browser Zoom (Test Zoom Levels)

1. **Zoom in**: `Cmd/Ctrl + Plus`
2. **Zoom out**: `Cmd/Ctrl + Minus`
3. **Reset**: `Cmd/Ctrl + 0`
4. Camera automatically adjusts for browser zoom level

## What to Look For

When testing different resolutions, check:

✅ **Earth visibility**: Can you see the whole Earth comfortably?
✅ **UI elements**: Are flight controls, music player, and boarding pass properly sized?
✅ **Aspect ratio**: Does it look good on ultrawide (21:9) and tall screens (portrait)?
✅ **Zoom consistency**: Does Earth appear roughly the same size across different resolutions?

## Common Test Resolutions

| Device | Resolution | Aspect Ratio | Notes |
|--------|-----------|--------------|-------|
| MacBook Air M1 | 1512 × 982 | 1.54:1 | Your current screen |
| MacBook Pro 13" | 1728 × 1117 | 1.55:1 | Similar to yours |
| Standard 1080p | 1920 × 1080 | 1.78:1 (16:9) | Reference resolution |
| Ultrawide 21:9 | 2560 × 1080 | 2.37:1 | Wide screens |
| 4K UHD | 3840 × 2160 | 1.78:1 (16:9) | Large monitors |
| iPad Pro | 2048 × 2732 | 0.75:1 | Portrait/tablet |
| Small Laptop | 1366 × 768 | 1.78:1 (16:9) | Older laptops |

## Adjusting If Needed

If a resolution looks wrong:

1. **Check console** for camera debug info
2. **Adjust CSS multiplier** in `globals.css`:
   ```css
   --camera-distance-multiplier: 1.3; /* Increase to zoom out more */
   ```
3. **Test again** at that resolution
4. **Repeat** until it looks good

## Debug Info

In development mode, the console shows:
- Current screen resolution
- Height ratio (compared to 1080px reference)
- Aspect ratio deviation
- Calculated camera distance
- CSS multiplier being applied

This helps you understand why the camera is positioned where it is.
