# Responsive Design System Guide

## 📐 How to Adjust UI Sizes for Different Screens

All UI sizing is centralized in **`src/app/globals.css`** using CSS custom properties. This makes it easy to adjust sizes globally without hunting through component files.

---

## 🎯 Quick Adjustments

### Make Everything Bigger/Smaller Globally

**File:** `src/app/globals.css`

```css
:root {
  --base-unit: clamp(0.75rem, 0.5vw + 0.5rem, 1rem);
  /* ↑ Increase middle value (0.5vw) to make everything bigger */
  /* Example: clamp(0.75rem, 0.7vw + 0.5rem, 1rem) makes things ~20% bigger */
}
```

### Adjust Specific Components

#### 1. Landmark Modals (AboutMe, Career, Adventure, Vibes, Home)

```css
:root {
  --modal-max-width: clamp(320px, 85vw, 1400px);
  /*                       ↑min  ↑scale ↑max     */
  /* Increase 85vw to 90vw to make modals wider */
  /* Increase 1400px to make them wider on large screens */
  
  --modal-padding: clamp(1.5rem, 3vw, 3rem);
  /*                     ↑min   ↑scale ↑max */
  /* Increase middle value (3vw) to add more padding */
}
```

#### 2. Project Cards (Ambition Page)

```css
:root {
  --card-padding: clamp(1.25rem, 2vw, 2rem);
  /*                    ↑min    ↑scale ↑max  */
  /* Increase to make cards thicker */
  
  --card-gap: clamp(0.75rem, 1.5vw, 1.5rem);
  /* Increase to add more space between cards */
}
```

#### 3. Flight Controls

```css
:root {
  --flight-controls-size: clamp(8rem, 12vw, 11rem);
  /*                           ↑min ↑scale ↑max   */
  /* Increase to make flight controls bigger */
}
```

#### 4. Music Controls

```css
:root {
  --music-controls-size: clamp(13rem, 18vw, 16rem);
  /* Increase to make music player bigger */
}
```

#### 5. Boarding Pass (Location Prompt)

```css
:root {
  --boarding-pass-width: clamp(18rem, 25vw, 24rem);
  --boarding-pass-height: clamp(10rem, 14vh, 13rem);
  /* Adjust to change boarding pass size */
}
```

---

## 📊 Typography Scaling

Font sizes use viewport width scaling for proportional sizing:

```css
:root {
  --text-xs: clamp(0.625rem, 0.7vw, 0.75rem);   /* 10px - 12px */
  --text-sm: clamp(0.75rem, 0.85vw, 0.875rem);  /* 12px - 14px */
  --text-base: clamp(0.875rem, 1vw, 1rem);      /* 14px - 16px */
  --text-lg: clamp(1rem, 1.2vw, 1.125rem);      /* 16px - 18px */
  --text-xl: clamp(1.125rem, 1.4vw, 1.25rem);   /* 18px - 20px */
  --text-2xl: clamp(1.25rem, 1.6vw, 1.5rem);    /* 20px - 24px */
  --text-3xl: clamp(1.5rem, 2vw, 1.875rem);     /* 24px - 30px */
  --text-4xl: clamp(1.875rem, 2.5vw, 2.25rem);  /* 30px - 36px */
  --text-5xl: clamp(2.25rem, 3vw, 3rem);        /* 36px - 48px */
}
```

**To adjust:** Increase the middle value (e.g., `1vw` → `1.2vw`) to make text larger.

---

## 🖥️ Breakpoints Explained

```
Mobile:    < 768px   (sm: prefix)
Tablet:    768-1024px (md: prefix)
Desktop:   1024-1920px (lg: prefix)
Large:     1920-2560px (xl: prefix)
Ultrawide: > 2560px (2xl: prefix)
```

### Aspect Ratio Adjustments

For ultra-wide monitors (21:9) or very tall screens:

