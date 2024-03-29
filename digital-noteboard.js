const modalContainer = document.querySelector(".modal-container"),
  noteContainer = document.querySelector(".note-container"),
  tagContainer = document.querySelector(".tag-container"),
  form = document.querySelector("form");
let pinnedTags = [];
let typeData = document.getElementById("typeData");

class Note {
  constructor(title, type, tags, data) {
    this.title = title;
    this.type = type;
    this.tags = tags;
    this.data = data;
    this.date = new Date().toLocaleDateString("en-US");
    this.id = Math.random();
  }
}

class Tag {
  constructor(name, color) {
    this.name = name;
    this.color = color;
    this.id = Math.random();
  }
}

// Create Note
function addNotetoBoard(newNote) {
  const newNoteUI = document.createElement("div");
  requestAnimationFrame(() => {
    newNoteUI.classList.add("note");
  });
  newNoteUI.innerHTML = `
    <span hidden>${newNote.id}</span>
    <button type="button" class="note-delete-btn">&times;</button>
    <p class="note-title">${newNote.title}</p>`;

  if (newNote.type === "text") {
    newNoteUI.innerHTML += `<div class="note-data"><p>${newNote.data}</p></div>`;
  } else if (newNote.type === "drawing") {
    newNoteUI.innerHTML += `<div class="note-data"><img src="${newNote.data}" alt="${newNote.title}_${newNote.id}.jpg" style="width: 100%; margin-top: 20px"/></div>`;
  }

  let appendTags = "";
  newNote.tags.forEach((e) => {
    appendTags += `<div class="note-tag"><span hidden>${e.id}</span>
      <div class="tag-name-note" style="background-color:${e.color}">
      ${e.name}
      </div></div>`;
  });

  newNoteUI.innerHTML +=
    `<div class="property-container">` +
    appendTags +
    `<p style="margin: 0.7rem 0 0 0; color: grey;">${newNote.date}</p></div>`;

  noteContainer.appendChild(newNoteUI);
}

// Note Buttons
noteContainer.addEventListener("click", (e) => {
  const currentNote = e.target.closest(".note");
  if (e.target.classList.contains("note-delete-btn")) {
    // Delete Note
    const currentID = currentNote.querySelector("span").textContent;
    currentNote.classList.add("note-delete");
    setTimeout(() => {
      currentNote.remove();
      removeNote(Number(currentID));
    }, 200);
  } else {
    // Modal View
    const currentTitle = currentNote.querySelector(".note-title").textContent,
      currentData = currentNote.querySelector(".note-data");
    viewNoteModal(currentTitle, currentData);
  }
});

// Submit Note
document.getElementById("submit-note").addEventListener("click", (e) => {
  e.preventDefault();
  const titleData = document.querySelector("#titleData"),
    typeData = document.querySelector("#typeData"),
    textData = document.querySelector("#noteData-text");
  let noteData,
    noteFlag = true;

  if (titleData.value.length > 0) {
    noteFlag = false;
    if (typeData.value === "text" && textData.value.length > 0) {
      noteData = textData.value;
    } else if (typeData.value === "drawing" && !isCanvasBlank()) {
      noteData = canvas.toDataURL();
    } else {
      noteFlag = true;
    }

    if (noteFlag === false) {
      const newNote = new Note(
        titleData.value,
        typeData.value,
        pinnedTags,
        noteData
      );

      addNotetoBoard(newNote);
      storeNote(newNote);

      titleData.value = "";
      pinnedTags = [];
      textData.value = "";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      titleData.focus();

      document
        .querySelectorAll(".selected-tag")
        .forEach((e) => e.classList.remove("selected-tag"));
    }
  }

  if (noteFlag === true) {
    showAlertMessage(
      "A note must have a title and some information.",
      "alert-message"
    );
  }
});

