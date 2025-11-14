// PROG2005 - Assessment 2 - Part 1
// Café/Bakery Inventory - TypeScript client-side app
// Author: Pattricia Ruth Das - 24320588
// Date: November 2025
var inventory = [];
function getInputElement(id) {
    return document.getElementById(id);
}
function getSelectElement(id) {
    return document.getElementById(id);
}
function getTextAreaElement(id) {
    return document.getElementById(id);
}
function showMessage(text, type) {
    if (type === void 0) { type = "info"; }
    var messageBox = document.getElementById("messageBox");
    if (!messageBox)
        return;
    messageBox.textContent = text;
    messageBox.className = "message"; // reset
    messageBox.classList.add(type);
}
function clearMessage() {
    var messageBox = document.getElementById("messageBox");
    if (!messageBox)
        return;
    messageBox.textContent = "";
    messageBox.className = "message";
}
/**
 * Read values from the form and return a CafeItem plus any validation errors.
 * This does NOT check for unique ItemID; that is done in addItem().
 */
function readItemFromForm() {
    var itemId = getInputElement("itemIdInput").value.trim();
    var name = getInputElement("itemNameInput").value.trim();
    var category = getSelectElement("categorySelect").value;
    var quantityStr = getInputElement("quantityInput").value.trim();
    var priceStr = getInputElement("priceInput").value.trim();
    var supplier = getInputElement("supplierInput").value.trim();
    var stockLevelStr = getSelectElement("stockLevelSelect").value;
    var popular = document.getElementById("popularCheckbox").checked;
    var comment = getTextAreaElement("commentInput").value.trim();
    var errors = [];
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
    var quantity = Number(quantityStr);
    if (quantityStr && (isNaN(quantity) || quantity < 0)) {
        errors.push("Quantity must be a number greater than or equal to 0.");
    }
    var price = Number(priceStr);
    if (priceStr && (isNaN(price) || price < 0)) {
        errors.push("Price must be a number greater than or equal to 0.");
    }
    var stockLevel = Number(stockLevelStr);
    if (stockLevelStr && (isNaN(stockLevel) || stockLevel < 1 || stockLevel > 5)) {
        errors.push("Stock level must be between 1 (low) and 5 (full).");
    }
    if (errors.length > 0) {
        return { item: null, errors: errors };
    }
    var item = {
        itemId: itemId,
        name: name,
        category: category,
        quantity: quantity,
        price: price,
        supplier: supplier,
        stockLevel: stockLevel,
        popular: popular,
        comment: comment,
    };
    return { item: item, errors: [] };
}
function clearForm() {
    getInputElement("itemIdInput").value = "";
    getInputElement("itemNameInput").value = "";
    getSelectElement("categorySelect").value = "";
    getInputElement("quantityInput").value = "";
    getInputElement("priceInput").value = "";
    getInputElement("supplierInput").value = "";
    getSelectElement("stockLevelSelect").value = "";
    document.getElementById("popularCheckbox").checked = false;
    getTextAreaElement("commentInput").value = "";
}
/**
 * Convert numeric stock level to a human readable description
 */
function getStockStatus(level) {
    if (level <= 1)
        return "Very low";
    if (level === 2)
        return "Low";
    if (level === 3)
        return "Medium";
    if (level === 4)
        return "High";
    return "Full";
}
function itemIdExists(itemId) {
    return inventory.some(function (i) { return i.itemId.toLowerCase() === itemId.toLowerCase(); });
}
function findItemIndexByName(name) {
    var target = name.trim().toLowerCase();
    if (!target)
        return -1;
    for (var i = 0; i < inventory.length; i++) {
        if (inventory[i].name.toLowerCase() === target) {
            return i;
        }
    }
    return -1;
}
/**
 * Add a new item to the inventory.
 */
function addItem() {
    clearMessage();
    var _a = readItemFromForm(), item = _a.item, errors = _a.errors;
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
    showMessage("Item \"".concat(item.name, "\" added successfully."), "success");
    clearForm();
}
/**
 * Update an existing item, looked up by item name.
 */
function updateItemByName() {
    clearMessage();
    var nameInput = getInputElement("itemNameInput").value.trim();
    if (!nameInput) {
        showMessage("Enter the item name to update.", "error");
        return;
    }
    var index = findItemIndexByName(nameInput);
    if (index === -1) {
        showMessage("No item found with name \"".concat(nameInput, "\"."), "error");
        return;
    }
    var _a = readItemFromForm(), item = _a.item, errors = _a.errors;
    if (!item) {
        showMessage(errors.join(" "), "error");
        return;
    }
    // Preserve original itemId uniqueness (allow same ID for same item)
    var existingIdIndex = -1;
    for (var i = 0; i < inventory.length; i++) {
        if (inventory[i].itemId.toLowerCase() === item.itemId.toLowerCase() &&
            i !== index) {
            existingIdIndex = i;
            break;
        }
    }
    if (existingIdIndex !== -1) {
        showMessage("Item ID must remain unique. Another item already has this ID.", "error");
        return;
    }
    inventory[index] = item;
    renderItems(inventory);
    showMessage("Item \"".concat(item.name, "\" updated successfully."), "success");
}
/**
 * Delete an item by item name.
 */
