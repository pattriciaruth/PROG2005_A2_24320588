// PROG2005 - Assessment 2 - Part 1
// Café/Bakery Inventory - TypeScript client-side app
// Author: Pattricia Ruth Das - 24320588
// Date: November 2025

interface CafeItem {
  itemId: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  supplier: string;
  stockLevel: number; // 1 (low) to 5 (full)
  popular: boolean;
  comment: string;
}

const inventory: CafeItem[] = [];

function getInputElement(id: string): HTMLInputElement {
  return document.getElementById(id) as HTMLInputElement;
}

function getSelectElement(id: string): HTMLSelectElement {
  return document.getElementById(id) as HTMLSelectElement;
}

function getTextAreaElement(id: string): HTMLTextAreaElement {
  return document.getElementById(id) as HTMLTextAreaElement;
}

function showMessage(text: string, type: "info" | "success" | "error" = "info"): void {
  const messageBox = document.getElementById("messageBox");
  if (!messageBox) return;

  messageBox.textContent = text;
  messageBox.className = "message"; // reset
  messageBox.classList.add(type);
}

function clearMessage(): void {
  const messageBox = document.getElementById("messageBox");
  if (!messageBox) return;
  messageBox.textContent = "";
  messageBox.className = "message";
}

/**
 * Read values from the form and return a CafeItem plus any validation errors.
 * This does NOT check for unique ItemID; that is done in addItem().
 */
function readItemFromForm(): { item: CafeItem | null; errors: string[] } {
  const itemId = getInputElement("itemIdInput").value.trim();
  const name = getInputElement("itemNameInput").value.trim();
  const category = getSelectElement("categorySelect").value;
  const quantityStr = getInputElement("quantityInput").value.trim();
  const priceStr = getInputElement("priceInput").value.trim();
  const supplier = getInputElement("supplierInput").value.trim();
  const stockLevelStr = getSelectElement("stockLevelSelect").value;
  const popular = (document.getElementById("popularCheckbox") as HTMLInputElement).checked;
  const comment = getTextAreaElement("commentInput").value.trim();

  const errors: string[] = [];

  if (!itemId) {
    errors.push("Item ID is required.");
  }
  if (!name) {
    errors.push("Item name is required.");
  }
  if (!category) {
    errors.push("Category is required.");
  }
  if (!quantityStr) {
    errors.push("Quantity is required.");
  }
  if (!priceStr) {
    errors.push("Price is required.");
  }
  if (!supplier) {
    errors.push("Supplier name is required.");
  }
  if (!stockLevelStr) {
    errors.push("Stock level is required.");
  }

  const quantity = Number(quantityStr);
if (quantityStr && (isNaN(quantity) || quantity < 0)) {
  errors.push("Quantity must be a number greater than or equal to 0.");
}

const price = Number(priceStr);
if (priceStr && (isNaN(price) || price < 0)) {
  errors.push("Price must be a number greater than or equal to 0.");
}

const stockLevel = Number(stockLevelStr);
if (stockLevelStr && (isNaN(stockLevel) || stockLevel < 1 || stockLevel > 5)) {
  errors.push("Stock level must be between 1 (low) and 5 (full).");
}


  if (errors.length > 0) {
    return { item: null, errors };
  }

  const item: CafeItem = {
    itemId,
    name,
    category,
    quantity,
    price,
    supplier,
    stockLevel,
    popular,
    comment,
  };

  return { item, errors: [] };
}

function clearForm(): void {
  getInputElement("itemIdInput").value = "";
  getInputElement("itemNameInput").value = "";
  getSelectElement("categorySelect").value = "";
  getInputElement("quantityInput").value = "";
  getInputElement("priceInput").value = "";
  getInputElement("supplierInput").value = "";
  getSelectElement("stockLevelSelect").value = "";
  (document.getElementById("popularCheckbox") as HTMLInputElement).checked = false;
  getTextAreaElement("commentInput").value = "";
}

/**
 * Convert numeric stock level to a human readable description
 */
function getStockStatus(level: number): string {
  if (level <= 1) return "Very low";
  if (level === 2) return "Low";
  if (level === 3) return "Medium";
  if (level === 4) return "High";
  return "Full";
}

function itemIdExists(itemId: string): boolean {
  return inventory.some((i) => i.itemId.toLowerCase() === itemId.toLowerCase());
}

function findItemIndexByName(name: string): number {
  const target = name.trim().toLowerCase();
  if (!target) return -1;

  for (let i = 0; i < inventory.length; i++) {
    if (inventory[i].name.toLowerCase() === target) {
      return i;
    }
  }
  return -1;
}

/**
 * Add a new item to the inventory.
 */
function addItem(): void {
  clearMessage();
  const { item, errors } = readItemFromForm();

  if (!item) {
    showMessage(errors.join(" "), "error");
    return;
  }

  if (itemIdExists(item.itemId)) {
    showMessage("Item ID must be unique. Another item already uses this ID.", "error");
    return;
  }

  inventory.push(item);
  renderItems(inventory);
  showMessage(`Item "${item.name}" added successfully.`, "success");
  clearForm();
}

/**
 * Update an existing item, looked up by item name.
 */
