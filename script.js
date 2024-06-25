const columns = document.querySelectorAll(".column__cards");

let draggedCard;
let orderNumber = 1; // Starting order number

const dragStart = (event) => {
    draggedCard = event.target;
    event.dataTransfer.effectAllowed = "move";
};

const dragOver = (event) => {
    event.preventDefault();
};

const dragEnter = ({ target }) => {
    if (target.classList.contains("column__cards")) {
        target.classList.add("column--highlight");
    }
};

const dragLeave = ({ target }) => {
    target.classList.remove("column--highlight");
};

const drop = ({ target }) => {
    if (target.classList.contains("column__cards")) {
        target.classList.remove("column--highlight");
        target.append(draggedCard);
        updateCardBackground(draggedCard, target);
    }
};


const createCard = (order) => {
    const card = document.createElement("section");
    card.className = "card";
    card.draggable = "true";

    const cardContent = document.createElement("div");
    cardContent.className = "card__content";
    cardContent.innerHTML = `
        <strong>Ordem #${order.number}</strong><br>
        ${order.description}<br>
        <em>Criticidade: ${order.priority}</em>
    `;
    

    const deleteButton = document.createElement("button");
    deleteButton.className = "card__delete";
    deleteButton.innerText = "X";
    deleteButton.onclick = () => card.remove();

    const editButton = document.createElement("button");
    editButton.className = "card__edit";
    editButton.innerText = "Edit";
    editButton.onclick = () => {
        cardContent.contentEditable = "true";
        cardContent.focus();
    };

    cardContent.addEventListener("focusout", () => {
        cardContent.contentEditable = "false";
        if (!cardContent.textContent.trim()) card.remove();
    });

    card.addEventListener("dragstart", dragStart);

    card.append(deleteButton);
    card.append(editButton);
    card.append(cardContent);
    document.querySelector(".column__cards").append(card);
};

const updateCardBackground = (card, column) => {
    if (column.parentElement.querySelector('.column__title').innerText === 'FINALIZADO') {
        card.style.backgroundColor = '#d4edda';
    } else {
        card.style.backgroundColor = '#fff';
    }
};

const showOrderForm = () => {
    document.getElementById("orderNumber").value = orderNumber;
    document.getElementById("orderForm").classList.remove("hidden");
};

const hideOrderForm = () => {
    document.getElementById("orderForm").classList.add("hidden");
};

const handleOrderFormSubmit = (event) => {
    event.preventDefault();
    const order = {
        number: orderNumber,
        description: document.getElementById("orderDescription").value,
        priority: document.getElementById("orderPriority").value,
    };
    createCard(order);
    orderNumber++;
    hideOrderForm();
    document.getElementById("orderForm").reset();
};

document.getElementById("addOrderButton").addEventListener("click", showOrderForm);
document.getElementById("orderForm").addEventListener("submit", handleOrderFormSubmit);

columns.forEach((column) => {
    column.addEventListener("dragover", dragOver);
    column.addEventListener("dragenter", dragEnter);
    column.addEventListener("dragleave", dragLeave);
    column.addEventListener("drop", drop);
});
const removeEmptyCards = () => {
    document.querySelectorAll('.card').forEach(card => {
        if (!card.textContent.trim()) {
            card.remove();
        }
    });
};

window.addEventListener('beforeunload', removeEmptyCards);

const editPriority = () => {
    const priorities = ['Baixo', 'Médio', 'Alto', 'Crítico'];
    const prioritySelect = document.createElement('select');
    priorities.forEach(priority => {
        const option = document.createElement('option');
        option.value = priority;
        option.textContent = priority;
        prioritySelect.appendChild(option);
    });
    prioritySelect.value = order.priority;
    cardContent.insertBefore(prioritySelect, editButton);
    editButton.style.display = 'none';

    prioritySelect.addEventListener('change', () => {
        order.priority = prioritySelect.value;
        cardContent.removeChild(prioritySelect);
        editButton.style.display = 'inline';
        updateCardContent();
    });
};

const updateCardContent = () => {
    cardContent.innerHTML = `
        <strong>Ordem #${order.number}</strong><br>
        ${order.description}<br>
        <em>Criticidade: ${order.priority}</em>
    `;
};
const searchOrders = () => {
    const searchInput = document.getElementById('searchInput').value.trim().toLowerCase();
    document.querySelectorAll('.card').forEach(card => {
        const orderNumber = card.querySelector('strong').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();
        if (orderNumber.includes(searchInput) || description.includes(searchInput)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
};

document.getElementById('searchButton').addEventListener('click', searchOrders);
document.getElementById('searchInput').addEventListener('keyup', searchOrders);
const filterByPriority = (priority) => {
    document.querySelectorAll('.card').forEach(card => {
        const cardPriority = card.querySelector('em').textContent.split(': ')[1];
        if (cardPriority === priority) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
};

document.getElementById('filterLow').addEventListener('click', () => filterByPriority('Baixo'));
document.getElementById('filterMedium').addEventListener('click', () => filterByPriority('Medio'));
document.getElementById('filterHigh').addEventListener('click', () => filterByPriority('Alto'));
document.getElementById('filterCritical').addEventListener('click', () => filterByPriority('Critico'));

document.getElementById('clearFilter').addEventListener('click', () => {
    document.querySelectorAll('.card').forEach(card => {
        card.style.display = '';
    });
});

const updateOrderCount = () => {
    document.querySelectorAll('.column').forEach(column => {
        const count = column.querySelectorAll('.card').length;
        const title = column.querySelector('.column__title').textContent;
        column.querySelector('.column__title').textContent = `${title} (${count})`;
    });
};

// Chamar a função para atualizar a contagem inicialmente e sempre que necessário
updateOrderCount();
