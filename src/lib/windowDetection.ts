import { WindowCoordinates } from '@/types';

export interface DetectionResult {
  coordinates: WindowCoordinates;
  confidence: number;
  shape: 'rectangle' | 'square' | 'unknown';
}

export interface EdgePoint {
  x: number;
  y: number;
  magnitude: number;
}

/**
 * Image processing utility for detecting rectangular and square windows
 */
export class WindowDetector {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private imageData: ImageData | null = null;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * Main detection function that processes an image and returns window coordinates
   */
  async detectWindow(imageUrl: string, imageDimensions: { width: number; height: number }): Promise<DetectionResult[]> {
    try {
      // Load and process the image
      await this.loadImage(imageUrl, imageDimensions);
      
      // Convert to grayscale
      this.convertToGrayscale();
      
      // Try multiple detection strategies
      const strategies = [
        { edgeThreshold: 30, contourMinSize: 50, confidenceThreshold: 0.2 },
        { edgeThreshold: 20, contourMinSize: 30, confidenceThreshold: 0.15 },
        { edgeThreshold: 40, contourMinSize: 80, confidenceThreshold: 0.25 }
      ];
      
      let bestResults: DetectionResult[] = [];
      
      for (const strategy of strategies) {
        // Apply edge detection with current strategy
        const edges = this.detectEdgesWithThreshold(strategy.edgeThreshold);
        
        // Find contours with current strategy
        const contours = this.findContoursWithMinSize(edges, strategy.contourMinSize);
        
        // Filter and analyze rectangular shapes
        const rectangles = this.findRectanglesWithThreshold(contours, strategy.confidenceThreshold);
        
        // Convert to normalized coordinates
        const results = this.convertToWindowCoordinates(rectangles, imageDimensions);
        
        // Keep the best results
        if (results.length > bestResults.length || 
            (results.length > 0 && results[0].confidence > (bestResults[0]?.confidence || 0))) {
          bestResults = results;
        }
        
        // If we found good results, break early
        if (bestResults.length > 0 && bestResults[0].confidence > 0.4) {
          break;
        }
      }
      
      return bestResults;
    } catch (error) {
      console.error('Window detection failed:', error);
      return [];
    }
  }

  /**
   * Load image into canvas for processing
   */
  private async loadImage(imageUrl: string, dimensions: { width: number; height: number }): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        this.canvas.width = dimensions.width;
        this.canvas.height = dimensions.height;
        
