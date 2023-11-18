import React, { useCallback, useEffect, useState } from 'react';

export type CanvasAnnotation = {
    type: 'rect';
    color: string;
    payload: {
        label: string;
        points: [number, number, number, number];
    };
};

export const Canvas = ({ url, annotations }: { url: string; annotations?: CanvasAnnotation[] }) => {
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
    const [canvasImageSize, setCanvasImageSize] = useState<[number, number] | null>(null);

    const drawImage = useCallback(
        (
            img: HTMLImageElement,
            canvas: HTMLCanvasElement,
            ctx: CanvasRenderingContext2D,
            setImageSize: boolean = false,
        ) => {
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
            if (setImageSize) {
                setCanvasImageSize([width, height]);
            }
        },
        [],
    );

    useEffect(() => {
        if (image && canvas && context) {
            drawImage(image, canvas, context, true);
        }
    }, [context, image, canvas]);

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

        console.log('Restoring Canvas Context');

        if (image && canvas && context) {
            drawImage(image, canvas, context);
        }

        for (let annotationsItem of annotations ?? []) {
            const label = annotationsItem.payload.label;

            if (annotationsItem.type === 'rect') {
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
                context.strokeStyle = annotationsItem.color;
                context.lineWidth = 2;
                context.strokeRect(x, y, width, height);
                if (label !== '') {
                    context.fillStyle = annotationsItem.color;
                    context.font = '14px Arial';
                    context.fillText(label, x, y);
                }
            }
        }
    }, [context, annotations, image, canvasImageSize]);

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
                    setCanvas(canvas);
                    if (!canvas) {
                        return;
                    }

                    const ctx = canvas.getContext('2d') ?? null;
                    setContext(ctx);
                    if (!ctx) {
                        return;
                    }
                }}
                src={url}
                alt="Original Image"
            />
        </>
    );
};