function updateItemByName(): void {
  clearMessage();
  const nameInput = getInputElement("itemNameInput").value.trim();
  if (!nameInput) {
    showMessage("Enter the item name to update.", "error");
    return;
  }

  const index = findItemIndexByName(nameInput);
  if (index === -1) {
    showMessage(`No item found with name "${nameInput}".`, "error");
    return;
  }

  const { item, errors } = readItemFromForm();
  if (!item) {
    showMessage(errors.join(" "), "error");
    return;
  }

  // Preserve original itemId uniqueness (allow same ID for same item)
  let existingIdIndex = -1;
for (let i = 0; i < inventory.length; i++) {
  if (
    inventory[i].itemId.toLowerCase() === item.itemId.toLowerCase() &&
    i !== index
  ) {
    existingIdIndex = i;
    break;
  }
}
if (existingIdIndex !== -1) {
  showMessage(
    "Item ID must remain unique. Another item already has this ID.",
    "error"
  );
  return;
}


  inventory[index] = item;
  renderItems(inventory);
  showMessage(`Item "${item.name}" updated successfully.`, "success");
}

/**
 * Delete an item by item name.
 */
function deleteItemByName(): void {
  clearMessage();
  const nameInput = getInputElement("itemNameInput").value.trim();
  if (!nameInput) {
    showMessage("Enter the item name to delete.", "error");
    return;
  }

  const index = findItemIndexByName(nameInput);
  if (index === -1) {
    showMessage(`No item found with name "${nameInput}".`, "error");
    return;
  }

  const removed = inventory.splice(index, 1)[0];
  renderItems(inventory);
  showMessage(`Item "${removed.name}" deleted from inventory.`, "success");
}

/**
 * Search items by name (partial, case-insensitive).
 */
function searchByName(): void {
  clearMessage();
  const searchValue = (document.getElementById("searchInput") as HTMLInputElement).value
    .trim()
    .toLowerCase();

  if (!searchValue) {
    showMessage("Enter a name to search.", "info");
    return;
  }

  const filtered = inventory.filter((i) =>
  i.name.toLowerCase().indexOf(searchValue) !== -1
);


  if (filtered.length === 0) {
    renderItems([]);
    showMessage(`No items found matching "${searchValue}".`, "info");
  } else {
    renderItems(filtered);
    showMessage(`Showing ${filtered.length} item(s) matching "${searchValue}".`, "success");
  }
}

/**
 * Show all items in the inventory.
 */
function showAllItems(): void {
  clearMessage();
  if (inventory.length === 0) {
    renderItems([]);
    showMessage("No items in inventory yet.", "info");
  } else {
    renderItems(inventory);
    showMessage(`Showing all ${inventory.length} item(s).`, "success");
  }
}

/**
 * Show only items marked as popular.
 */
function showPopularItems(): void {
  clearMessage();
  const popularItems = inventory.filter((i) => i.popular);

  if (popularItems.length === 0) {
    renderItems([]);
    showMessage("No items are marked as popular yet.", "info");
  } else {
    renderItems(popularItems);
    showMessage(`Showing ${popularItems.length} popular item(s).`, "success");
  }
}

/**
 * Render given items into the table body.
 */
function renderItems(itemsToShow: CafeItem[]): void {
  const tbody = document.getElementById("itemsTableBody");
  if (!tbody) return;

  // Clear existing rows
  while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
  }

  if (itemsToShow.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 9;
    cell.textContent = "No items to display.";
    cell.style.textAlign = "center";
    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }

  itemsToShow.forEach((item) => {
    const row = document.createElement("tr");

    const idCell = document.createElement("td");
    idCell.textContent = item.itemId;

    const nameCell = document.createElement("td");
    nameCell.textContent = item.name;

    const categoryCell = document.createElement("td");
    categoryCell.textContent = item.category;

    const quantityCell = document.createElement("td");
    quantityCell.textContent = item.quantity.toString();

    const priceCell = document.createElement("td");
    priceCell.textContent = item.price.toFixed(2);

    const supplierCell = document.createElement("td");
    supplierCell.textContent = item.supplier;

    const stockCell = document.createElement("td");
    stockCell.textContent = `${getStockStatus(item.stockLevel)} (${item.stockLevel}/5)`;

    const popularCell = document.createElement("td");
    popularCell.textContent = item.popular ? "Yes" : "No";

    const commentCell = document.createElement("td");
    commentCell.textContent = item.comment;

    row.appendChild(idCell);
    row.appendChild(nameCell);
    row.appendChild(categoryCell);
    row.appendChild(quantityCell);
    row.appendChild(priceCell);
    row.appendChild(supplierCell);
    row.appendChild(stockCell);
    row.appendChild(popularCell);
    row.appendChild(commentCell);

    tbody.appendChild(row);
  });
}

/**
 * Wire up event listeners once the DOM is ready.
 */
function setupEventListeners(): void {
  const addBtn = document.getElementById("addButton");
  const updateBtn = document.getElementById("updateButton");
  const deleteBtn = document.getElementById("deleteButton");
  const clearBtn = document.getElementById("clearButton");
  const searchBtn = document.getElementById("searchButton");
  const showAllBtn = document.getElementById("showAllButton");
  const showPopularBtn = document.getElementById("showPopularButton");

  addBtn?.addEventListener("click", addItem);
  updateBtn?.addEventListener("click", updateItemByName);
  deleteBtn?.addEventListener("click", deleteItemByName);
  clearBtn?.addEventListener("click", () => {
    clearForm();
    clearMessage();
  });

  searchBtn?.addEventListener("click", searchByName);
  showAllBtn?.addEventListener("click", showAllItems);
  showPopularBtn?.addEventListener("click", showPopularItems);
}

// Initialise when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  renderItems([]); // start with empty state
});