// Submit Tag
document.getElementById("submit-tag").addEventListener("click", (e) => {
  e.preventDefault();
  const tagData = document.querySelector("#tagData");
  const colorData = document.querySelector("#colorData");

  if (tagData.value.length > 0 && colorData.value != "#ffffff") {
    const newTag = new Tag(tagData.value, colorData.value);

    createNoteTag(newTag);
    storeTag(newTag);

    tagData.value = "";
    colorData.value = "#ff4a4a";

    document.querySelector("#textData").focus();
  }
});

// Create Tag
function createNoteTag(noteTag) {
  const newNoteTagUI = document.createElement("div");
  newNoteTagUI.classList.add("note-tag");
  newNoteTagUI.innerHTML = `
  <span hidden>${noteTag.id}</span>
  <div class="tag-name" style="background-color:${noteTag.color}">
  ${noteTag.name}
  <button type="button" class="tag-delete-btn">&times;</button>
  </div>`;
  tagContainer.appendChild(newNoteTagUI);
}

// Remove/Add Tag
tagContainer.addEventListener("click", (e) => {
  const currentTag = e.target.closest(".note-tag");
  const id = currentTag.querySelector("span").textContent;
  currentTag.classList.toggle("selected-tag");
  if (e.target.classList.contains("tag-delete-btn")) {
    currentTag.remove();
    removeTag(Number(id));
  } else {
    const tags = getTags();
    if (pinnedTags.filter((e) => e.id === Number(id)).length > 0) {
      pinnedTags.forEach((existingTag, index) => {
        if (existingTag.id === Number(id)) {
          pinnedTags.splice(index, 1);
        }
      });
    } else {
      tags.forEach((tag) => {
        if (tag.id === Number(id)) {
          pinnedTags.push(tag);
        }
      });
    }
  }
});

function viewNoteModal(title, data) {
  let modalTitle = document.querySelector(".modal-title"),
    modalData = document.querySelector(".modal-data");

  modalTitle.textContent = title;
  if (data.getElementsByTagName("img").length > 0) {
    modalData.innerHTML = `<img src="${data.querySelector("img").src}"/>`;
  } else {
    modalData.innerHTML = `<p>${data.textContent}<p>`;
  }
  modalContainer.classList.add("modal-active");
}

const modalBtn = document
  .querySelector(".modal-btn")
  .addEventListener("click", () => {
    modalContainer.classList.remove("modal-active");
  });

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalContainer.classList.contains("modal-active")) {
    modalContainer.classList.remove("modal-active");
  }
});

document.addEventListener("click", (e) => {
  if (
    e.target.classList.contains("modal-container") &&
    modalContainer.classList.contains("modal-active")
  ) {
    modalContainer.classList.remove("modal-active");
  }
});

function showAlertMessage(message, alertClass) {
  const alertDiv = document.createElement("div");
  alertDiv.appendChild(document.createTextNode(message));
  form.insertAdjacentElement("beforebegin", alertDiv);
  requestAnimationFrame(() => {
    alertDiv.className = `message ${alertClass}`;
  });

  setTimeout(() => {
    alertDiv.classList.add("alert-delete");
    setTimeout(() => {
      alertDiv.remove();
    }, 200);
  }, 2000);
}

// LOCAL STORAGE //
function getNotes() {
  let notes;
  if (localStorage.getItem("noteboard") === null) {
    notes = [];
  } else {
    notes = JSON.parse(localStorage.getItem("noteboard"));
  }
  return notes;
}

function getTags() {
  let tags;
  if (localStorage.getItem("tags") === null) {
    tags = [];
  } else {
    tags = JSON.parse(localStorage.getItem("tags"));
  }
  return tags;
}

function storeNote(note) {
  const notes = getNotes();
  notes.push(note);
  localStorage.setItem("noteboard", JSON.stringify(notes));
}

function storeTag(tag) {
  const tags = getTags();
  tags.push(tag);
  localStorage.setItem("tags", JSON.stringify(tags));
}

