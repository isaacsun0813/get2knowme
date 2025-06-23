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
 * Creates plane orientation using improved approach to prevent gimbal lock
 */
export function createPlaneOrientation(
  position: THREE.Vector3,
  heading: number,
  pitch: number
): THREE.Quaternion {
  // Get the surface normal (up direction)
  const up = position.clone().normalize()
  
  // Create a stable reference direction to avoid pole issues
  // Use global X unless we're too close to it
  let reference = new THREE.Vector3(1, 0, 0)
  if (Math.abs(up.dot(reference)) > 0.9) {
    // If too close to X axis, use Z axis instead
    reference = new THREE.Vector3(0, 0, 1)
  }
  
  // Create east (right) direction
  const east = new THREE.Vector3().crossVectors(up, reference).normalize()
  
  // Create north (forward when heading=0) direction  
  const north = new THREE.Vector3().crossVectors(east, up).normalize()
  
  // Apply heading rotation around the up axis
  const headingRotation = new THREE.Matrix4().makeRotationAxis(up, heading)
  const forwardDirection = north.clone().applyMatrix4(headingRotation)
  const rightDirection = east.clone().applyMatrix4(headingRotation)
  
  // Apply pitch rotation around the right axis
  const pitchRotation = new THREE.Matrix4().makeRotationAxis(rightDirection, pitch)
  const finalForward = forwardDirection.applyMatrix4(pitchRotation)
  const finalUp = up.clone().applyMatrix4(pitchRotation)
  
  // Recalculate right to ensure orthogonality
  const finalRight = new THREE.Vector3().crossVectors(finalForward, finalUp).normalize()
  
  // Create rotation matrix from the final basis vectors
  const rotationMatrix = new THREE.Matrix4()
  rotationMatrix.makeBasis(finalRight, finalUp, finalForward.negate())
  
  // Convert to quaternion
  const quaternion = new THREE.Quaternion()
  quaternion.setFromRotationMatrix(rotationMatrix)
  
  return quaternion
}

/**
 * Clamps pitch angle to prevent excessive nose up/down
 */
export function clampPitch(pitch: number, maxPitch: number = Math.PI / 3): number {
  return THREE.MathUtils.clamp(pitch, -maxPitch, maxPitch)
} 