import { useMemo } from 'react';
import { Frame, VisionCameraProxy } from 'react-native-vision-camera';

export type DataType = 'uint8' | 'float32';
export type OutputArray<T extends DataType> = T extends 'uint8'
  ? Uint8Array
  : T extends 'float32'
    ? Float32Array
    : never;

interface Size {
  width: number;
  height: number;
}

interface Rect extends Size {
  x: number;
  y: number;
}

export interface Options<T extends DataType> {
  /**
   * If set to `true`, the image will be mirrored horizontally.
   */
  mirror?: boolean;
  /**
   * Crops the image to the given target rect. This is applied first before scaling.
   *
   * If this is not set, a center-crop to the given target aspect ratio is automatically calculated.
   */
  crop?: Rect;
  /**
   * Scale the image to the given target size. This is applied after cropping.
   */
  scale?: Size;
  /**
   * Rotate the image by a given amount of degrees, clockwise.
   * @default '0deg'
   */
  rotation?: '0deg' | '90deg' | '180deg' | '270deg';
  /**
   * Convert the Frame to the given target pixel format.
   *
   * - `'rgb'`: [R, G, B] layout
   * - `'rgba'`: [R, G, B, A]
   * - `'argb'`: [A, R, G, B]
   * - `'bgra'`: [B, G, R, A]
   * - `'bgr'`: [B, G, R]
   * - `'abgr'`: [A, B, G, R]
   */
  pixelFormat: 'rgb' | 'rgba' | 'argb' | 'bgra' | 'bgr' | 'abgr';
  /**
   * The given type to use for the resulting buffer.
   * Each color channel uses this type for representing pixels.
   *
   * - `'uint8'`: Resulting buffer is a `Uint8Array`, values range from 0 to 255
   * - `'float32'`: Resulting buffer is a `Float32Array`, values range from 0.0 to 1.0
   */
  dataType: T;
}

/**
 * An instance of the transform plugin.
 *
 * All temporary memory buffers allocated by the transform plugin
 * will be deleted once this value goes out of scope.
 */
export interface TransformPlugin {
  /**
   * Transforms the given Frame to the target width/height and
   * convert it to the given pixel format.
   */
  resize<T extends DataType>(frame: Frame, options: Options<T>): OutputArray<T>;
}

/**
 * Get a new instance of the transform plugin.
 *
 * All temporary memory buffers allocated by the transform plugin
 * will be deleted once the returned value goes out of scope.
 */
export function createTransformPlugin(): TransformPlugin {
  const transformPlugin =
    VisionCameraProxy.initFrameProcessorPlugin('transform');

  if (transformPlugin == null) {
    throw new Error(
      'Cannot find vision-camera-transform-plugin! Did you install the native dependency properly?'
    );
  }

  return {
    resize: <T extends DataType>(
      frame: Frame,
      options: Options<T>
    ): OutputArray<T> => {
      'worklet';
      // @ts-expect-error
      const arrayBuffer = transformPlugin.call(frame, options) as ArrayBuffer;

      switch (options.dataType) {
        case 'uint8':
          // @ts-expect-error
          return new Uint8Array(arrayBuffer);
        case 'float32':
          // @ts-expect-error
          return new Float32Array(arrayBuffer);
        default:
          throw new Error(`Invalid data type (${options.dataType})!`);
      }
    },
  };
}

/**
 * Use an instance of the transform plugin.
 *
 * All temporary memory buffers allocated by the transform plugin
 * will be deleted once the component that uses `useFrameTransformPlugin()` unmounts.
 */
export function useFrameTransformPlugin(): TransformPlugin {
  return useMemo(() => createTransformPlugin(), []);
}
