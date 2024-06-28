// Início do script

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
    saveToLocalStorage(); // Salva após mover o card
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
        saveToLocalStorage(); // Salva após o drop
    }
};

const createCard = (order) => {
    const card = document.createElement('section');
    card.className = 'card';
    card.draggable = true;
    const circleColor = getCircleColor(order.priority);

    card.innerHTML = `
        <div class="circle" style="background-color: ${circleColor};"></div>
        <strong>Ordem #${order.number} - ${order.tipo}</strong><br>
        <div class="card__description" contenteditable>${order.description}</div><br>
        <div>Manutentor: <span class="card__manutentor" contenteditable>${order.manutentor}</span></div><br>
        <div>Maquina: <span class="card__maquina" contenteditable>${order.maquina}</span></div><br>
        <div class="qrcode"></div>
        <button class="card__delete">X</button>
        <button class="card__edit">Edit</button>
    `;

    const deleteButton = card.querySelector('.card__delete');
    deleteButton.addEventListener('click', () => {
        card.remove();
        updateOrderCount();
        saveToLocalStorage(); // Salva após a exclusão do card
    });

    const editButton = card.querySelector('.card__edit');
    editButton.addEventListener('click', () => {
        editCard(card, order);
    });

    const qrCodeDiv = card.querySelector('.qrcode');
    const qr = qrcode(0, 'H');
    qr.addData(`Numero da Ordem: ${order.number}\nTipo: ${order.tipo}\nDescricao: ${order.description}\nMaquina: ${order.maquina}\nCriticidade: ${order.priority}\nManutentor: ${order.manutentor}`);
    qr.make();
    qrCodeDiv.innerHTML = qr.createImgTag();

    card.addEventListener('dragstart', dragStart);
    card.addEventListener('dragend', dragEnd);

    return card;
};

const getCircleColor = (priority) => {
    switch (priority) {
        case 'Baixo':
            return '#34d399';
        case 'Médio':
            return '#60a5fa';
        case 'Alto':
            return '#fbbf24';
        case 'Crítico':
            return '#d946ef';
        default:
            return '#ced4da';
    }
};

const updateCardBackground = (card, column) => {
    const columnId = column.id;
    if (columnId === 'doneColumn') {
        card.style.backgroundColor = '#d4edda';
    } else {
        card.style.backgroundColor = '#fff';
    }
};

const updateOrderCount = () => {
    const columns = document.querySelectorAll('.column');
    columns.forEach(column => {
        const count = column.querySelectorAll('.card').length;
        const title = column.querySelector('.column__title');
        title.textContent = `${title.dataset.title} (${count})`;
    });

    updateReportsAndStatistics(); // Atualiza os relatórios e estatísticas após contar as ordens
};

const saveToLocalStorage = () => {
    const columns = ['todoColumn', 'inProgressColumn', 'reviewColumn', 'doneColumn'];
    const orders = columns.map(columnId => {
        const column = document.getElementById(columnId);
        const cards = Array.from(column.querySelectorAll('.card')).map(card => ({
            number: parseInt(card.querySelector('strong').textContent.split('#')[1].split(' - ')[0]),
            tipo: card.querySelector('strong').textContent.split(' - ')[1],
            description: card.querySelector('.card__description').textContent,
            priority: getPriorityFromColor(card.querySelector('.circle').style.backgroundColor),
            maquina: card.querySelector('.card__maquina').textContent,
            manutentor: card.querySelector('.card__manutentor').textContent
        }));
        return { columnId, cards };
    });
    localStorage.setItem('orders', JSON.stringify(orders));
};

const loadFromLocalStorage = () => {
    const orders = JSON.parse(localStorage.getItem('orders'));
    if (orders) {
        orders.forEach(({ columnId, cards }) => {
            const column = document.getElementById(columnId);
            column.innerHTML = ''; // Limpa a coluna antes de adicionar cards
            cards.forEach(order => {
                const newCard = createCard(order);
                column.appendChild(newCard);
            });
        });
        updateOrderCount();
    }
};

const editCard = (card, order) => {
    const description = card.querySelector('.card__description');
    const manutentor = card.querySelector('.card__manutentor');
    const maquina = card.querySelector('.card__maquina');

    description.contentEditable = true;
    manutentor.contentEditable = true;
    maquina.contentEditable = true;

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.classList.add('card__save');

    saveButton.addEventListener('click', () => {
        description.contentEditable = false;
        manutentor.contentEditable = false;
        maquina.contentEditable = false;

        order.description = description.textContent;
        order.manutentor = manutentor.textContent;
        order.maquina = maquina.textContent;

        const qrCodeDiv = card.querySelector('.qrcode');
        const qr = qrcode(0, 'H');
        qr.addData(`Numero da Ordem: ${order.number}\nTipo: ${order.tipo}\nDescricao: ${order.description}\nMaquina: ${order.maquina}\nCriticidade: ${order.priority}\nManutentor: ${order.manutentor}`);
        qr.make();
        qrCodeDiv.innerHTML = qr.createImgTag();

        saveButton.remove();
        saveToLocalStorage(); // Salva após a edição do card
    });

    card.appendChild(saveButton);
};

const getPriorityFromColor = (color) => {
    switch (color) {
        case 'rgb(52, 211, 153)':
            return 'Baixo';
        case 'rgb(96, 165, 250)':
            return 'Médio';
        case 'rgb(251, 191, 36)':
            return 'Alto';
        case 'rgb(217, 70, 239)':
            return 'Crítico';
        default:
            return 'Desconhecido';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    updateReportsAndStatistics();
});

document.addEventListener('dragover', dragOver);
document.addEventListener('dragenter', dragEnter);
document.addEventListener('dragleave', dragLeave);
document.addEventListener('drop', drop);

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
        tipo: orderTipo.options[orderTipo.selectedIndex].text,
        description: orderDescription.value,
        priority: orderPriority.value,
        maquina: orderMaquina.options[orderMaquina.selectedIndex].text,
        manutentor: orderManutentor.options[orderManutentor.selectedIndex].text
    };
    const newCard = createCard(order);
    todoColumn.appendChild(newCard);
    orderNumber++;
    orderForm.reset();
    orderForm.classList.add('hidden');
    updateOrderCount();
    saveToLocalStorage(); // Salva após adicionar nova ordem
});

searchButton.addEventListener('click', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        const description = card.querySelector('.card__description').textContent.toLowerCase();
        if (description.includes(searchTerm)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
});

const filterCardsByPriority = (priority) => {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        const cardPriority = getPriorityFromColor(card.querySelector('.circle').style.backgroundColor);
        if (cardPriority === priority) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
};

filterLow.addEventListener('click', () => filterCardsByPriority('Baixo'));
filterMedium.addEventListener('click', () => filterCardsByPriority('Médio'));
filterHigh.addEventListener('click', () => filterCardsByPriority('Alto'));
filterCritical.addEventListener('click', () => filterCardsByPriority('Crítico'));
clearFilter.addEventListener('click', () => {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.style.display = '';
    });
});
