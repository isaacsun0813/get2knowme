# Screen Sizing Guide

## 🎯 Problem

Different screen sizes and aspect ratios make the 3D world and UI elements appear inconsistent:
- Earth sometimes too close or too far
- Boarding pass (SUNFLIGHTS) banner too big or small
- Cassette player too big or small
- Flight controls too big or small

## ✅ Solution

All sizing is now controlled by CSS custom properties in `src/app/globals.css`. You can adjust everything in one place!

---

## 🌍 Adjusting Earth Zoom (Camera Distance)

**File:** `src/app/globals.css`

```css
:root {
  /* Camera zoom - affects how close/far the Earth appears */
  --camera-distance-multiplier: 1.0;
  /* Lower = camera closer (Earth bigger) */
  /* Higher = camera farther (Earth smaller) */
}
```

### Quick Test (Live Adjustment):
1. Open your site
2. Open DevTools (F12) → Elements tab
3. Click on `<html>` element
4. In Styles panel, add:
   ```css
   style="--camera-distance-multiplier: 1.2"
   ```
5. Adjust the value until it looks good
6. Copy that value to `globals.css`

### Examples:
- **Earth too close (too zoomed in):** `--camera-distance-multiplier: 1.3` (30% farther)
- **Earth too far (too zoomed out):** `--camera-distance-multiplier: 0.8` (20% closer)
- **Perfect for ultrawide monitor:** Try `1.1` to `1.2`
- **Perfect for small laptop:** Try `1.2` to `1.4`

---

## 🎫 Adjusting SUNFLIGHTS Boarding Pass

**File:** `src/app/globals.css`

```css
:root {
  /* Boarding pass (center bottom) */
  --boarding-pass-width: clamp(17rem, 22vw, 21rem);
  /* ↑min width  ↑scales with viewport  ↑max width */
  
  --boarding-pass-padding: clamp(0.75rem, 1vw, 0.875rem);
  /* ↑min padding  ↑scales  ↑max padding */
  
  --boarding-pass-bottom: clamp(1rem, 2vh, 1.5rem);
  /* ↑distance from bottom of screen */
}
```

### To Make Bigger:
```css
--boarding-pass-width: clamp(19rem, 26vw, 24rem);  /* Increase all values */
--boarding-pass-padding: clamp(0.875rem, 1.2vw, 1rem);
```

### To Make Smaller:
```css
--boarding-pass-width: clamp(15rem, 18vw, 18rem);  /* Decrease all values */
--boarding-pass-padding: clamp(0.625rem, 0.8vw, 0.75rem);
```

---

## 🎵 Adjusting Cassette Music Player

**File:** `src/app/globals.css`

```css
:root {
  /* Music player (bottom right) */
  --music-controls-width: clamp(12rem, 16vw, 14rem);
  --music-controls-padding: clamp(0.75rem, 1vw, 1rem);
  --music-controls-bottom: clamp(1rem, 2vh, 1.5rem);
  --music-controls-right: clamp(1rem, 2vw, 1.5rem);
}
```

### To Make Bigger:
```css
--music-controls-width: clamp(14rem, 18vw, 16rem);
--music-controls-padding: clamp(0.875rem, 1.2vw, 1.25rem);
```

### To Make Smaller:
```css
--music-controls-width: clamp(10rem, 14vw, 12rem);
--music-controls-padding: clamp(0.625rem, 0.8vw, 0.875rem);
```

---

## 🎮 Adjusting Flight Controls

**File:** `src/app/globals.css`

```css
:root {
  /* Flight controls (bottom left) */
  --flight-controls-width: clamp(9rem, 14vw, 12rem);
  --flight-controls-padding: clamp(0.75rem, 1.2vw, 1rem);
  --flight-controls-gap: clamp(0.4rem, 0.6vw, 0.5rem);
  --flight-controls-bottom: clamp(1rem, 2vh, 1.5rem);
  --flight-controls-left: clamp(1rem, 2vw, 1.5rem);
}
```

### To Make Bigger:
```css
--flight-controls-width: clamp(10rem, 16vw, 14rem);
--flight-controls-padding: clamp(0.875rem, 1.4vw, 1.25rem);
--flight-controls-gap: clamp(0.5rem, 0.8vw, 0.625rem);
```

### To Make Smaller:
```css
--flight-controls-width: clamp(8rem, 12vw, 10rem);
--flight-controls-padding: clamp(0.625rem, 1vw, 0.875rem);
--flight-controls-gap: clamp(0.3rem, 0.5vw, 0.4rem);
```

---

## 📐 Understanding `clamp()`

The `clamp(min, ideal, max)` function makes elements scale smoothly:

