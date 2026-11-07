import { cropBoundingBoxToBlob, applyBoundingBoxPadding } from './box2d-cropper.util';

describe('box2d-cropper.util', () => {
  it('should apply breathing margin padding to bounding box and clamp to 0..1000', () => {
    // Box: [200, 200, 400, 400], width=200, height=200. 6% padding = 12 units
    const padded = applyBoundingBoxPadding([200, 200, 400, 400], 0.06);
    expect(padded[0]).toBe(188); // 200 - 12
    expect(padded[1]).toBe(188); // 200 - 12
    expect(padded[2]).toBe(412); // 400 + 12
    expect(padded[3]).toBe(412); // 400 + 12

    // Clamping at boundary: [0, 0, 990, 990]
    const clamped = applyBoundingBoxPadding([0, 0, 990, 990], 0.1);
    expect(clamped[0]).toBe(0);
    expect(clamped[1]).toBe(0);
    expect(clamped[2]).toBe(1000);
    expect(clamped[3]).toBe(1000);
  });
  it('should crop a bounding box accurately from an HTMLCanvasElement', async () => {
    // Create a 1000x1000 test canvas
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    expect(ctx).toBeTruthy();

    if (ctx) {
      ctx.fillStyle = '#C49A45'; // Gold
      ctx.fillRect(100, 100, 400, 300);
    }

    // box_2d is [ymin, xmin, ymax, xmax] -> [100, 100, 400, 500] (w=400, h=300)
    const result = await cropBoundingBoxToBlob(canvas, [100, 100, 400, 500]);

    expect(result).toBeDefined();
    expect(result.width).toBe(400);
    expect(result.height).toBe(300);
    expect(result.blob).toBeInstanceOf(Blob);
    expect(result.dataUrl).toContain('data:image/');
    expect(result.sizeKb).toBeLessThanOrEqual(150); // <= 150KB budget
  });

  it('should safely clamp out-of-bounds bounding boxes', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillRect(0, 0, 500, 500);
    }

    // Coordinates beyond 1000 or negative
    const result = await cropBoundingBoxToBlob(canvas, [-50, -20, 1200, 1500]);

    expect(result).toBeDefined();
    expect(result.width).toBeLessThanOrEqual(500);
    expect(result.height).toBeLessThanOrEqual(500);
    expect(result.sizeKb).toBeLessThanOrEqual(150);
  });

  it('should normalize inverted bounding box coordinates automatically', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillRect(100, 100, 300, 300);
    }

    // Inverted coordinates: ymin=400, ymax=100, xmin=500, xmax=200
    const result = await cropBoundingBoxToBlob(canvas, [400, 500, 100, 200]);

    expect(result).toBeDefined();
    expect(result.width).toBe(300);
    expect(result.height).toBe(300);
    expect(result.blob).toBeInstanceOf(Blob);
  });

  it('should reject zero-area bounding boxes by throwing an error', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 500;

    // xmin === xmax
    await expectAsync(cropBoundingBoxToBlob(canvas, [100, 200, 300, 200])).toBeRejectedWithError(
      /Bounding box has zero or negative area/
    );

    // ymin === ymax
    await expectAsync(cropBoundingBoxToBlob(canvas, [200, 100, 200, 300])).toBeRejectedWithError(
      /Bounding box has zero or negative area/
    );
  });
});
