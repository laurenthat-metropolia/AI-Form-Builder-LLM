import React, { useRef, useEffect, useState } from 'react';

export type CanvasAnnotation =
    | {
          type: 'polygon';
          payload: {
              label: string;
              points: [number, number][];
          };
      }
    | {
          type: 'rect';
          payload: {
              label: string;
              points: [number, number, number, number];
          };
      };

export const Canvas = ({ url, annotations }: { url: string; annotations?: CanvasAnnotation[] }) => {
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [canvasImageSize, setCanvasImageSize] = useState<[number, number] | null>(null);

    const draw = (ctx: CanvasRenderingContext2D, frameCount: any) => {
        // console.log('draw');
        // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        // ctx.fillStyle = '#000000';
        // ctx.beginPath();
        // ctx.arc(50, 100, 20 * Math.sin(frameCount * 0.05) ** 2, 0, 2 * Math.PI);
        // ctx.fill();
    };

    useEffect(() => {
        if (!context) {
            return;
        }
        if (!image) {
            return;
        }
        if (!canvasImageSize) {
            return;
        }
        const convertX = (x: number) => (x * canvasImageWidth) / image.naturalWidth;
        const convertY = (y: number) => (y * canvasImageHeight) / image.naturalHeight;
        const [canvasImageWidth, canvasImageHeight] = canvasImageSize;
        for (let annotationsItem of annotations ?? []) {
            if (annotationsItem.type === 'polygon') {
                const points = annotationsItem.payload.points;
                const label = annotationsItem.payload.label;

                const coordinates = points.map(([x, y]): [number, number] => {
                    return [convertX(x), convertY(y)];
                });

                // Set the polygon's stroke color and line width
                context.strokeStyle = 'blue';
                context.lineWidth = 2;

                // Start the path
                context.beginPath();

                // Move to the first point
                context.moveTo(coordinates[0][0], coordinates[0][1]);

                // Draw lines to the remaining points to form the polygon
                for (let i = 1; i < coordinates.length; i++) {
                    context.lineTo(coordinates[i][0], coordinates[i][1]);
                }

                // Close the path to complete the polygon
                context.closePath();

                // Use stroke() to draw the polygon outline
                context.stroke();
            } else if (annotationsItem.type === 'rect') {
                const points = annotationsItem.payload.points;
                const normalizedPoints: [number, number, number, number] = [
                    convertX(points[0]),
                    convertY(points[1]),
                    convertX(points[2]),
                    convertY(points[3]),
                ];
                const x = normalizedPoints[0];
                const y = normalizedPoints[1];
                const width = normalizedPoints[2] - x;
                const height = normalizedPoints[3] - y;
                context.strokeStyle = 'red';
                context.lineWidth = 2;
                context.strokeRect(x, y, width, height);

                const label = annotationsItem.payload.label;
            }
        }
        console.log('drawing now...');
        console.log({ context, annotations });
    }, [draw, context, annotations, image, canvasImageSize]);

    return (
        <>
            <canvas id="canvas" width={500} height={667} />

            <img
                className="absolute invisible"
                id="preview_image"
                onLoad={(ev) => {
                    console.log('Image loaded ');
                    const img = ev.currentTarget;
                    setImage(img);

                    const canvas = document.getElementById('canvas') as HTMLCanvasElement | null;
                    if (!canvas) {
                        return;
                    }

                    const ctx = canvas.getContext('2d') ?? null;
                    if (!ctx) {
                        return;
                    }
                    setContext(ctx);

                    // Calculate the aspect ratio of the image
                    const aspectRatio = img.width / img.height;
                    console.log(img.naturalWidth, img.naturalHeight);
                    // Calculate the width and height of the image to fit within the canvas
                    let width = canvas.width;
                    let height = width / aspectRatio;

                    // If the height is too large, adjust the width and height
                    if (height > canvas.height) {
                        height = canvas.height;
                        width = height * aspectRatio;
                    }

                    // Clear the canvas
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    // Draw the image on the canvas
                    ctx.drawImage(img, 0, 0, width, height);
                    setCanvasImageSize([width, height]);
                }}
                src={url}
                alt="Original Image"
            />
        </>
    );
};