```css
clamp(12rem, 16vw, 14rem)
      ↑      ↑     ↑
      min   ideal  max
```

- **min**: Smallest size (on small screens)
- **ideal**: Size that scales with viewport width (`vw`) or height (`vh`)
- **max**: Largest size (on large screens)

### Viewport Units:
- `vw` = viewport width (1vw = 1% of screen width)
- `vh` = viewport height (1vh = 1% of screen height)
- `rem` = relative to root font size (usually 16px, so 1rem = 16px)

---

## 🔧 How to Make Adjustments

### Method 1: Direct Edit (Recommended)
1. Open `src/app/globals.css`
2. Find the CSS variable (e.g., `--boarding-pass-width`)
3. Adjust the values in `clamp()`
4. Save and refresh your browser

### Method 2: Live Testing
1. Open DevTools (F12) → Elements tab
2. Click `<html>` element
3. In Styles panel, edit the CSS variables
4. See changes instantly
5. Copy the values you like to `globals.css`

---

## 🎨 Responsive Breakpoints

The site automatically adjusts for these screen types:

| Screen Type | Width | Example Device |
|-------------|-------|----------------|
| Mobile      | < 768px | iPhone, small Android |
| Tablet      | 768px - 1024px | iPad, tablets |
| Desktop     | 1024px - 1920px | Laptops, monitors |
| Ultrawide   | > 1920px | 21:9 monitors, 4K |

The `clamp()` function handles all of this automatically, so you don't need to write media queries!

---

## 🐛 Common Issues & Fixes

### Issue: "Everything is too big on my screen"
**Solution:**
```css
/* Decrease the middle value (scales with screen) */
--boarding-pass-width: clamp(17rem, 18vw, 21rem);  /* Was 22vw */
--music-controls-width: clamp(12rem, 14vw, 14rem);  /* Was 16vw */
--flight-controls-width: clamp(9rem, 12vw, 12rem);  /* Was 14vw */
```

### Issue: "Everything is too small on my screen"
**Solution:**
```css
/* Increase the middle value */
--boarding-pass-width: clamp(17rem, 26vw, 21rem);  /* Was 22vw */
--music-controls-width: clamp(12rem, 18vw, 14rem);  /* Was 16vw */
--flight-controls-width: clamp(9rem, 16vw, 12rem);  /* Was 14vw */
```

### Issue: "Earth is too close/far on different screens"
**Solution:** Adjust the camera multiplier:
```css
/* Start with small adjustments (0.1 increments) */
--camera-distance-multiplier: 1.1;  /* Try 0.8 to 1.5 */
```

### Issue: "UI elements overlap on small screens"
**Solution:** Increase the min value in `clamp()`:
```css
/* Before */
--boarding-pass-width: clamp(17rem, 22vw, 21rem);

/* After - increase minimum */
--boarding-pass-width: clamp(19rem, 22vw, 21rem);
```

### Issue: "UI elements too big on ultrawide monitors"
**Solution:** Decrease the max value in `clamp()`:
```css
/* Before */
--music-controls-width: clamp(12rem, 16vw, 14rem);

/* After - decrease maximum */
--music-controls-width: clamp(12rem, 16vw, 12rem);
```

---

## 📝 Testing Checklist

Test your adjustments on different screen sizes:

- [ ] **Small laptop** (1366x768): Is Earth visible? UI readable?
- [ ] **Standard laptop** (1920x1080): Does it look balanced?
- [ ] **Ultrawide monitor** (2560x1080, 21:9): UI not too stretched?
- [ ] **4K monitor** (3840x2160): Text still readable?
- [ ] **Tall screen** (1080x1920, rotated): Everything fits?

Use Chrome DevTools Device Toolbar (Cmd+Shift+M) to test different sizes without multiple monitors.

---

## 💡 Pro Tips

1. **Make small changes:** Adjust by 0.1-0.2 at a time
2. **Test on real devices:** Emulation isn't perfect
3. **Start with one screen:** Adjust for your main monitor first
4. **Use browser zoom:** Cmd/Ctrl +/- to test zoom levels
5. **Check all UI elements:** Don't just adjust one, check how others look too

---

## 🆘 Still Having Issues?

If you're still having trouble:

1. **Reset to defaults:** Copy the values from this guide
2. **Check browser zoom:** Make sure it's at 100% (Cmd/Ctrl + 0)
3. **Clear cache:** Hard refresh (Cmd/Ctrl + Shift + R)
4. **Test in incognito:** Rules out extension interference

---

## 📦 Quick Reference

All CSS variables in one place (copy/paste this into globals.css):

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

**Remember:** After making changes, save the file and hard refresh your browser (Cmd/Ctrl + Shift + R) to see the updates!
