document.addEventListener('DOMContentLoaded', () => {
    const board = document.querySelector('.kanban-board');
    const columns = document.querySelectorAll('.kanban-column');
    const columnLists = {
        todo: document.getElementById('todo-list'),
        'in-progress': document.getElementById('in-progress-list'),
        done: document.getElementById('done-list'),
    };
    const cardCounters = {
        todo: document.querySelector('#todo .card-count'),
        'in-progress': document.querySelector('#in-progress .card-count'),
        done: document.querySelector('#done .card-count'),
    };

    const generateId = () =>
        'card-' + new Date().getTime() + Math.floor(Math.random() * 1000);

    const getRandomColor = () => {
        const h = Math.floor(Math.random() * 360);
        return `hsl(${h}, 70%, 80%)`;
    };

    const createCardElement = (cardData) => {
        const card = document.createElement('div');
        card.className = 'kanban-card';
        card.dataset.id = cardData.id;
        card.style.backgroundColor = cardData.color;

        const title = document.createElement('h3');
        title.className = 'card-title';
        title.textContent = cardData.title;
        title.setAttribute('contentEditable', 'true');
        title.addEventListener('blur', handleCardUpdate);

        const content = document.createElement('h3');
        content.className = 'card-content';
        content.textContent = cardData.content;
        content.setAttribute('contentEditable', 'true');
        content.addEventListener('blur', handleCardUpdate);

        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'card-buttons';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'card-btn delete-card-btn';
        deleteBtn.innerHTML = '&times;';

        const moveLeftBtn = document.createElement('button');
        moveLeftBtn.className = 'card-btn move-btn-left';
        moveLeftBtn.innerHTML = '&#10132;';

        const moveRightBtn = document.createElement('button');
        moveRightBtn.className = 'card-btn move-btn-right';
        moveRightBtn.innerHTML = '&#10132;';

        const colorBtn = document.createElement('button');
        colorBtn.className = 'card-btn color-card-btn';
        colorBtn.innerHTML = '&#128396;';

        buttonsContainer.append(colorBtn, moveLeftBtn, moveRightBtn, deleteBtn);
        card.append(title, content, buttonsContainer);

        return card;
    };

    const updateCardCounters = () => {
        for (const columnId in columnLists) {
            const count = columnLists[columnId].children.length;
            cardCounters[columnId].textContent = count;
        }
    };

    const saveBoard = () => {
        const state = {
            todo: [],
            'in-progress': [],
            done: [],
        };

        for (const columnId in columnLists) {
            const cards =
                columnLists[columnId].querySelectorAll('.kanban-card');
            cards.forEach((card) => {
                state[columnId].push({
                    id: card.dataset.id,
                    title: card.querySelector('.card-title').textContent,
                    content: card.querySelector('.card-content').textContent,
                    color: card.style.backgroundColor,
                });
            });
        }

        localStorage.setItem('kanbanState', JSON.stringify(state));
        updateCardCounters();
    };

    const loadBoard = () => {
        const stateJSON = localStorage.getItem('kanbanState');
        if (!stateJSON) {
            updateCardCounters();
            return;
        }

        const state = JSON.parse(stateJSON);

        for (const columnId in columnLists) {
            columnLists[columnId].innerHTML = '';
        }

        for (const columnId in state) {
            state[columnId].forEach((cardData) => {
                const cardEl = createCardElement(cardData);
                columnLists[columnId].appendChild(cardEl);
            });
        }

        updateCardCounters();
    };

    const handleAddCard = (e) => {
        const columnList = e.target
            .closest('.kanban-column')
            .querySelector('.card-list');

        const newCardData = {
            id: generateId(),
            title: 'Tytuł zadania',
            content: 'Opis zadania',
            color: getRandomColor(),
        };

        const cardEl = createCardElement(newCardData);

        cardEl.classList.add('card-collapsed');

        columnList.appendChild(cardEl);

        saveBoard();

        setTimeout(() => {
            cardEl.classList.remove('card-collapsed');

            cardEl.querySelector('.card-title').focus();
        }, 40);
    };

    const handleColorColumn = (e) => {
        const columnList = e.target
            .closest('.kanban-column')
            .querySelector('.card-list');
        const cards = columnList.querySelectorAll('.kanban-card');

        cards.forEach((card) => {
            card.style.backgroundColor = getRandomColor();
        });

        saveBoard();
    };

    const handleSortColumn = (e) => {
        const columnList = e.target
            .closest('.kanban-column')
            .querySelector('.card-list');
        const cards = Array.from(columnList.querySelectorAll('.kanban-card'));

        const firstPositions = new Map();
        cards.forEach((card) => {
            firstPositions.set(card, card.getBoundingClientRect());
        });

        cards.sort((a, b) => {
            const titleA = a
                .querySelector('.card-title')
                .textContent.toLowerCase();
            const titleB = b
                .querySelector('.card-title')
                .textContent.toLowerCase();
            return titleA.localeCompare(titleB);
        });

        cards.forEach((card) => columnList.appendChild(card));

        cards.forEach((card) => {
            const lastPos = card.getBoundingClientRect();
            const firstPos = firstPositions.get(card);

            const deltaX = firstPos.left - lastPos.left;
            const deltaY = firstPos.top - lastPos.top;

            card.style.transition = 'transform 0s';
            card.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        });

        requestAnimationFrame(() => {
            cards.forEach((card) => {
                card.style.transition = 'transform 0.4s ease-out';
                card.style.transform = 'none';
            });
        });

        setTimeout(() => {
            cards.forEach((card) => {
                card.style.transition = '';
            });
        }, 400);

        saveBoard();
    };

    const handleCardActions = (e) => {
        const clickedEl = e.target;
        const card = clickedEl.closest('.kanban-card');

        if (!card) return;

        const currentColumn = card.closest('.kanban-column');

        if (clickedEl.classList.contains('delete-card-btn')) {
            card.classList.add('card-collapsed');

            setTimeout(() => {
                card.remove();
                saveBoard();
            }, 300);
        } else if (clickedEl.classList.contains('move-btn-right')) {
            const nextColumn = currentColumn.nextElementSibling;
            if (nextColumn) {
                card.classList.add('card-collapsed');

                setTimeout(() => {
                    nextColumn.querySelector('.card-list').appendChild(card);
                    saveBoard();

                    setTimeout(() => {
                        card.classList.remove('card-collapsed');
                    }, 10);
                }, 300);
            }
        } else if (clickedEl.classList.contains('move-btn-left')) {
            const prevColumn = currentColumn.previousElementSibling;
            if (prevColumn) {
                card.classList.add('card-collapsed');

                setTimeout(() => {
                    prevColumn.querySelector('.card-list').appendChild(card);
                    saveBoard();

                    setTimeout(() => {
                        card.classList.remove('card-collapsed');
                    }, 10);
                }, 300);
            }
        } else if (clickedEl.classList.contains('color-card-btn')) {
            card.style.backgroundColor = getRandomColor();
            saveBoard();
        }
    };

    const handleCardUpdate = (e) => {
        if (e.target.textContent.trim() === '') {
            if (e.target.classList.contains('card-title')) {
                e.target.textContent = 'Bez tytułu';
            } else if (e.target.classList.contains('card-content')) {
                e.target.textContent = 'Brak opisu';
            }
        }
        saveBoard();
    };

    board.addEventListener('click', handleCardActions);

    columns.forEach((column) => {
        column
            .querySelector('.add-card-btn')
            .addEventListener('click', handleAddCard);
        column
            .querySelector('.color-column-btn')
            .addEventListener('click', handleColorColumn);
        column
            .querySelector('.sort-column-btn')
            .addEventListener('click', handleSortColumn);
    });

    loadBoard();
});