        // Scale image to fit canvas while maintaining aspect ratio
        const scale = Math.min(dimensions.width / img.width, dimensions.height / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const offsetX = (dimensions.width - scaledWidth) / 2;
        const offsetY = (dimensions.height - scaledHeight) / 2;
        
        this.ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
        this.imageData = this.ctx.getImageData(0, 0, dimensions.width, dimensions.height);
        resolve();
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUrl;
    });
  }

  /**
   * Convert image to grayscale for better edge detection
   */
  private convertToGrayscale(): void {
    if (!this.imageData) return;

    const data = this.imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      data[i] = gray;     // Red
      data[i + 1] = gray; // Green
      data[i + 2] = gray; // Blue
      // Alpha channel remains unchanged
    }
    
    this.ctx.putImageData(this.imageData, 0, 0);
  }

  /**
   * Apply Sobel edge detection algorithm with configurable threshold
   */
  private detectEdgesWithThreshold(threshold: number = 30): EdgePoint[] {
    if (!this.imageData) return [];

    const data = this.imageData.data;
    const width = this.imageData.width;
    const height = this.imageData.height;
    const edges: EdgePoint[] = [];

    // Sobel kernels
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0, gy = 0;
        
        // Apply Sobel kernels
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const pixelIndex = ((y + ky) * width + (x + kx)) * 4;
            const gray = data[pixelIndex];
            const kernelIndex = (ky + 1) * 3 + (kx + 1);
            
            gx += gray * sobelX[kernelIndex];
            gy += gray * sobelY[kernelIndex];
          }
        }
        
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        
        // Use configurable threshold for edge detection
        if (magnitude > threshold) {
          edges.push({ x, y, magnitude });
        }
      }
    }

    return edges;
  }

  /**
   * Find contours from edge points using a simple flood-fill approach with configurable minimum size
   */
  private findContoursWithMinSize(edges: EdgePoint[], minSize: number = 50): number[][] {
    if (!this.imageData) return [];

    const width = this.imageData.width;
    const height = this.imageData.height;
    const visited = new Array(width * height).fill(false);
    const contours: number[][] = [];

    // Create edge map
    const edgeMap = new Array(width * height).fill(false);
    edges.forEach(edge => {
      edgeMap[edge.y * width + edge.x] = true;
    });

    // Find contours using flood fill
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        if (edgeMap[index] && !visited[index]) {
          const contour = this.floodFill(edgeMap, visited, x, y, width, height);
          if (contour.length > minSize) { // Filter out small contours based on configurable minimum size
            contours.push(contour);
          }
        }
      }
    }

    return contours;
  }

  /**
   * Flood fill algorithm to find connected edge points
   */
  private floodFill(edgeMap: boolean[], visited: boolean[], startX: number, startY: number, width: number, height: number): number[] {
    const stack = [{ x: startX, y: startY }];
    const contour: number[] = [];

    while (stack.length > 0) {
      const { x, y } = stack.pop()!;
      const index = y * width + x;

      if (x < 0 || x >= width || y < 0 || y >= height || visited[index] || !edgeMap[index]) {
        continue;
      }

      visited[index] = true;
      contour.push(x, y);

      // Add neighboring pixels to stack
      stack.push(
        { x: x + 1, y },
        { x: x - 1, y },
        { x, y: y + 1 },
        { x, y: y - 1 }
      );
    }

    return contour;
  }

  /**
   * Find rectangular shapes from contours using approximation with configurable confidence threshold
   */
  private findRectanglesWithThreshold(contours: number[][], confidenceThreshold: number = 0.2): { points: number[][], confidence: number, shape: 'rectangle' | 'square' }[] {
    const rectangles: { points: number[][], confidence: number, shape: 'rectangle' | 'square' }[] = [];

    contours.forEach(contour => {
      if (contour.length < 8) return; // Need at least 4 points

      // Convert contour to points array
      const points: number[][] = [];
      for (let i = 0; i < contour.length; i += 2) {
        points.push([contour[i], contour[i + 1]]);
      }

      // Approximate contour to polygon
      const approx = this.approximatePolygon(points);
      
      if (approx.length === 4) {
        // Check if it's roughly rectangular
        const isRectangular = this.isRectangular(approx);
        const confidence = this.calculateConfidence(approx, points);
        
        if (isRectangular && confidence > confidenceThreshold) {
          const shape = this.determineShape(approx);
          rectangles.push({ points: approx, confidence, shape });
        }
      }
    });

    // Sort by confidence and return top candidates
    return rectangles.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  }

  /**
   * Approximate contour to polygon using Douglas-Peucker algorithm
   */
  private approximatePolygon(points: number[][]): number[][] {
    if (points.length <= 4) return points;

    // Simple approximation - find extreme points
    let minX = points[0][0], maxX = points[0][0];
    let minY = points[0][1], maxY = points[0][1];
    let topLeft = points[0], topRight = points[0];
    let bottomLeft = points[0], bottomRight = points[0];

    points.forEach(point => {
      const [x, y] = point;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;

      // Find corner points
      if (x <= minX + 10 && y <= minY + 10) topLeft = point;
      if (x >= maxX - 10 && y <= minY + 10) topRight = point;
      if (x <= minX + 10 && y >= maxY - 10) bottomLeft = point;
      if (x >= maxX - 10 && y >= maxY - 10) bottomRight = point;
    });

    return [topLeft, topRight, bottomRight, bottomLeft];
  }

  /**
   * Check if four points form a roughly rectangular shape
   */
  private isRectangular(points: number[][]): boolean {
    if (points.length !== 4) return false;

    // Calculate angles between consecutive edges
    const angles: number[] = [];
    for (let i = 0; i < 4; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % 4];
      const p3 = points[(i + 2) % 4];
      
      const angle = this.calculateAngle(p1, p2, p3);
      angles.push(angle);
    }

    // Check if angles are roughly 90 degrees (within 30 degrees tolerance)
    const tolerance = 30;
    return angles.every(angle => Math.abs(angle - 90) < tolerance);
  }

  /**
   * Calculate angle between three points
   */
  private calculateAngle(p1: number[], p2: number[], p3: number[]): number {
    const v1 = [p1[0] - p2[0], p1[1] - p2[1]];
    const v2 = [p3[0] - p2[0], p3[1] - p2[1]];
    
    const dot = v1[0] * v2[0] + v1[1] * v2[1];
    const mag1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1]);
    const mag2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1]);
    
    const cosAngle = dot / (mag1 * mag2);
    return Math.acos(Math.max(-1, Math.min(1, cosAngle))) * (180 / Math.PI);
  }

  /**
   * Determine if shape is square or rectangle
   */
  private determineShape(points: number[][]): 'rectangle' | 'square' {
    const [topLeft, topRight, bottomRight, bottomLeft] = points;
    
    const width = Math.sqrt(
      Math.pow(topRight[0] - topLeft[0], 2) + Math.pow(topRight[1] - topLeft[1], 2)
    );
    const height = Math.sqrt(
      Math.pow(bottomLeft[0] - topLeft[0], 2) + Math.pow(bottomLeft[1] - topLeft[1], 2)
    );
    
    const aspectRatio = Math.max(width, height) / Math.min(width, height);
    return aspectRatio < 1.2 ? 'square' : 'rectangle';
  }

  /**
   * Calculate confidence score for detected rectangle
   */
  private calculateConfidence(approx: number[][], originalPoints: number[][]): number {
    const area = this.calculateArea(approx);
    const perimeter = this.calculatePerimeter(approx);
    
    // Calculate image dimensions for proper normalization
    const imageWidth = this.imageData?.width || 800;
    const imageHeight = this.imageData?.height || 600;
    const totalImageArea = imageWidth * imageHeight;
    
    // Calculate relative area (percentage of image)
    const relativeArea = area / totalImageArea;
    
    // Strong preference for larger rectangles (windows should be significant portion of image)
    // Minimum threshold: rectangles should be at least 5% of image area
    if (relativeArea < 0.05) {
      return 0; // Reject very small rectangles
    }
    
    // Size score with strong bias toward larger rectangles
    // Use logarithmic scaling to heavily favor larger areas
    const sizeScore = Math.min(1, Math.log(relativeArea * 20 + 1) / Math.log(21));
    
    // Regularity score (how rectangular the shape is)
    const regularityScore = this.calculateRegularity(approx);
    
    // Aspect ratio bonus for reasonable window proportions (not too thin)
    const aspectRatio = this.calculateAspectRatio(approx);
    const aspectScore = aspectRatio > 0.3 && aspectRatio < 3 ? 1 : 0.5;
    
    // Weighted combination: 60% size, 30% regularity, 10% aspect ratio
    const confidence = (sizeScore * 0.6) + (regularityScore * 0.3) + (aspectScore * 0.1);
    
    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Calculate area of polygon using shoelace formula
   */
  private calculateArea(points: number[][]): number {
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i][0] * points[j][1];
      area -= points[j][0] * points[i][1];
    }
    return Math.abs(area) / 2;
  }

  /**
   * Calculate perimeter of polygon
   */
  private calculatePerimeter(points: number[][]): number {
    let perimeter = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      const dx = points[j][0] - points[i][0];
      const dy = points[j][1] - points[i][1];
      perimeter += Math.sqrt(dx * dx + dy * dy);
    }
    return perimeter;
  }

  /**
   * Calculate how regular (close to perfect rectangle) the shape is
   */
  private calculateRegularity(points: number[][]): number {
    const angles: number[] = [];
    for (let i = 0; i < 4; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % 4];
      const p3 = points[(i + 2) % 4];
      const angle = this.calculateAngle(p1, p2, p3);
      angles.push(angle);
    }
    
    // Calculate deviation from 90 degrees
    const deviations = angles.map(angle => Math.abs(angle - 90));
    const avgDeviation = deviations.reduce((sum, dev) => sum + dev, 0) / deviations.length;
    
    // Convert to score (lower deviation = higher score)
    return Math.max(0, 1 - avgDeviation / 90);
  }

  /**
   * Calculate aspect ratio of rectangle (width/height)
   */
  private calculateAspectRatio(points: number[][]): number {
    if (points.length !== 4) return 1;
    
    const [topLeft, topRight, bottomLeft] = points;
    
    // Calculate width and height
    const width = Math.sqrt(
      Math.pow(topRight[0] - topLeft[0], 2) + Math.pow(topRight[1] - topLeft[1], 2)
    );
    const height = Math.sqrt(
      Math.pow(bottomLeft[0] - topLeft[0], 2) + Math.pow(bottomLeft[1] - topLeft[1], 2)
    );
    
    return Math.max(width, height) / Math.min(width, height);
  }

  /**
   * Convert detected rectangles to normalized window coordinates
   */
  private convertToWindowCoordinates(
    rectangles: { points: number[][], confidence: number, shape: 'rectangle' | 'square' }[],
    imageDimensions: { width: number; height: number }
  ): DetectionResult[] {
    return rectangles
      .filter(rect => this.isValidWindowCandidate(rect.points, imageDimensions))
      .map(rect => {
        const [topLeft, topRight, bottomRight, bottomLeft] = rect.points;
        
        const coordinates: WindowCoordinates = {
          topLeft: { x: topLeft[0] / imageDimensions.width, y: topLeft[1] / imageDimensions.height },
          topRight: { x: topRight[0] / imageDimensions.width, y: topRight[1] / imageDimensions.height },
          bottomLeft: { x: bottomLeft[0] / imageDimensions.width, y: bottomLeft[1] / imageDimensions.height },
          bottomRight: { x: bottomRight[0] / imageDimensions.width, y: bottomRight[1] / imageDimensions.height },
        };

        return {
          coordinates,
          confidence: rect.confidence,
          shape: rect.shape
        };
      });
  }

  /**
   * Check if rectangle is a valid window candidate
   */
  private isValidWindowCandidate(points: number[][], imageDimensions: { width: number; height: number }): boolean {
    const margin = Math.min(imageDimensions.width, imageDimensions.height) * 0.05; // 5% margin
    
    // Check if rectangle is too close to image edges
    for (const point of points) {
      if (point[0] < margin || point[0] > imageDimensions.width - margin ||
          point[1] < margin || point[1] > imageDimensions.height - margin) {
        return false;
      }
    }
    
    // Check if rectangle has reasonable proportions (not too thin)
    const aspectRatio = this.calculateAspectRatio(points);
    if (aspectRatio > 5) { // Too thin
      return false;
    }
    
    return true;
  }
}

/**
 * Convenience function to detect windows in an image
 */
export async function detectWindows(
  imageUrl: string, 
  imageDimensions: { width: number; height: number }
): Promise<DetectionResult[]> {
  const detector = new WindowDetector();
  return detector.detectWindow(imageUrl, imageDimensions);
}