function displayNotes() {
  const notes = getNotes();
  notes.forEach((note) => {
    addNotetoBoard(note);
  });
}

function displayTags() {
  const tags = getTags();
  tags.forEach((tag) => {
    createNoteTag(tag);
  });
}

function removeNote(id) {
  const notes = getNotes();
  notes.forEach((note, index) => {
    if (note.id === id) {
      notes.splice(index, 1);
    }
    localStorage.setItem("noteboard", JSON.stringify(notes));
  });
}

function removeTag(id) {
  const tags = getTags();
  tags.forEach((tag, index) => {
    if (tag.id === id) {
      tags.splice(index, 1);
    }
    localStorage.setItem("tags", JSON.stringify(tags));
  });
}

document.addEventListener("DOMContentLoaded", displayNotes);
document.addEventListener("DOMContentLoaded", displayTags);
typeData.addEventListener("change", () => {
  if (typeData.value === "text") {
    document.getElementById("text-note").classList.remove("hide");
    document.getElementById("drawing-note").classList.add("hide");
  } else if (typeData.value === "drawing") {
    document.getElementById("text-note").classList.add("hide");
    document.getElementById("drawing-note").classList.remove("hide");
  } else if (typeData.value === "file") {
    document.getElementById("text-note").classList.add("hide");
    document.getElementById("drawing-note").classList.add("hide");
  }
});

// Canvas Draw
const canvas = document.querySelector("canvas"),
  toolBtns = document.querySelectorAll(".tool"),
  sizeSlider = document.querySelector("#size-slider"),
  colourBtns = document.querySelectorAll(".colours"),
  colourPicker = document.querySelector("#colour-picker"),
  clearCanvas = document.querySelector(".clear-canvas"),
  ctx = canvas.getContext("2d");

let prevMouseX,
  prevMouseY,
  snapshot,
  isDrawing = false,
  selectedTool = "brush",
  brushWidth = 5,
  selectedColour = "#ffffff";

window.addEventListener("load", () => {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  document.getElementById("drawing-note").classList.add("hide");
});

const drawing = (e) => {
  if (!isDrawing) return;
  ctx.putImageData(snapshot, 0, 0);

  if (selectedTool === "brush" || selectedTool === "eraser") {
    ctx.strokeStyle = selectedTool === "eraser" ? "#303030" : selectedColour;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  } else if (selectedTool === "rectangle") {
    ctx.strokeRect(
      e.offsetX,
      e.offsetY,
      prevMouseX - e.offsetX,
      prevMouseY - e.offsetY
    );
  } else if (selectedTool === "circle") {
    ctx.beginPath();
    let radius = Math.sqrt(
      Math.pow(prevMouseX - e.offsetX, 2) + Math.pow(prevMouseY - e.offsetY, 2)
    );
    ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
    ctx.stroke();
  } else if (selectedTool === "triangle") {
    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);
    ctx.closePath();
    ctx.stroke();
  } else if (selectedTool === "line") {
    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  }
};

toolBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".options .active").classList.remove("active");
    btn.classList.add("active");
    selectedTool = btn.id;
  });
});

sizeSlider.addEventListener("change", () => (brushWidth = sizeSlider.value));

colourPicker.addEventListener("change", () => {
  selectedColour = colourPicker.value;
  colourPicker.parentElement.click();
});

clearCanvas.addEventListener("click", (e) => {
  e.preventDefault();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  prevMouseX = e.offsetX;
  prevMouseY = e.offsetY;
  ctx.beginPath();
  ctx.lineWidth = brushWidth;
  ctx.strokeStyle = selectedColour;
  snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
});
canvas.addEventListener("mouseup", () => (isDrawing = false));
canvas.addEventListener("mousemove", drawing);

function isCanvasBlank() {
  const pixelBuffer = new Uint32Array(
    ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer
  );

  return !pixelBuffer.some((color) => color !== 0);
}
