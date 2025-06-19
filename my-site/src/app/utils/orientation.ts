import * as THREE from 'three'

/**
 * Computes a surface-aligned coordinate system at a given position on a sphere
 * Returns a quaternion that represents the local coordinate frame
 */
export function computeSurfaceQuaternion(position: THREE.Vector3): THREE.Quaternion {
  // Compute radial up vector by normalizing position
  const up = position.clone().normalize()
  
  // Compute east vector as cross product of global Y axis and up vector
  const globalY = new THREE.Vector3(0, 1, 0)
  const east = new THREE.Vector3().crossVectors(globalY, up)
  
  // Handle pole case where east would be zero
  if (east.lengthSq() < 0.001) {
    // At poles, use global X as reference
    east.set(1, 0, 0).projectOnPlane(up)
  }
  east.normalize()
  
  // Compute north vector as cross product of east and up
  const north = new THREE.Vector3().crossVectors(east, up).normalize()
  
  // Create rotation matrix from basis vectors
  const matrix = new THREE.Matrix4()
  matrix.makeBasis(east, up, north.negate()) // -north for right-handed coords
  
  // Convert to quaternion
  const quaternion = new THREE.Quaternion()
  quaternion.setFromRotationMatrix(matrix)
  
  return quaternion
}

/**
 * Creates a simple plane orientation based on heading and pitch
 */
export function createPlaneOrientation(
  position: THREE.Vector3,
  heading: number,
  pitch: number
): THREE.Quaternion {
  // Get the surface orientation
  const up = position.clone().normalize()
  
  // Robust pole handling - check if we're close to poles
  const poleThreshold = 0.999
  const isNearPole = Math.abs(up.y) > poleThreshold
  
  let east: THREE.Vector3
  let north: THREE.Vector3
  
  if (isNearPole) {
    // At poles, use a fixed reference frame
    // North pole: use X as east, Z as north
    // South pole: use -X as east, Z as north
    if (up.y > 0) {
      // North pole
      east = new THREE.Vector3(1, 0, 0)
      north = new THREE.Vector3(0, 0, 1)
    } else {
      // South pole
      east = new THREE.Vector3(-1, 0, 0)
      north = new THREE.Vector3(0, 0, 1)
    }
  } else {
    // Normal case - use cross products
    const globalY = new THREE.Vector3(0, 1, 0)
    east = new THREE.Vector3().crossVectors(globalY, up).normalize()
    north = new THREE.Vector3().crossVectors(east, up).normalize()
  }
  
  // Calculate forward direction based on heading
  const forward = new THREE.Vector3()
  forward.copy(north).multiplyScalar(Math.cos(heading))
  forward.addScaledVector(east, Math.sin(heading))
  forward.normalize()
  
  // Apply pitch to forward direction
  const pitchedForward = forward.clone()
  pitchedForward.addScaledVector(up, Math.sin(pitch))
  pitchedForward.normalize()
  
  // Calculate right direction
  const right = new THREE.Vector3().crossVectors(pitchedForward, up).normalize()
  
  // Calculate actual up direction
  const actualUp = new THREE.Vector3().crossVectors(right, pitchedForward).normalize()
  
  // Create rotation matrix and convert to quaternion
  const matrix = new THREE.Matrix4()
  matrix.makeBasis(right, actualUp, pitchedForward.negate()) // -forward for right-handed
  
  const quaternion = new THREE.Quaternion()
  quaternion.setFromRotationMatrix(matrix)
  
  // Add model correction to rotate the plane so it faces the right direction
  const modelCorrection = new THREE.Quaternion()
  modelCorrection.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI/2) // Rotate -90 degrees around Y axis
  
  quaternion.multiply(modelCorrection)
  
  return quaternion
}

/**
 * Clamps pitch angle to prevent excessive nose up/down
 */
export function clampPitch(pitch: number, maxPitch: number = Math.PI / 3): number {
  return THREE.MathUtils.clamp(pitch, -maxPitch, maxPitch)
} 