function deleteItemByName() {
    clearMessage();
    var nameInput = getInputElement("itemNameInput").value.trim();
    if (!nameInput) {
        showMessage("Enter the item name to delete.", "error");
        return;
    }
    var index = findItemIndexByName(nameInput);
    if (index === -1) {
        showMessage("No item found with name \"".concat(nameInput, "\"."), "error");
        return;
    }
    var removed = inventory.splice(index, 1)[0];
    renderItems(inventory);
    showMessage("Item \"".concat(removed.name, "\" deleted from inventory."), "success");
}
/**
 * Search items by name (partial, case-insensitive).
 */
function searchByName() {
    clearMessage();
    var searchValue = document.getElementById("searchInput").value
        .trim()
        .toLowerCase();
    if (!searchValue) {
        showMessage("Enter a name to search.", "info");
        return;
    }
    var filtered = inventory.filter(function (i) {
        return i.name.toLowerCase().indexOf(searchValue) !== -1;
    });
    if (filtered.length === 0) {
        renderItems([]);
        showMessage("No items found matching \"".concat(searchValue, "\"."), "info");
    }
    else {
        renderItems(filtered);
        showMessage("Showing ".concat(filtered.length, " item(s) matching \"").concat(searchValue, "\"."), "success");
    }
}
/**
 * Show all items in the inventory.
 */
function showAllItems() {
    clearMessage();
    if (inventory.length === 0) {
        renderItems([]);
        showMessage("No items in inventory yet.", "info");
    }
    else {
        renderItems(inventory);
        showMessage("Showing all ".concat(inventory.length, " item(s)."), "success");
    }
}
/**
 * Show only items marked as popular.
 */
function showPopularItems() {
    clearMessage();
    var popularItems = inventory.filter(function (i) { return i.popular; });
    if (popularItems.length === 0) {
        renderItems([]);
        showMessage("No items are marked as popular yet.", "info");
    }
    else {
        renderItems(popularItems);
        showMessage("Showing ".concat(popularItems.length, " popular item(s)."), "success");
    }
}
/**
 * Render given items into the table body.
 */
function renderItems(itemsToShow) {
    var tbody = document.getElementById("itemsTableBody");
    if (!tbody)
        return;
    // Clear existing rows
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }
    if (itemsToShow.length === 0) {
        var row = document.createElement("tr");
        var cell = document.createElement("td");
        cell.colSpan = 9;
        cell.textContent = "No items to display.";
        cell.style.textAlign = "center";
        row.appendChild(cell);
        tbody.appendChild(row);
        return;
    }
    itemsToShow.forEach(function (item) {
        var row = document.createElement("tr");
        var idCell = document.createElement("td");
        idCell.textContent = item.itemId;
        var nameCell = document.createElement("td");
        nameCell.textContent = item.name;
        var categoryCell = document.createElement("td");
        categoryCell.textContent = item.category;
        var quantityCell = document.createElement("td");
        quantityCell.textContent = item.quantity.toString();
        var priceCell = document.createElement("td");
        priceCell.textContent = item.price.toFixed(2);
        var supplierCell = document.createElement("td");
        supplierCell.textContent = item.supplier;
        var stockCell = document.createElement("td");
        stockCell.textContent = "".concat(getStockStatus(item.stockLevel), " (").concat(item.stockLevel, "/5)");
        var popularCell = document.createElement("td");
        popularCell.textContent = item.popular ? "Yes" : "No";
        var commentCell = document.createElement("td");
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
function setupEventListeners() {
    var addBtn = document.getElementById("addButton");
    var updateBtn = document.getElementById("updateButton");
    var deleteBtn = document.getElementById("deleteButton");
    var clearBtn = document.getElementById("clearButton");
    var searchBtn = document.getElementById("searchButton");
    var showAllBtn = document.getElementById("showAllButton");
    var showPopularBtn = document.getElementById("showPopularButton");
    addBtn === null || addBtn === void 0 ? void 0 : addBtn.addEventListener("click", addItem);
    updateBtn === null || updateBtn === void 0 ? void 0 : updateBtn.addEventListener("click", updateItemByName);
    deleteBtn === null || deleteBtn === void 0 ? void 0 : deleteBtn.addEventListener("click", deleteItemByName);
    clearBtn === null || clearBtn === void 0 ? void 0 : clearBtn.addEventListener("click", function () {
        clearForm();
        clearMessage();
    });
    searchBtn === null || searchBtn === void 0 ? void 0 : searchBtn.addEventListener("click", searchByName);
    showAllBtn === null || showAllBtn === void 0 ? void 0 : showAllBtn.addEventListener("click", showAllItems);
    showPopularBtn === null || showPopularBtn === void 0 ? void 0 : showPopularBtn.addEventListener("click", showPopularItems);
}
// Initialise when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
    setupEventListeners();
    renderItems([]); // start with empty state
});
