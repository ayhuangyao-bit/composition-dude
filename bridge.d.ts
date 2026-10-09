export {};
declare global {
  interface Window {
    compositionDude?: { copyPng?: (bytes: Uint8Array) => Promise<void>; version: string };
  }
}
