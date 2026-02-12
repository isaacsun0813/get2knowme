# Camera Guide

## How It Works

The camera uses the **standard Three.js approach** for responsive camera distance:

1. **FOV-based distance calculation**: Distance is calculated from the camera's field of view to maintain consistent visual size
2. **Height-based scaling**: Slightly adjusts distance based on screen height (taller screens = slightly farther)
3. **Smooth following**: Uses lerp (linear interpolation) for smooth camera movement

This is simpler and more maintainable than complex area-based calculations.

## Adjusting Zoom

### Method 1: CSS Variable (Recommended)

Edit `src/app/globals.css`:

```css
:root {
  --camera-distance-multiplier: 1.0; /* Default */
}
```

- `1.0` = normal distance
- `1.2` = 20% farther (Earth smaller)
- `0.8` = 20% closer (Earth bigger)

### Method 2: Live Testing

1. Open DevTools (F12) → Elements tab
2. Click `<html>` element
3. Add inline style: `style="--camera-distance-multiplier: 1.2"`
4. Adjust until it looks good
5. Copy value to `globals.css`

## How It's Different

**Old approach**: Complex area-based scaling with aspect ratio adjustments, multiple multipliers, and hard-to-debug logic.

**New approach**: 
- Standard Three.js FOV formula: `distance = (visibleHeight / 2) / tan(fov/2)`
- Simple height-based scaling
- Updates `camera.aspect` and `camera.updateProjectionMatrix()` on resize (standard practice)

This follows the same pattern used by professional Three.js projects like Bruno Simon's portfolio.
