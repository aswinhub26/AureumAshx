export type ViewerMode = "exterior" | "interior";

export interface VehicleConfig {
  /** paint option id, undefined = original */
  paint?: string | undefined;
  /** zoneId -> optionId */
  zones: Record<string, string>;
}

export interface CameraGoal {
  position: [number, number, number];
  target: [number, number, number];
  /** increments to retrigger the same goal */
  nonce: number;
}
