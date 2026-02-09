# Quick Size Adjustments - Visual Reference

## 🎯 What Controls What

```
┌─────────────────────────────────────────────────────────────┐
│                      YOUR SCREEN                             │
│                                                              │
│  ┌──────────────────────────────────────────────┐          │
│  │        SUNFLIGHTS BOARDING PASS              │          │
│  │   --boarding-pass-width: 17-21rem           │          │
│  │   --boarding-pass-padding: 0.75-0.875rem    │          │
│  └──────────────────────────────────────────────┘          │
│                       ↑                                      │
│          --boarding-pass-bottom: 1-1.5rem                   │
│                                                              │
│         🌍  ← --camera-distance-multiplier: 1.0            │
│       EARTH   (1.0 = normal, 1.2 = farther, 0.8 = closer)  │
│                                                              │
│  ┌──────────┐                          ┌──────────┐        │
│  │ FLIGHT   │                          │ CASSETTE │        │
│  │ CONTROLS │                          │  PLAYER  │        │
│  │   W A D  │                          │  🎵 ▶️ 🔇 │        │
│  └──────────┘                          └──────────┘        │
│       ↑                                        ↑            │
│   --flight-controls-*               --music-controls-*     │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ 30-Second Fix

**File:** `src/app/globals.css`

Find this section and adjust the values:

```css
:root {
  /* 🌍 EARTH ZOOM - Adjust first if Earth too close/far */
  --camera-distance-multiplier: 1.0;
  /* 0.8 = closer, 1.2 = farther, 1.5 = much farther */
  
  /* 🎫 BOARDING PASS (center) */
  --boarding-pass-width: clamp(17rem, 22vw, 21rem);
  /* Too big? → clamp(15rem, 18vw, 18rem) */
  /* Too small? → clamp(19rem, 26vw, 24rem) */
  
  /* 🎵 MUSIC PLAYER (bottom right) */
  --music-controls-width: clamp(12rem, 16vw, 14rem);
  /* Too big? → clamp(10rem, 14vw, 12rem) */
  /* Too small? → clamp(14rem, 18vw, 16rem) */
  
  /* 🎮 FLIGHT CONTROLS (bottom left) */
  --flight-controls-width: clamp(9rem, 14vw, 12rem);
  /* Too big? → clamp(8rem, 12vw, 10rem) */
  /* Too small? → clamp(10rem, 16vw, 14rem) */
}
```

---

## 🔍 Testing Different Screens

### Method 1: Live Browser Test (Fastest)

1. Open your site
2. Press **F12** (DevTools)
3. Click **Elements** tab
4. Click `<html>` element at top
5. In **Styles** panel, add:
   ```css
   style="--camera-distance-multiplier: 1.2"
   ```
6. Adjust value until perfect
7. Copy to `globals.css`

### Method 2: Chrome Device Emulation

1. Press **Cmd/Ctrl + Shift + M**
2. Select device: iPhone, iPad, Laptop, etc.
3. See how it looks on different screens
4. Adjust CSS variables accordingly

---

## 📏 Common Screen Size Adjustments

### Small Laptop (13-14", 1366x768)
```css
--camera-distance-multiplier: 1.2;  /* Earth a bit farther */
--boarding-pass-width: clamp(15rem, 20vw, 19rem);  /* Smaller */
--music-controls-width: clamp(11rem, 14vw, 13rem);
--flight-controls-width: clamp(8rem, 12vw, 11rem);
```

### Standard Laptop (15-16", 1920x1080)
```css
--camera-distance-multiplier: 1.0;  /* Default works great */
/* Keep all other defaults */
```

### Ultrawide Monitor (21:9, 2560x1080)
```css
--camera-distance-multiplier: 1.1;  /* Slightly farther */
--boarding-pass-width: clamp(17rem, 20vw, 20rem);  /* Cap max width */
--music-controls-width: clamp(12rem, 14vw, 13rem);
--flight-controls-width: clamp(9rem, 12vw, 11rem);
```

### 4K Monitor (27"+, 3840x2160)
```css
--camera-distance-multiplier: 0.9;  /* Closer (screen is big) */
--boarding-pass-width: clamp(18rem, 22vw, 22rem);  /* Can be bigger */
--music-controls-width: clamp(13rem, 16vw, 15rem);
--flight-controls-width: clamp(10rem, 14vw, 13rem);
```

---

## 🎯 Problem → Solution

### "Earth is too close, I can't see the whole thing"
```css
--camera-distance-multiplier: 1.3;  /* Was 1.0, now 30% farther */
```

### "Earth is too far, it looks tiny"
```css
--camera-distance-multiplier: 0.7;  /* Was 1.0, now 30% closer */
```

### "Boarding pass covers too much screen"
```css
--boarding-pass-width: clamp(15rem, 18vw, 18rem);  /* Smaller */
```

### "Can't read the flight controls, too small"
```css
--flight-controls-width: clamp(11rem, 16vw, 14rem);  /* Bigger */
--flight-controls-padding: clamp(1rem, 1.4vw, 1.25rem);
```

### "Everything overlaps on my screen"
```css
/* Move things farther from edges */
--flight-controls-bottom: clamp(1.5rem, 3vh, 2rem);  /* More space */
--flight-controls-left: clamp(1.5rem, 3vw, 2rem);
--music-controls-bottom: clamp(1.5rem, 3vh, 2rem);
--music-controls-right: clamp(1.5rem, 3vw, 2rem);
```

---

## 💾 Save & Refresh

After making changes:

1. **Save** `globals.css` (Cmd/Ctrl + S)
2. **Hard refresh** browser (Cmd/Ctrl + Shift + R)
3. **Test** on your screen
4. **Repeat** until perfect

---

## 🆘 Reset to Defaults

If you mess up, copy this into `globals.css`:

```css
:root {
  /* Camera zoom */
  --camera-distance-multiplier: 1.0;
  
  /* Flight controls (bottom left) */
  --flight-controls-width: clamp(9rem, 14vw, 12rem);
  --flight-controls-padding: clamp(0.75rem, 1.2vw, 1rem);
  --flight-controls-gap: clamp(0.4rem, 0.6vw, 0.5rem);
  --flight-controls-bottom: clamp(1rem, 2vh, 1.5rem);
  --flight-controls-left: clamp(1rem, 2vw, 1.5rem);
  
  /* Music player (bottom right) */
  --music-controls-width: clamp(12rem, 16vw, 14rem);
  --music-controls-padding: clamp(0.75rem, 1vw, 1rem);
  --music-controls-bottom: clamp(1rem, 2vh, 1.5rem);
  --music-controls-right: clamp(1rem, 2vw, 1.5rem);
  
  /* Boarding pass (center bottom) */
  --boarding-pass-width: clamp(17rem, 22vw, 21rem);
  --boarding-pass-padding: clamp(0.75rem, 1vw, 0.875rem);
  --boarding-pass-bottom: clamp(1rem, 2vh, 1.5rem);
}
```

---

## 📚 More Details

See **SCREEN_SIZING_GUIDE.md** for:
- Deep explanations of how `clamp()` works
- Aspect ratio adjustments
- Advanced troubleshooting
- Multiple screen testing strategy

---

**Remember:** Start with small adjustments (0.1-0.2) and test frequently!
