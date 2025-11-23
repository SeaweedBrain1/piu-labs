import { store } from './store.js';

const board = document.getElementById('board');
const cntSquares = document.getElementById('cntSquares');
const cntCircles = document.getElementById('cntCircles');

function createShapeElement(shape) {
    const element = document.createElement('div');
    element.className = `shape ${shape.type}`;
    element.dataset.id = shape.id;
    element.style.backgroundColor = shape.color;
    return element;
}

function render(shapes) {
    const existingIds = new Set(
        Array.from(board.children).map((c) => c.dataset.id)
    );

    shapes.forEach((s) => {
        if (!existingIds.has(s.id)) {
            board.appendChild(createShapeElement(s));
        } else {
            const element = board.querySelector(`[data-id="${s.id}"]`);
            if (element && element.style.backgroundColor !== s.color) {
                element.style.backgroundColor = s.color;
            }
        }
    });

    Array.from(board.children).forEach((child) => {
        if (!shapes.find((s) => s.id === child.dataset.id)) {
            board.removeChild(child);
        }
    });

    cntSquares.textContent = store.count('square');
    cntCircles.textContent = store.count('circle');
}

board.addEventListener('click', (e) => {
    const target = e.target.closest('.shape');
    if (!target) return;
    store.removeShape(target.dataset.id);
});

store.subscribe('shapes', render);
