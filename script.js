const columns = document.querySelectorAll(".column__cards");

let draggedCard;

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

const createCard = ({ target }) => {
    if (!target.classList.contains("column__cards")) return;

    const card = document.createElement("section");
    card.className = "card";
    card.draggable = "true";

    const cardContent = document.createElement("div");
    cardContent.className = "card__content";
    cardContent.contentEditable = "true";

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
    target.append(card);
    cardContent.focus();
};

const updateCardBackground = (card, column) => {
    if (column.parentElement.querySelector('.column__title').innerText === 'FINALIZADO') {
        card.style.backgroundColor = '#d4edda';
    } else {
        card.style.backgroundColor = '#fff';
    }
};

columns.forEach((column) => {
    column.addEventListener("dragover", dragOver);
    column.addEventListener("dragenter", dragEnter);
    column.addEventListener("dragleave", dragLeave);
    column.addEventListener("drop", drop);
    column.addEventListener("dblclick", createCard);
});
