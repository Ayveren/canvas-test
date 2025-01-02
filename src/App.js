import React, { useEffect, useRef } from 'react';

const App = () => {
    const canvasRef = useRef(null);
    const ELEMENT_HEIGHT = 100; // Fixed height for all elements
    const TOTAL_ELEMENTS = 10000; // Total number of elements
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

        // Ensure the focused element is visible by adjusting the offsets
        if (x - offsetX < 0) {
            offsetX = x; // Move left
        } else if (x + elements[focusedIndex].width - offsetX > VIEWPORT_WIDTH) {
            offsetX = x + elements[focusedIndex].width - VIEWPORT_WIDTH; // Move right
        }
        if (y - offsetY < 0) {
            offsetY = y; // Move up
        } else if (y + ELEMENT_HEIGHT - offsetY > VIEWPORT_HEIGHT) {
            offsetY = y + ELEMENT_HEIGHT - VIEWPORT_HEIGHT; // Move down
        }

        // Translate the canvas to match the offset
        ctx.clearRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT); // Clear the canvas
        drawGrid(ctx); // Redraw the grid with updated offsets

        // Draw the focus box
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 3;
        ctx.strokeRect(x - offsetX, y - offsetY, elements[focusedIndex].width, ELEMENT_HEIGHT);
    };

    const handleKeyPress = (event) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (event.key === 'ArrowLeft' && focusedIndex > 0) {
            focusedIndex--;
        } else if (event.key === 'ArrowRight' && focusedIndex < TOTAL_ELEMENTS - 1) {
            focusedIndex++;
        } else if (event.key === 'ArrowUp') {
            const columnsPerRow = Math.floor(VIEWPORT_WIDTH / elements[0].width);
            focusedIndex = Math.max(focusedIndex - columnsPerRow, 0);
        } else if (event.key === 'ArrowDown') {
            const columnsPerRow = Math.floor(VIEWPORT_WIDTH / elements[0].width);
            focusedIndex = Math.min(focusedIndex + columnsPerRow, TOTAL_ELEMENTS - 1);
        }

        drawFocusBox(ctx); // Update the focus box and offsets
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
        };
    }, []);

    return <canvas ref={canvasRef} style={{ display: 'block' }}></canvas>;
};

export default App;
