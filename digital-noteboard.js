const modalContainer = document.querySelector(".modal-container");
const noteContainer = document.querySelector(".note-container");
const tagContainer = document.querySelector(".tag-container");
let pinnedTags = [];
const form = document.querySelector("form");

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
  newNoteUI.classList.add("note");
  newNoteUI.innerHTML = `
  <span hidden>${newNote.id}</span>
  <button type="button" class="note-delete-btn">&times;</button>
  <p class="note-title">${newNote.title}</p>
  <p class="note-data">${newNote.data}</p>
  <div class="property-container">`;
  newNote.tags.forEach((e) => {
    newNoteUI.innerHTML += `<span hidden>${e.id}</span>
    <div class="tag-name" style="background-color:${e.color}">
    ${e.name}
    </div>`;
  });
  newNoteUI.innerHTML += `<p style="margin: 0.7rem 0 0 0; grid-column-start: 1; grid-column-end: 2; color: grey;">${newNote.date}</p></div>`;
  noteContainer.appendChild(newNoteUI);
}

// Delete Note
noteContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("note-delete-btn")) {
    const currentNote = e.target.closest(".note");
    currentNote.remove();
    const id = currentNote.querySelector("span").textContent;
    removeNote(Number(id));
  }
});

// Submit Note
document.getElementById("submit-note").addEventListener("click", (e) => {
  e.preventDefault();
  const titleData = document.querySelector("#titleData");
  const typeData = document.querySelector("#typeData");
  const noteData = document.querySelector("#noteData");

  if (
    titleData.value.length > 0 &&
    typeData.value.length > 0 &&
    noteData.value.length > 0
  ) {
    const newNote = new Note(
      titleData.value,
      typeData.value,
      pinnedTags,
      noteData.value
    );

    addNotetoBoard(newNote);
    storeNote(newNote);

    titleData.value = "";
    typeData.value = "text";
    pinnedTags = [];
    noteData.value = "";
    titleData.focus();

    document
      .querySelectorAll(".selected-tag")
      .forEach((e) => e.classList.remove("selected-tag"));
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

    document.querySelector("#noteData").focus();
  }
});

// Create Tag
function createNoteTag(noteTag) {
  const newNoteTagUI = document.createElement("div");
  newNoteTagUI.classList.add("noteTag");
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
  const currentTag = e.target.closest(".noteTag");
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
