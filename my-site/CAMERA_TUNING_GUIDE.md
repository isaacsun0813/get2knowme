# Camera Zoom Tuning Guide

## 🎯 How It Works Now

The camera now responds **independently** to width and height changes:
- **Wider screen** = zooms OUT more (Earth smaller)
- **Narrower screen** = zooms IN more (Earth bigger)
- **Taller screen** = zooms OUT more (Earth smaller)
- **Shorter screen** = zooms IN more (Earth bigger)

Every pixel change in width or height smoothly affects the zoom!

---

## 🎛️ Tuning Parameters

**File:** `src/app/globals.css`

### Base Multiplier
```css
--camera-distance-multiplier: 1.2;
```
- **Lower** (e.g., `1.0`) = Earth bigger overall
- **Higher** (e.g., `1.5`) = Earth smaller overall
- Adjusts zoom for ALL screens proportionally

### Width Power
```css
--camera-width-power: 0.4;
```
- Controls how **aggressively** width affects zoom
- **Lower** (e.g., `0.2`) = width changes have less effect
- **Higher** (e.g., `0.6`) = width changes have more effect
- **Recommended:** `0.3` - `0.5`

### Height Power
```css
--camera-height-power: 0.5;
```
- Controls how **aggressively** height affects zoom
- **Lower** (e.g., `0.3`) = height changes have less effect
- **Higher** (e.g., `0.7`) = height changes have more effect
- **Recommended:** `0.4` - `0.6`

### Width Sensitivity
```css
--camera-width-sensitivity: 1.0;
```
- Overall strength of width scaling
- **Lower** (e.g., `0.7`) = less zoom-out on wide screens
- **Higher** (e.g., `1.3`) = more zoom-out on wide screens
- **Recommended:** `0.8` - `1.2`

### Height Sensitivity
```css
--camera-height-sensitivity: 1.0;
```
- Overall strength of height scaling
- **Lower** (e.g., `0.7`) = less zoom-out on tall screens
- **Higher** (e.g., `1.3`) = more zoom-out on tall screens
- **Recommended:** `0.8` - `1.2`

---

## 🔧 Quick Tuning Process

### If Earth is too small on ultrawide (3440×1440):
```css
--camera-width-sensitivity: 0.8; /* Reduce width effect */
--camera-distance-multiplier: 1.1; /* Zoom in more overall */
```

### If Earth is too big on ultrawide:
```css
--camera-width-sensitivity: 1.2; /* Increase width effect */
--camera-distance-multiplier: 1.3; /* Zoom out more overall */
```

### If Earth changes too much when resizing width:
```css
--camera-width-power: 0.3; /* Less aggressive width scaling */
```

### If Earth changes too much when resizing height:
```css
--camera-height-power: 0.4; /* Less aggressive height scaling */
```

---

## 📊 Example: Tuning for 3440×1440

**Current values:**
```css
--camera-distance-multiplier: 1.2;
--camera-width-power: 0.4;
--camera-height-power: 0.5;
--camera-width-sensitivity: 1.0;
--camera-height-sensitivity: 1.0;
```

**If Earth is too small:**
```css
--camera-width-sensitivity: 0.85; /* Less zoom-out on wide screens */
--camera-distance-multiplier: 1.15; /* Slightly more zoom-in */
```

**If Earth is too big:**
```css
--camera-width-sensitivity: 1.15; /* More zoom-out on wide screens */
--camera-distance-multiplier: 1.25; /* Slightly more zoom-out */
```

---

## 🧪 Testing Method

1. **Open DevTools** (F12) → Elements tab
2. **Click `<html>`** element
3. **In Styles panel**, add inline style:
   ```css
   style="--camera-width-sensitivity: 0.9"
   ```
4. **Resize browser window** - watch Earth zoom smoothly
5. **Adjust value** until it looks good
6. **Copy value** to `globals.css`

---

## 💡 Tips

- **Start with small changes** (0.05-0.1 increments)
- **Test on multiple screen sizes** after each change
- **Width sensitivity** affects ultrawide screens most
- **Height sensitivity** affects tall/short screens most
- **Base multiplier** affects all screens equally

---

## 🎯 Goal

The system should feel **smooth and natural** - Earth should scale appropriately as you resize the window, responding to both width and height changes independently.
