const fieldTemplates = {
  short: {
    label: "Short answer",
    type: "input",
    placeholder: "Write a short response",
  },
  long: {
    label: "Long answer",
    type: "textarea",
    placeholder: "Share more details",
  },
  email: {
    label: "Email address",
    type: "email",
    placeholder: "name@company.com",
  },
  choice: {
    label: "How did you hear about us?",
    type: "select",
    options: ["Social media", "Friend", "Search", "Other"],
  },
  date: {
    label: "Best date to follow up",
    type: "date",
    placeholder: "MM/DD/YYYY",
  },
  rating: {
    label: "Rate your experience",
    type: "rating",
  },
};

const formCanvas = document.getElementById("form-canvas");
const previewForm = document.getElementById("preview-form");
const previewTitle = document.getElementById("preview-title");
const previewDesc = document.getElementById("preview-desc");
const formTitle = document.getElementById("form-title");
const formDesc = document.getElementById("form-desc");

const createPreviewField = (field) => {
  const wrapper = document.createElement("div");
  wrapper.className = "preview-field";

  const label = document.createElement("label");
  label.textContent = field.label;
  wrapper.appendChild(label);

  if (field.type === "textarea") {
    const textarea = document.createElement("textarea");
    textarea.rows = 3;
    textarea.placeholder = field.placeholder;
    wrapper.appendChild(textarea);
  } else if (field.type === "select") {
    const select = document.createElement("select");
    field.options.forEach((option) => {
      const optionEl = document.createElement("option");
      optionEl.textContent = option;
      select.appendChild(optionEl);
    });
    wrapper.appendChild(select);
  } else if (field.type === "rating") {
    const ratingRow = document.createElement("div");
    ratingRow.className = "choice-grid";
    for (let i = 1; i <= 5; i += 1) {
      const chip = document.createElement("button");
      chip.className = "chip";
      chip.type = "button";
      chip.textContent = i;
      ratingRow.appendChild(chip);
    }
    wrapper.appendChild(ratingRow);
  } else {
    const input = document.createElement("input");
    input.type = field.type === "email" ? "email" : field.type === "date" ? "date" : "text";
    input.placeholder = field.placeholder;
    wrapper.appendChild(input);
  }

  return wrapper;
};

const refreshPreview = () => {
  previewTitle.textContent = formTitle.textContent;
  previewDesc.textContent = formDesc.textContent;

  const fields = Array.from(formCanvas.querySelectorAll(".field-card")).map(
    (card) => {
      const type = card.dataset.type || "short";
      const input = card.querySelector("input, textarea");
      const select = card.querySelector("select");
      const options = select
        ? Array.from(select.options).map((option) => option.textContent)
        : ["Social media", "Friend", "Search", "Other"];

      return {
        label: card.querySelector("label").textContent,
        type,
        placeholder: input?.placeholder || "",
        options,
      };
    }
  );

  previewForm.innerHTML = "";
  fields.forEach((field) => {
    previewForm.appendChild(createPreviewField(fieldTemplates[field.type] || field));
  });
};

const updateEmptyState = () => {
  const existingEmpty = formCanvas.querySelector(".empty-state");
  const hasFields = formCanvas.querySelectorAll(".field-card").length > 0;
  if (!hasFields && !existingEmpty) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = "<strong>No fields yet.</strong><br />Pick an element to get started.";
    formCanvas.appendChild(empty);
  } else if (hasFields && existingEmpty) {
    existingEmpty.remove();
  }
};

const attachCardHandlers = (card) => {
  const removeButton = card.querySelector(".remove-field");
  if (removeButton) {
    removeButton.addEventListener("click", () => {
      card.remove();
      updateEmptyState();
      refreshPreview();
    });
  }

  card.addEventListener("dragstart", () => {
    card.classList.add("dragging");
  });

  card.addEventListener("dragend", () => {
    card.classList.remove("dragging");
    refreshPreview();
  });
};

const getDragAfterElement = (container, y) => {
  const draggableElements = [...container.querySelectorAll(".field-card:not(.dragging)")];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      }
      return closest;
    },
    { offset: Number.NEGATIVE_INFINITY, element: null }
  ).element;
};

document.querySelectorAll(".element").forEach((button) => {
  button.addEventListener("click", () => {
    const type = button.dataset.type;
    const template = fieldTemplates[type];

    const card = document.createElement("div");
    card.className = "field-card";
    card.dataset.type = type;
    card.draggable = true;

    const header = document.createElement("div");
    header.className = "field-header";

    const label = document.createElement("label");
    label.textContent = template.label;
    label.contentEditable = "true";
    header.appendChild(label);

    const removeButton = document.createElement("button");
    removeButton.className = "ghost icon-button remove-field";
    removeButton.type = "button";
    removeButton.setAttribute("aria-label", "Remove field");
    removeButton.textContent = "✕";
    header.appendChild(removeButton);
    card.appendChild(header);

    if (template.type === "textarea") {
      const textarea = document.createElement("textarea");
      textarea.rows = 3;
      textarea.placeholder = template.placeholder;
      card.appendChild(textarea);
    } else if (template.type === "select") {
      const select = document.createElement("select");
      template.options.forEach((option) => {
        const optionEl = document.createElement("option");
        optionEl.textContent = option;
        select.appendChild(optionEl);
      });
      card.appendChild(select);
    } else if (template.type === "rating") {
      const ratingRow = document.createElement("div");
      ratingRow.className = "choice-grid";
      for (let i = 1; i <= 5; i += 1) {
        const chip = document.createElement("button");
        chip.className = "chip";
        chip.type = "button";
        chip.textContent = i;
        ratingRow.appendChild(chip);
      }
      card.appendChild(ratingRow);
    } else {
      const input = document.createElement("input");
      input.placeholder = template.placeholder;
      if (template.type === "email") {
        input.type = "email";
      } else if (template.type === "date") {
        input.type = "date";
      }
      card.appendChild(input);
    }

    formCanvas.appendChild(card);
    attachCardHandlers(card);
    updateEmptyState();
    refreshPreview();
  });
});

["input", "blur"].forEach((eventName) => {
  formCanvas.addEventListener(eventName, refreshPreview, true);
  formTitle.addEventListener(eventName, refreshPreview, true);
  formDesc.addEventListener(eventName, refreshPreview, true);
});

document.getElementById("copy-link").addEventListener("click", () => {
  navigator.clipboard.writeText("https://jotform-lite.example/form/128");
});

document.getElementById("share-btn").addEventListener("click", () => {
  alert("Shareable link copied to clipboard!");
});

document.getElementById("preview-toggle").addEventListener("click", () => {
  document.getElementById("preview").scrollIntoView({ behavior: "smooth" });
});

formCanvas.addEventListener("dragover", (event) => {
  event.preventDefault();
  const afterElement = getDragAfterElement(formCanvas, event.clientY);
  const dragging = formCanvas.querySelector(".dragging");
  if (!dragging) return;

  if (afterElement == null) {
    formCanvas.appendChild(dragging);
  } else {
    formCanvas.insertBefore(dragging, afterElement);
  }
});

formCanvas.querySelectorAll(".field-card").forEach((card) => attachCardHandlers(card));
updateEmptyState();
refreshPreview();