```css
@media (min-aspect-ratio: 21/9) {
  /* Ultra-wide monitors */
  :root {
    --modal-max-width: 1200px; /* Prevent modals from stretching too wide */
  }
}

@media (max-aspect-ratio: 9/16) {
  /* Very tall screens (mobile portrait) */
  :root {
    --modal-padding: 1.25rem; /* Use less padding on tall screens */
  }
}
```

---

## 🔧 How to Use in Components

### Method 1: CSS Variables (Recommended)

```tsx
<div style={{
  padding: 'var(--modal-padding)',
  maxWidth: 'var(--modal-max-width)',
  fontSize: 'var(--text-lg)'
}}>
  Content
</div>
```

### Method 2: Tailwind with Custom Values

```tsx
<div className="p-[var(--modal-padding)] max-w-[var(--modal-max-width)] text-[var(--text-lg)]">
  Content
</div>
```

---

## 🎨 Common Adjustments

### Make Modals Bigger

```css
:root {
  --modal-max-width: clamp(320px, 90vw, 1600px);  /* Increase 85vw to 90vw and 1400px to 1600px */
  --modal-padding: clamp(1.5rem, 4vw, 4rem);      /* Increase 3vw to 4vw */
}
```

### Make Project Cards Thicker

```css
:root {
  --card-padding: clamp(1.5rem, 2.5vw, 2.5rem);   /* Increase all values by 0.25-0.5rem */
}
```

### Make Text Smaller

```css
:root {
  --text-base: clamp(0.75rem, 0.9vw, 0.875rem);   /* Decrease all values */
  --text-lg: clamp(0.875rem, 1.1vw, 1rem);
  /* etc. */
}
```

### Make UI Smaller for Ultra-Wide Screens

```css
@media (min-width: 1920px) {
  :root {
    --modal-max-width: 1400px;           /* Smaller max width */
    --flight-controls-size: 10rem;       /* Smaller controls */
    --card-padding: clamp(1rem, 1.5vw, 1.5rem);  /* Less padding */
  }
}
```

---

## 📝 Testing Different Screen Sizes

1. **Chrome DevTools:**
   - Open DevTools (F12 or Cmd+Option+I)
   - Click device toolbar (Cmd+Shift+M)
   - Test preset sizes: iPhone, iPad, Desktop
   - Custom: Set specific dimensions

2. **Browser Zoom:**
   - Cmd/Ctrl + Plus/Minus
   - Sizes scale proportionally with clamp()

3. **Physical Test:**
   - Test on actual devices
   - Different monitors (ultrawide, 4K, etc.)

---

## 💡 Pro Tips

1. **Use `clamp()` for smooth scaling:**
   ```css
   font-size: clamp(14px, 2vw, 24px);
   /* min: 14px, scales with viewport, max: 24px */
   ```

2. **Viewport units:**
   - `vw` = viewport width (1vw = 1% of screen width)
   - `vh` = viewport height (1vh = 1% of screen height)
   - `vmin` = smaller of vw or vh
   - `vmax` = larger of vw or vh

3. **Container queries (future):**
   - Size based on parent container, not viewport
   - Better for modular components

4. **Tailwind arbitrary values:**
   - `text-[var(--text-lg)]` uses CSS variable
   - `p-[var(--card-padding)]` uses CSS variable

---

## 🐛 Debugging Layout Issues

1. **Check CSS variables in DevTools:**
   ```javascript
   // In browser console
   getComputedStyle(document.documentElement).getPropertyValue('--modal-max-width')
   ```

2. **Add debug borders:**
   ```css
   * { border: 1px solid red !important; }
   ```

3. **Check actual rendered sizes:**
   ```javascript
   // In browser console
   element.getBoundingClientRect()
   ```

---

## 📦 Summary

- **All sizes are in `src/app/globals.css`**
- **Use CSS custom properties** (variables starting with `--`)
- **`clamp(min, ideal, max)`** scales smoothly
- **Adjust middle value** in clamp() to scale components
- **Test on multiple screen sizes** after changes

For specific component adjustments, see the component files and look for `style={{ ... }}` that can be converted to use CSS variables.
