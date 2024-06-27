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
    }
};

const createCard = (order) => {
    const card = document.createElement('section');
    card.className = 'card';
    card.draggable = true;
    const circleColor = getCircleColor(order.priority); // Função para obter a cor do círculo com base na criticidade

    card.innerHTML = `
        <div class="circle" style="background-color: ${circleColor};"></div>
        <strong>Ordem #${order.number} - ${order.tipo}</strong><br>
        <div class="card__description">${order.description}</div><br>
        <div>Manutentor: <span class="card__manutentor">${order.manutentor}</span></div><br>
        <em>Criticidade: ${order.priority}</em>
        <div>Maquina: <span class="card__maquina">${order.maquina}</span></div><br>
        <div class="qrcode"></div>
        <button class="card__delete">X</button>
        <button class="card__edit">Edit</button>
    `;

    // Botão de exclusão
    const deleteButton = card.querySelector('.card__delete');
    deleteButton.addEventListener('click', () => {
        card.remove();
        updateOrderCount();
    });

    // Botão de edição
    const editButton = card.querySelector('.card__edit');
    editButton.addEventListener('click', () => {
        editCard(card, order);
    });

    // Gerar QR Code
    const qrCodeDiv = card.querySelector('.qrcode');
    const qr = qrcode(0, 'H');
    qr.addData(`Numero da Ordem: ${order.number}\nTipo: ${order.tipo}\nDescricao: ${order.description}\nMaquina: ${order.maquina}\nCriticidade: ${order.priority}\nManutentor: ${order.manutentor}`);
    qr.make();
    qrCodeDiv.innerHTML = qr.createImgTag();

    // Evento de arrastar
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
        tipo: orderTipo.options[orderTipo.selectedIndex].text, // Seleciona o tipo de ordem de serviço
        description: orderDescription.value,
        priority: orderPriority.value,
        maquina: orderMaquina.options[orderMaquina.selectedIndex].text, // Correção para capturar o texto selecionado na dropdown de máquina
        manutentor: orderManutentor.options[orderManutentor.selectedIndex].text // Seleciona o Manutentor da opção selecionada
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

const editCard = (card, order) => {
    const cardDescription = card.querySelector('.card__description');
    const cardManutentor = card.querySelector('.card__manutentor');
    const cardMaquina = card.querySelector('.card__maquina');

    // Tornar os campos editáveis
    cardDescription.contentEditable = true;
    cardManutentor.contentEditable = true;
    cardMaquina.contentEditable = true;

    // Adicionar botão para salvar edições
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.className = 'card__save';
    card.appendChild(saveButton);

    saveButton.addEventListener('click', () => {
        // Atualizar os dados do pedido
        order.description = cardDescription.textContent;
        order.manutentor = cardManutentor.textContent;
        order.maquina = cardMaquina.textContent;

        // Regerar o QR Code
        const qrCodeDiv = card.querySelector('.qrcode');
        qrCodeDiv.innerHTML = '';
        const qr = qrcode(0, 'H');
        qr.addData(`Numero da Ordem: ${order.number}\nTipo: ${order.tipo}\nDescricao: ${order.description}\nMaquina: ${order.maquina}\nCriticidade: ${order.priority}\nManutentor: ${order.manutentor}`);
        qr.make();
        qrCodeDiv.innerHTML = qr.createImgTag();

        // Reverter os campos para não editáveis
        cardDescription.contentEditable = false;
        cardManutentor.contentEditable = false;
        cardMaquina.contentEditable = false;

        // Remover botão de salvar
        card.removeChild(saveButton);
    });
};

document.addEventListener('DOMContentLoaded', updateOrderCount);

document.addEventListener('dragover', dragOver);
document.addEventListener('dragenter', dragEnter);
document.addEventListener('dragleave', dragLeave);
document.addEventListener('drop', drop);

// Fim do script
