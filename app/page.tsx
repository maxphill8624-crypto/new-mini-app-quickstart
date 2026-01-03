"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";

interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
  purchased: boolean;
  addedAt: number;
}

export default function Home() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItem, setNewItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState("groceries");
  const [error, setError] = useState("");

  // Load shopping list from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("claudeShoppingList");
    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, []);

  // Save shopping list to localStorage
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem("claudeShoppingList", JSON.stringify(items));
    }
  }, [items]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newItem.trim()) {
      setError("Please enter an item name");
      return;
    }

    if (quantity < 1) {
      setError("Quantity must be at least 1");
      return;
    }

    const item: ShoppingItem = {
      id: Date.now().toString(),
      name: newItem.trim(),
      quantity,
      category,
      purchased: false,
      addedAt: Date.now(),
    };

    setItems([...items, item]);
    setNewItem("");
    setQuantity(1);
    setError("");
  };

  const togglePurchased = (id: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, purchased: !item.purchased } : item
      )
    );
  };

  const deleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const clearPurchased = () => {
    setItems(items.filter((item) => !item.purchased));
  };

  const categories = ["groceries", "electronics", "clothing", "home", "other"];
  const activeItems = items.filter((item) => !item.purchased);
  const purchasedItems = items.filter((item) => item.purchased);

  return (
    <div className={styles.container}>
      <button className={styles.closeButton} type="button">
        ✕
      </button>

      <div className={styles.content}>
        <div className={styles.shoppingList}>
          <h1 className={styles.title}>
            CLAUDE'S SHOPPING LIST
          </h1>

          <p className={styles.subtitle}>
            What do you need to buy today?
          </p>

          <form onSubmit={handleAddItem} className={styles.form}>
            <input
              type="text"
              placeholder="Item name"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              className={styles.itemInput}
            />

            <div className={styles.inputRow}>
              <input
                type="number"
                placeholder="Qty"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                min="1"
                className={styles.quantityInput}
              />

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={styles.categorySelect}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.addButton}>
              ADD TO LIST
            </button>
          </form>

          <div className={styles.itemsContainer}>
            {activeItems.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  To Buy ({activeItems.length})
                </h2>
                {activeItems.map((item) => (
                  <div key={item.id} className={styles.item}>
                    <div className={styles.itemInfo}>
                      <input
                        type="checkbox"
                        checked={item.purchased}
                        onChange={() => togglePurchased(item.id)}
                        className={styles.checkbox}
                      />
                      <div>
                        <div className={styles.itemName}>{item.name}</div>
                        <div className={styles.itemMeta}>
                          Qty: {item.quantity} • {item.category}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className={styles.deleteButton}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}

            {purchasedItems.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>
                    Purchased ({purchasedItems.length})
                  </h2>
                  <button
                    onClick={clearPurchased}
                    className={styles.clearButton}
                  >
                    Clear All
                  </button>
                </div>
                {purchasedItems.map((item) => (
                  <div
                    key={item.id}
                    className={`${styles.item} ${styles.purchased}`}
                  >
                    <div className={styles.itemInfo}>
                      <input
                        type="checkbox"
                        checked={item.purchased}
                        onChange={() => togglePurchased(item.id)}
                        className={styles.checkbox}
                      />
                      <div>
                        <div className={styles.itemName}>{item.name}</div>
                        <div className={styles.itemMeta}>
                          Qty: {item.quantity} • {item.category}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className={styles.deleteButton}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}

            {items.length === 0 && (
              <div className={styles.emptyState}>
                Your shopping list is empty. Add some items above!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
