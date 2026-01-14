/**
 * Type definitions for OpenCV.js
 * OpenCV.js 4.8.0
 */

declare const cv: any;

interface CVMat {
  rows: number;
  cols: number;
  data: Uint8Array;
  data64F: Float64Array;
  delete(): void;
}

interface CVMatVector {
  size(): number;
  get(index: number): CVMat;
  delete(): void;
}
