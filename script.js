const todoColumn = document.getElementById('todoColumn');
const inProgressColumn = document.getElementById('inProgressColumn');
const reviewColumn = document.getElementById('reviewColumn');
const doneColumn = document.getElementById('doneColumn');

let orderNumber = 1;

const dragStart = (event) => {
    event.target.classList.add('dragging');
};

const dragEnd = (event) => {
    event.target.classList.remove('dragging');
};

const dragOver = (event) => {
    event.preventDefault();
};

const dragEnter = (event) => {
    event.preventDefault();
    const currentColumn = event.target.closest('.column__cards');
    if (currentColumn) {
        currentColumn.classList.add('column--highlight');
    }
};

const dragLeave = (event) => {
    const currentColumn = event.target.closest('.column__cards');
    if (currentColumn) {
        currentColumn.classList.remove('column--highlight');
    }
};

const drop = (event) => {
    event.preventDefault();
    const currentColumn = event.target.closest('.column__cards');
    const draggedCard = document.querySelector('.card.dragging');
    
    if (currentColumn && draggedCard) {
        currentColumn.appendChild(draggedCard);
        currentColumn.classList.remove('column--highlight');
        updateCardBackground(draggedCard, currentColumn);
        updateOrderCount();
    }
};

const createCard = (order) => {
    const card = document.createElement('section');
    card.className = 'card';
    card.draggable = true;
    const circleColor = getCircleColor(order.priority);
    card.innerHTML = `
        <div class="circle" style="background-color: ${circleColor};"></div>
        <div class="card-content">
            <strong>Ordem #${order.number}</strong><br>
            <div>${order.description}</div><br>
            <em>Criticidade: ${order.priority}</em>
        </div>
        <button class="card__delete">X</button>
        <button class="card__edit">Edit</button>
    `;

    const deleteButton = card.querySelector('.card__delete');
    deleteButton.addEventListener('click', () => {
        card.remove();
        updateOrderCount();
    });

    const editButton = card.querySelector('.card__edit');
    editButton.addEventListener('click', () => {
        const content = card.querySelector('.card-content');
        content.contentEditable = true;
        content.focus();
    });

    card.addEventListener('dragstart', dragStart);
    card.addEventListener('dragend', dragEnd);

    return card;
};

const getCircleColor = (priority) => {
    switch (priority) {
        case 'Baixo':
            return '#34d399'; // Verde para criticidade baixa
        case 'Médio':
            return '#60a5fa'; // Azul para criticidade média
        case 'Alto':
            return '#fbbf24'; // Amarelo para criticidade alta
        case 'Crítico':
            return '#d946ef'; // Roxo para criticidade crítica
        default:
            return '#ced4da'; // Cor padrão para qualquer outro caso
    }
};

const updateCardBackground = (card, column) => {
    const columnId = column.id;
    if (columnId === 'doneColumn') {
        card.style.backgroundColor = '#d4edda'; // Verde para coluna FINALIZADO
    } else {
        card.style.backgroundColor = '#fff'; // Cor padrão para outras colunas
    }
};

const updateOrderCount = () => {
    const columns = document.querySelectorAll('.column');
    columns.forEach(column => {
        const count = column.querySelectorAll('.card').length;
        const title = column.querySelector('.column__title');
        title.textContent = `${title.dataset.title} (${count})`;
    });
};

const addOrderButton = document.getElementById('addOrderButton');
const orderForm = document.getElementById('orderForm');
const searchButton = document.getElementById('searchButton');
const searchInput = document.getElementById('searchInput');
const filterLow = document.getElementById('filterLow');
const filterMedium = document.getElementById('filterMedium');
const filterHigh = document.getElementById('filterHigh');
const filterCritical = document.getElementById('filterCritical');
const clearFilter = document.getElementById('clearFilter');

addOrderButton.addEventListener('click', () => {
    orderForm.classList.toggle('hidden');
});

orderForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const order = {
        number: orderNumber,
        description: orderDescription.value,
        priority: orderPriority.value
    };
    const newCard = createCard(order);
    todoColumn.appendChild(newCard);
    orderNumber++;
    orderForm.reset();
    orderForm.classList.add('hidden');
    updateOrderCount();
});

searchButton.addEventListener('click', () => {
    const searchText = searchInput.value.toLowerCase().trim();
    if (!searchText) return;

    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => {
        const cardText = card.textContent.toLowerCase();
        if (cardText.includes(searchText)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
});

filterLow.addEventListener('click', () => filterByPriority('Baixo'));
filterMedium.addEventListener('click', () => filterByPriority('Médio'));
filterHigh.addEventListener('click', () => filterByPriority('Alto'));
filterCritical.addEventListener('click', () => filterByPriority('Crítico'));

clearFilter.addEventListener('click', () => {
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => {
        card.style.display = 'block';
    });
});

const filterByPriority = (priority) => {
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => {
        const cardPriority = card.querySelector('em').textContent.split(': ')[1];
        if (cardPriority === priority) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
};

document.addEventListener('DOMContentLoaded', updateOrderCount);

document.addEventListener('dragover', dragOver);
document.addEventListener('dragenter', dragEnter);
document.addEventListener('dragleave', dragLeave);
document.addEventListener('drop', drop);
