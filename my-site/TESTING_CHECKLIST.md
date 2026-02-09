# Testing Checklist - Let's Figure Out Your Perfect Sizes!

## 📋 Step 1: Test Each Screen

For **each screen** you use, fill out this checklist:

### Screen #1: [Your Screen Name - e.g., "MacBook Pro 15" or "Ultrawide Monitor"]

**Screen Info:**
- Resolution: _____ x _____ (e.g., 1920 x 1080)
- Screen size: _____ inches (diagonal)
- Aspect ratio: _____ (e.g., 16:9, 21:9, 4:3)

**What looks wrong?** (Check all that apply)

#### 🌍 Earth/Camera
- [ ] Earth is **too close** (can't see enough of it)
- [ ] Earth is **too far** (looks tiny)
- [ ] Earth looks **perfect** ✅

#### 🎫 SUNFLIGHTS Boarding Pass (center bottom)
- [ ] **Too big** (takes up too much screen)
- [ ] **Too small** (hard to read)
- [ ] **Position wrong** (too high/low)
- [ ] Looks **perfect** ✅

#### 🎵 Cassette Music Player (bottom right)
- [ ] **Too big**
- [ ] **Too small**
- [ ] **Position wrong** (too close to edge, overlaps with other elements)
- [ ] Looks **perfect** ✅

#### 🎮 Flight Controls (bottom left)
- [ ] **Too big**
- [ ] **Too small** (hard to read keys)
- [ ] **Position wrong** (too close to edge, overlaps)
- [ ] Looks **perfect** ✅

**Overall Assessment:**
- [ ] Everything looks great! ✅
- [ ] Minor tweaks needed
- [ ] Major adjustments needed

---

### Screen #2: [Your Screen Name]

[Repeat the same checklist above]

---

### Screen #3: [Your Screen Name]

[Repeat the same checklist above]

---

## 📸 Step 2: Take Screenshots (Optional but Helpful)

Take screenshots of the flight view on each screen and note:
- Which screen it is
- What specifically looks wrong

## 🎯 Step 3: Priority Screen

**Which screen do you use MOST?** (We'll optimize for this one first)
- [ ] Screen #1: ___________
- [ ] Screen #2: ___________
- [ ] Screen #3: ___________

---

## 💬 Step 4: Send Me This Info

Copy/paste your filled checklist and I'll give you the exact CSS values to use!

---

## 🔧 Quick Test Method

If you want to test adjustments yourself:

1. Open DevTools (F12)
2. Go to Elements tab
3. Click `<html>` element
4. In Styles panel, add inline style:
   ```css
   style="--camera-distance-multiplier: 1.2"
   ```
5. Try different values:
   - `0.7` = much closer
   - `0.8` = closer
   - `1.0` = normal (default)
   - `1.2` = farther
   - `1.5` = much farther
6. When you find a good value, tell me what it is!
