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
    updateOrderTypeChart(); // Atualiza o gráfico após mover o card
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
        updateOrderTypeChart(); // Atualiza o gráfico após o drop
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
        updateOrderTypeChart(); // Atualiza o gráfico após a exclusão do card
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
        const title = column.querySelector('.column__title');
        const cards = column.querySelectorAll('.card');
        title.textContent = `${title.getAttribute('data-title')} (${cards.length})`;
    });
};

const addOrder = (order) => {
    const card = createCard(order);
    todoColumn.appendChild(card);
    updateOrderCount();
    saveToLocalStorage(); // Salva após a adição de nova ordem
    updateOrderTypeChart(); // Atualiza o gráfico após a adição de nova ordem
};

document.getElementById('addOrderButton').addEventListener('click', () => {
    document.getElementById('orderForm').classList.toggle('hidden');
});

document.getElementById('orderForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const order = {
        number: orderNumber++,
        tipo: formData.get('orderTipo'),
        description: formData.get('orderDescription'),
        maquina: formData.get('orderMaquina'),
        priority: formData.get('orderPriority'),
        manutentor: formData.get('orderManutentor'),
    };
    addOrder(order);
    event.target.reset();
    document.getElementById('orderForm').classList.add('hidden');
});

const editCard = (card, order) => {
    const newDescription = prompt('Edit Description:', order.description);
    if (newDescription !== null) {
        card.querySelector('.card__description').textContent = newDescription;
        order.description = newDescription;
        saveToLocalStorage();
    }
    const newManutentor = prompt('Edit Manutentor:', order.manutentor);
    if (newManutentor !== null) {
        card.querySelector('.card__manutentor').textContent = newManutentor;
        order.manutentor = newManutentor;
        saveToLocalStorage();
    }
    const newMaquina = prompt('Edit Maquina:', order.maquina);
    if (newMaquina !== null) {
        card.querySelector('.card__maquina').textContent = newMaquina;
        order.maquina = newMaquina;
        saveToLocalStorage();
    }
};

const saveToLocalStorage = () => {
    const columns = document.querySelectorAll('.column__cards');
    const orders = {};

    columns.forEach(column => {
        const columnId = column.id;
        orders[columnId] = [];
        const cards = column.querySelectorAll('.card');
        cards.forEach(card => {
            const order = {
                number: card.querySelector('strong').textContent.split('#')[1].split(' - ')[0],
                tipo: card.querySelector('strong').textContent.split('- ')[1],
                description: card.querySelector('.card__description').textContent,
                maquina: card.querySelector('.card__maquina').textContent,
                priority: card.querySelector('.circle').style.backgroundColor,
                manutentor: card.querySelector('.card__manutentor').textContent,
            };
            orders[columnId].push(order);
        });
    });

    localStorage.setItem('orders', JSON.stringify(orders));
};

const loadFromLocalStorage = () => {
    const orders = JSON.parse(localStorage.getItem('orders'));
    if (orders) {
        Object.keys(orders).forEach(columnId => {
            orders[columnId].forEach(order => {
                const card = createCard(order);
                document.getElementById(columnId).appendChild(card);
            });
        });
        updateOrderCount();
    }
};

const columns = document.querySelectorAll('.column__cards');
columns.forEach(column => {
    column.addEventListener('dragover', dragOver);
    column.addEventListener('dragenter', dragEnter);
    column.addEventListener('dragleave', dragLeave);
    column.addEventListener('drop', drop);
});

loadFromLocalStorage();

const filterButtons = document.querySelectorAll('#filterButtons button');
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        const filter = button.id.replace('filter', '').toLowerCase();
        filterCards(filter);
    });
});

const filterCards = (priority) => {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        if (priority === 'clear') {
            card.style.display = 'block';
        } else {
            const cardPriority = card.querySelector('.circle').style.backgroundColor;
            if (getCircleColor(priority) === cardPriority) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        }
    });
};

const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');

searchButton.addEventListener('click', () => {
    const query = searchInput.value.toLowerCase();
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        const description = card.querySelector('.card__description').textContent.toLowerCase();
        const manutentor = card.querySelector('.card__manutentor').textContent.toLowerCase();
        const maquina = card.querySelector('.card__maquina').textContent.toLowerCase();
        if (description.includes(query) || manutentor.includes(query) || maquina.includes(query)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
});

searchInput.addEventListener('input', () => {
    if (searchInput.value === '') {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.style.display = 'block';
        });
    }
});

const orderTypeChartCtx = document.getElementById('orderTypeChart').getContext('2d');
let orderTypeChart = new Chart(orderTypeChartCtx, {
    type: 'pie',
    data: {
        labels: ['CO', 'CP', 'PR', 'PD'],
        datasets: [{
            label: 'Tipos de Ordem',
            data: [0, 0, 0, 0],
            backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56'],
            hoverOffset: 4
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.label}: ${context.raw} ordens`
                }
            }
        }
    }
});

const updateOrderTypeChart = () => {
    const counts = { 'CO': 0, 'CP': 0, 'PR': 0, 'PD': 0 };
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        const tipo = card.querySelector('strong').textContent.split('- ')[1];
        if (counts[tipo] !== undefined) {
            counts[tipo]++;
        }
    });
    orderTypeChart.data.datasets[0].data = [counts['CO'], counts['CP'], counts['PR'], counts['PD']];
    orderTypeChart.update();
};

updateOrderTypeChart();
