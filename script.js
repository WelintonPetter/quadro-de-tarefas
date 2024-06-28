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
        saveToLocalStorage();
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
        <div class="card__description">${order.description}</div><br>
        <div>Manutentor: <span class="card__manutentor">${order.manutentor}</span></div><br>
        <div>Maquina: <span class="card__maquina">${order.maquina}</span></div><br>
        <div class="qrcode"></div>
        <button class="card__delete">X</button>
        <button class="card__edit">Edit</button>
    `;

    const deleteButton = card.querySelector('.card__delete');
    deleteButton.addEventListener('click', () => {
        card.remove();
        updateOrderCount();
        saveToLocalStorage();
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

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.classList.add('card__save');

    card.appendChild(saveButton);

    description.contentEditable = true;
    manutentor.contentEditable = true;
    maquina.contentEditable = true;

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
        saveToLocalStorage();
    });
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
    saveToLocalStorage();
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
        const cardPriority = getPriorityFromColor(card.querySelector('.circle').style.backgroundColor);
        if (cardPriority === priority) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
};

const updateReportsAndStatistics = () => {
    renderStatusDistributionChart();
    renderPriorityCounts();
    // Adicione mais funções de relatórios conforme necessário
};

const renderPriorityCounts = () => {
    const counts = countByPriority();
    const priorityCountsContainer = document.getElementById('priorityCountsContainer');
    priorityCountsContainer.innerHTML = '';

    Object.keys(counts).forEach(priority => {
        const count = counts[priority];
        const priorityItem = document.createElement('div');
        priorityItem.textContent = `${priority}: ${count}`;
        priorityCountsContainer.appendChild(priorityItem);
    });
};

const countByPriority = () => {
    const counts = {
        Baixo: 0,
        Médio: 0,
        Alto: 0,
        Crítico: 0
    };

    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => {
        const priority = getPriorityFromColor(card.querySelector('.circle').style.backgroundColor);
        counts[priority]++;
    });

    return counts;
};

const renderStatusDistributionChart = () => {
    const columns = document.querySelectorAll('.column');
    const data = [];

    columns.forEach(column => {
        const count = column.querySelectorAll('.card').length;
        data.push(count);
    });

    const ctx = document.getElementById('statusDistributionChart').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['A Fazer', 'Em Progresso', 'Revisão', 'Concluído'],
            datasets: [{
                label: 'Distribuição por Estado',
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(75, 192, 192, 0.5)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Distribuição de Tarefas por Estado'
                }
            }
        }
    });
};

// Fim do script
