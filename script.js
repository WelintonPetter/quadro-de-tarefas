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

    // Define a cor de fundo do card com base na prioridade
    if (order.priority === 'Crítico') {
        card.style.backgroundColor = '#ff4d506b'; // Vermelho para criticidade crítica
    } else {
        card.style.backgroundColor = '#fff'; // Branco para outras prioridades
    }

    card.innerHTML = `
        <div class="circle" style="background-color: ${circleColor}; width: 20px; height: 20px; border-radius: 50%;"></div>
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
    const columnId = column.id; // Obtém o ID da coluna

    // Verifica se a coluna é a 'doneColumn' (coluna de concluídos)
    if (columnId === 'doneColumn') {
        card.style.backgroundColor = '#d4edda'; // Define a cor de fundo verde claro para cartões concluídos
    } 
    // Verifica se a coluna é a 'reviewColumn' (coluna de revisão)
    else if (columnId === 'reviewColumn') {
        card.style.backgroundColor = '#fcf8099c'; // Define a cor de fundo para cartões em revisão
    } 
    // Caso contrário, define o fundo branco
    else {
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
    document.getElementById('orderForm').classList.add('hidden'); // Fecha o formulário após adicionar a ordem
};

document.getElementById('addOrderButton').addEventListener('click', () => {
    const orderForm = document.getElementById('orderForm');
    orderForm.classList.toggle('hidden');
});

// Ensure form closes after order is added
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
    const orderForm = document.getElementById('orderForm');
    orderForm.classList.add('hidden');
    const addOrderButton = document.getElementById('addOrderButton');
    addOrderButton.classList.toggle('hidden');
});

const editCard = (card, order) => {
    const newDescription = prompt('Edit Description:', order.description);
    if (newDescription !== null) {
        card.querySelector('.card__description').textContent = newDescription;
        order.description = newDescription;
    }

    const newManutentor = prompt('Edit Manutentor:', order.manutentor);
    if (newManutentor !== null) {
        card.querySelector('.card__manutentor').textContent = newManutentor;
        order.manutentor = newManutentor;
    }

    const newMaquina = prompt('Edit Maquina:', order.maquina);
    if (newMaquina !== null) {
        card.querySelector('.card__maquina').textContent = newMaquina;
        order.maquina = newMaquina;
    }

    // Regenerate QR code
    const qrCodeDiv = card.querySelector('.qrcode');
    const qr = qrcode(0, 'H');
    qr.addData(`Numero da Ordem: ${order.number}\nTipo: ${order.tipo}\nDescricao: ${order.description}\nMaquina: ${order.maquina}\nCriticidade: ${order.priority}\nManutentor: ${order.manutentor}`);
    qr.make();
    qrCodeDiv.innerHTML = qr.createImgTag();

    // Update circle color
    const circleColor = getCircleColor(order.priority);
    card.querySelector('.circle').style.backgroundColor = circleColor;

    saveToLocalStorage();
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

    // Save the current orderNumber
    localStorage.setItem('orderNumber', orderNumber);
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

    // Load the orderNumber
    const savedOrderNumber = localStorage.getItem('orderNumber');
    if (savedOrderNumber) {
        orderNumber = parseInt(savedOrderNumber, 10);
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
            const cardCircle = card.querySelector('.circle');
            const cardPriorityColor = cardCircle.style.backgroundColor;
            const filterColor = getCircleColor(priority);

            // Compare colors by converting them to lower case
            if (cardPriorityColor === filterColor) {
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

// Get modal elements
const chartModal = document.getElementById('chartModal');
const closeModal = document.querySelector('.close');

// Function to open the chart modal and generate chart
const openChartModal = () => {
    chartModal.classList.remove('hidden');
    chartModal.style.display = 'flex';
    generateOrderTypeChart();
};

// Function to close the chart modal
const closeChartModal = () => {
    chartModal.classList.add('hidden');
    chartModal.style.display = 'none';
};

// Add event listener to the "Gráficos" button
document.getElementById('graphicButton').addEventListener('click', openChartModal);

// Add event listener to the close button in the modal
closeModal.addEventListener('click', closeChartModal);

// Function to generate the order type chart


// Close the modal if clicked outside the modal content
window.addEventListener('click', (event) => {
    if (event.target === chartModal) {
        closeChartModal();
    }
});

const chartTypeSelector = document.getElementById('chartTypeSelector');
const dataTypeSelector = document.getElementById('dataTypeSelector');
let currentChart;

const getPriorityLabel = (color) => {
    switch (color) {
        case '#34d399':
            return 'Baixo';
        case '#60a5fa':
            return 'Médio';
        case '#fbbf24':
            return 'Alto';
        case '#d946ef':
            return 'Crítico';
        default:
            return 'Desconhecido';
    }
};

const generateOrderTypeChart = () => {
    const ctx = document.getElementById('orderTypeChart').getContext('2d');
    const orders = JSON.parse(localStorage.getItem('orders'));
    let data;
    let labels;

    switch (dataTypeSelector.value) {
        
        case 'orderPriority':
            const orderPriorities = { 'Baixo': 0, 'Médio': 0, 'Alto': 0, 'Crítico': 0 };
            if (orders) {
                Object.keys(orders).forEach(columnId => {
                    orders[columnId].forEach(order => {
                        const priorityLabel = getPriorityLabel(order.priority);
                        if (orderPriorities[priorityLabel] !== undefined) {
                            orderPriorities[priorityLabel]++;
                        }
                    });
                });
            }
            labels = Object.keys(orderPriorities);
            data = Object.values(orderPriorities);
            break;

            
           

    

            case 'orderManutentor':
                const manutentors = {};
                if (orders) {
                    Object.keys(orders).forEach(columnId => {
                        orders[columnId].forEach(order => {
                            if (manutentors[order.manutentor]) {
                                manutentors[order.manutentor]++;
                            } else {
                                manutentors[order.manutentor] = 1;
                            }
                        });
                    });
                }
                labels = Object.keys(manutentors);
                data = Object.values(manutentors);
                break;
            

        case 'orderStage':
            const orderStages = { 'Para Fazer': 0, 'Em Andamento': 0, 'Para Rever': 0, 'Finalizado': 0 };
            if (orders) {
                Object.keys(orders).forEach(columnId => {
                    switch (columnId) {
                        case 'todoColumn':
                            orderStages['Para Fazer'] += orders[columnId].length;
                            break;
                        case 'inProgressColumn':
                            orderStages['Em Andamento'] += orders[columnId].length;
                            break;
                        case 'reviewColumn':
                            orderStages['Para Rever'] += orders[columnId].length;
                            break;
                        case 'doneColumn':
                            orderStages['Finalizado'] += orders[columnId].length;
                            break;
                    }
                });
            }
            labels = Object.keys(orderStages);
            data = Object.values(orderStages);
            break;

        default:
            const orderTypes = { 'Corretiva': 0, 'CorretivaProgramada': 0, 'Preventiva': 0, 'Preditiva': 0 };
            if (orders) {
                Object.keys(orders).forEach(columnId => {
                    orders[columnId].forEach(order => {
                        orderTypes[order.tipo]++;
                    });
                });
            }
            labels = Object.keys(orderTypes);
            data = Object.values(orderTypes);
            break;
    }

    const chartData = {
        labels: labels,
        datasets: [{
            label: dataTypeSelector.options[dataTypeSelector.selectedIndex].text,
            data: data,
            backgroundColor: ['#34d399', '#60a5fa', '#fbbf24', '#d946ef'],
            borderColor: ['#34d399', '#60a5fa', '#fbbf24', '#d946ef'],
            borderWidth: 1
        }]
    };

    const config = {
        type: chartTypeSelector.value,
        data: chartData,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    };

    if (currentChart) {
        currentChart.destroy();
    }
    currentChart = new Chart(ctx, config);
};




chartTypeSelector.addEventListener('change', generateOrderTypeChart);
dataTypeSelector.addEventListener('change', generateOrderTypeChart);



document.getElementById('graphicButton').addEventListener('click', openChartModal);
closeModal.addEventListener('click', closeChartModal);

window.addEventListener('click', (event) => {
    if (event.target === chartModal) {
        closeChartModal();
    }
});



