export function isLimitedHardware({
  hardwareConcurrency = 0,
  deviceMemory = 0,
}: {
  hardwareConcurrency?: number;
  deviceMemory?: number;
}) {
  return (
    (hardwareConcurrency > 0 && hardwareConcurrency <= 4) ||
    (deviceMemory > 0 && deviceMemory <= 4)
  );
}
