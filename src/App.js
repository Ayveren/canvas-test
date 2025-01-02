import React, { useEffect, useRef } from 'react';

const App = () => {
    const canvasRef = useRef(null);
    const ELEMENT_HEIGHT = 100; // Fixed height for all elements
    const TOTAL_ELEMENTS = 1000; // Total number of elements
    const VIEWPORT_WIDTH = window.innerWidth; // Canvas width
    const VIEWPORT_HEIGHT = window.innerHeight; // Canvas height
    const elements = [];

    // Generate grid elements with random widths
    for (let i = 0; i < TOTAL_ELEMENTS; i++) {
        elements.push({
            width: Math.random() * 200 + 50, // Width between 50 and 250
            color: `hsl(${Math.random() * 360}, 70%, 70%)`, // Random color
        });
    }

    let focusedIndex = 0; // Currently focused element
    let offsetX = 0; // Horizontal scroll offset
    let offsetY = 0; // Vertical scroll offset
    let animationFrameId = null;

    const drawGrid = (ctx) => {
        let x = -offsetX;
        let y = -offsetY;

        ctx.clearRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT); // Clear the canvas

        // Draw visible grid elements
        for (let i = 0; i < TOTAL_ELEMENTS; i++) {
            const element = elements[i];

            // Stop drawing if the element is out of the viewport
            if (y > VIEWPORT_HEIGHT) break;

            if (x + element.width > 0 && y + ELEMENT_HEIGHT > 0) {
                ctx.fillStyle = element.color;
                ctx.fillRect(x, y, element.width, ELEMENT_HEIGHT);
                ctx.strokeStyle = 'black';
                ctx.strokeRect(x, y, element.width, ELEMENT_HEIGHT);

                // Draw the index inside the element
                ctx.fillStyle = 'black';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(
                    i,
                    x + element.width / 2,
                    y + ELEMENT_HEIGHT / 2
                );
            }

            x += element.width;
            if (x >= VIEWPORT_WIDTH) {
                x = -offsetX;
                y += ELEMENT_HEIGHT;
            }
        }
    };

    const drawFocusBox = (ctx) => {
        let x = 0;
        let y = 0;

        // Calculate the position of the focused element
        for (let i = 0; i < focusedIndex; i++) {
            x += elements[i].width;
            if (x >= VIEWPORT_WIDTH) {
                x = 0;
                y += ELEMENT_HEIGHT;
            }
        }

        // Draw the focus box
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 3;
        ctx.strokeRect(x - offsetX, y - offsetY, elements[focusedIndex].width, ELEMENT_HEIGHT);
    };

    const animateFocus = (newOffsetX, newOffsetY, newIndex) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const startOffsetX = offsetX;
        const startOffsetY = offsetY;
        const duration = 300; // Animation duration in ms
        const startTime = performance.now();

        const animate = (time) => {
            const elapsed = time - startTime;
            const progress = Math.min(elapsed / duration, 1);

            offsetX = startOffsetX + (newOffsetX - startOffsetX) * progress;
            offsetY = startOffsetY + (newOffsetY - startOffsetY) * progress;

            drawGrid(ctx); // Redraw the grid with updated offsets
            focusedIndex = newIndex; // Update the focused index
            drawFocusBox(ctx); // Draw the focus box

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animate);
            }
        };

        cancelAnimationFrame(animationFrameId); // Cancel any previous animation
        animationFrameId = requestAnimationFrame(animate);
    };

    const handleKeyPress = (event) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        let newOffsetX = offsetX;
        let newOffsetY = offsetY;
        let newIndex = focusedIndex;

        let x = 0;
        let y = 0;

        // Calculate current position of the focused element
        for (let i = 0; i < focusedIndex; i++) {
            x += elements[i].width;
            if (x >= VIEWPORT_WIDTH) {
                x = 0;
                y += ELEMENT_HEIGHT;
            }
        }

        // Move focus and calculate new offsets
        if (event.key === 'ArrowLeft' && focusedIndex > 0) {
            newIndex--;
            newOffsetX = Math.max(offsetX - elements[newIndex].width, 0);
        } else if (event.key === 'ArrowRight' && focusedIndex < TOTAL_ELEMENTS - 1) {
            newIndex++;
            newOffsetX = offsetX + elements[focusedIndex].width;
        } else if (event.key === 'ArrowUp') {
            const columnsPerRow = Math.floor(VIEWPORT_WIDTH / elements[0].width);
            newIndex = Math.max(focusedIndex - columnsPerRow, 0);
            newOffsetY = Math.max(offsetY - ELEMENT_HEIGHT, 0);
        } else if (event.key === 'ArrowDown') {
            const columnsPerRow = Math.floor(VIEWPORT_WIDTH / elements[0].width);
            newIndex = Math.min(focusedIndex + columnsPerRow, TOTAL_ELEMENTS - 1);
            newOffsetY = offsetY + ELEMENT_HEIGHT;
        }

        animateFocus(newOffsetX, newOffsetY, newIndex);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        canvas.width = VIEWPORT_WIDTH;
        canvas.height = VIEWPORT_HEIGHT;

        drawGrid(ctx); // Draw the grid once
        drawFocusBox(ctx); // Draw the initial focus box

        window.addEventListener('keydown', handleKeyPress);

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            cancelAnimationFrame(animationFrameId); // Cancel any running animation
        };
    }, []);

    return <canvas ref={canvasRef} style={{ display: 'block' }}></canvas>;
};

export default App;
