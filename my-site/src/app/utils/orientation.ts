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
 * Creates plane orientation using lookAt approach - builds direction vector directly
 */
export function createPlaneOrientation(
  position: THREE.Vector3,
  heading: number,
  pitch: number
): THREE.Quaternion {
  // Get surface normal (up direction)
  const up = position.clone().normalize()
  
  // Create a local coordinate system on the surface
  const north = new THREE.Vector3(0, 1, 0).cross(up).normalize()
  if (north.lengthSq() < 0.001) {
    // Handle poles - use X as reference
    north.set(1, 0, 0).cross(up).normalize()
  }
  const east = up.clone().cross(north).normalize()
  
  // Calculate desired forward direction based on heading and pitch
  // Start with north direction, then rotate by heading
  const forwardDirection = north.clone()
  
  // Apply heading rotation around the up vector
  const headingMatrix = new THREE.Matrix4().makeRotationAxis(up, heading)
  forwardDirection.applyMatrix4(headingMatrix)
  
  // Apply pitch by rotating around the local east vector
  const localEast = east.clone()
  const pitchMatrix = new THREE.Matrix4().makeRotationAxis(localEast, pitch)
  forwardDirection.applyMatrix4(pitchMatrix)
  
  // Create orientation matrix using lookAt approach
  const matrix = new THREE.Matrix4()
  const target = position.clone().add(forwardDirection)
  matrix.lookAt(position, target, up)
  
  // Extract quaternion from matrix
  const quaternion = new THREE.Quaternion()
  quaternion.setFromRotationMatrix(matrix)
  
  return quaternion
}

/**
 * Clamps pitch angle to prevent excessive nose up/down
 */
export function clampPitch(pitch: number, maxPitch: number = Math.PI / 3): number {
  return THREE.MathUtils.clamp(pitch, -maxPitch, maxPitch)
} 