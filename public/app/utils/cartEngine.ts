export interface CartItem {
  cart_item_id: string;
  product_id: string;
  quantity: number;
  customizationMeta?: string;
  standalone?: boolean;
  referenceId?: string;
}

const DB_NAME = 'HighKeyCartDB';
const DB_VERSION = 2; // Incremented for schema change
const STORE_NAME = 'cart_items_v2';

class CartEngine {
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    // Only initialize automatically if we're in a browser environment
    if (typeof window !== 'undefined') {
      this.initDB();
    }
  }

  /**
   * Initializes the IndexedDB database and ensures the object store exists.
   */
  private initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not supported in this environment.'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error('IndexedDB error:', event);
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        resolve(db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // If migrating from v1, delete old store to prevent clutter
        if (event.oldVersion < 2 && db.objectStoreNames.contains('cart_items')) {
          db.deleteObjectStore('cart_items');
        }

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'cart_item_id' });
        }
      };
    });

    return this.dbPromise;
  }

  /**
   * Adds an item to the cart or increments its quantity if it already exists as a standalone item.
   * @param product_id The ID of the product
   * @param quantity The quantity to add (default: 1)
   * @param standalone Whether the item is standalone (default: true for normal add)
   */
  async addItem(product_id: string, quantity: number = 1, standalone: boolean = true): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const request = store.getAll();

      request.onsuccess = () => {
        const items = request.result as CartItem[];
        // Find existing standard item (same product_id, standalone, no customization)
        const existingItem = items.find(
          i => i.product_id === product_id && i.standalone === standalone && !i.customizationMeta && !i.referenceId
        );

        let putRequest;
        if (existingItem) {
          existingItem.quantity += quantity;
          putRequest = store.put(existingItem);
        } else {
          putRequest = store.put({
            cart_item_id: crypto.randomUUID(),
            product_id,
            quantity,
            standalone
          });
        }

        putRequest.onsuccess = () => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('highkey:cart-updated'));
          }
          resolve();
        };
        putRequest.onerror = () => reject(new Error('Failed to add/update item in cart'));
      };

      request.onerror = () => reject(new Error('Failed to retrieve items from cart'));
    });
  }

  /**
   * Transactionally adds a base product and its customized accessories.
   */
  async addCustomizedProduct(
    baseProductId: string,
    customizationMeta: string,
    patches: { product_id: string, quantity: number }[]
  ): Promise<void> {
    // Scan and remove any existing customized item first to ensure only one unique customized design exists
    const items = await this.getAllItems();
    const existingCustomized = items.find(i => !!i.customizationMeta);
    if (existingCustomized) {
      await this.removeItem(existingCustomized.cart_item_id);
    }

    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const baseCartItemId = crypto.randomUUID();

      // Add base product
      store.put({
        cart_item_id: baseCartItemId,
        product_id: baseProductId,
        quantity: 1, // Base is always 1 when customized uniquely
        customizationMeta,
        standalone: true
      });

      // Add patches as children
      for (const patch of patches) {
        store.put({
          cart_item_id: crypto.randomUUID(),
          product_id: patch.product_id,
          quantity: patch.quantity,
          standalone: false,
          referenceId: baseCartItemId
        });
      }

      transaction.oncomplete = () => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('highkey:cart-updated'));
        }
        resolve();
      };

      transaction.onerror = () => reject(new Error('Failed to add customized product to cart'));
    });
  }

  /**
   * Transactionally updates a base product and its customized accessories by deleting the old one and creating a new one with the same ID.
   */
  async updateCustomizedProduct(
    cart_item_id: string,
    baseProductId: string,
    customizationMeta: string,
    patches: { product_id: string, quantity: number }[]
  ): Promise<void> {
    await this.removeItem(cart_item_id);
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      // Add base product with SAME cart_item_id
      store.put({
        cart_item_id: cart_item_id,
        product_id: baseProductId,
        quantity: 1, 
        customizationMeta,
        standalone: true
      });

      // Add patches as children
      for (const patch of patches) {
        store.put({
          cart_item_id: crypto.randomUUID(),
          product_id: patch.product_id,
          quantity: patch.quantity,
          standalone: false,
          referenceId: cart_item_id
        });
      }

      transaction.oncomplete = () => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('highkey:cart-updated'));
        }
        resolve();
      };

      transaction.onerror = () => reject(new Error('Failed to update customized product in cart'));
    });
  }

  /**
   * Removes an item completely from the cart.
   * @param cart_item_id The ID of the cart item to remove
   */
  async removeItem(cart_item_id: string): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      // Also find and delete any child items if this is a parent base product
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        const items = getAllRequest.result as CartItem[];
        const children = items.filter(i => i.referenceId === cart_item_id);
        
        // Delete the parent
        store.delete(cart_item_id);
        
        // Delete all children
        for (const child of children) {
          store.delete(child.cart_item_id);
        }
      };

      transaction.oncomplete = () => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('highkey:cart-updated'));
        }
        resolve();
      };
      transaction.onerror = () => reject(new Error('Failed to remove item from cart'));
    });
  }

  /**
   * Sets the exact quantity for a specific cart item. Removes the item if quantity is <= 0.
   * @param cart_item_id The ID of the cart item
   * @param quantity The new quantity to set
   */
  async updateItemQuantity(cart_item_id: string, quantity: number): Promise<void> {
    if (quantity <= 0) {
      return this.removeItem(cart_item_id);
    }

    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const getRequest = store.get(cart_item_id);
      
      getRequest.onsuccess = () => {
        const item = getRequest.result as CartItem;
        if (!item) {
          reject(new Error('Item not found'));
          return;
        }
        
        item.quantity = quantity;
        store.put(item);

        // Scaling child patches linked to this parent item
        const getAllRequest = store.getAll();
        getAllRequest.onsuccess = () => {
          const allItems = getAllRequest.result as CartItem[];
          const children = allItems.filter(i => i.referenceId === cart_item_id);
          for (const child of children) {
            child.quantity = quantity;
            store.put(child);
          }
        };
      };
      
      transaction.oncomplete = () => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('highkey:cart-updated'));
        }
        resolve();
      };
      transaction.onerror = () => reject(new Error('Failed to update item quantity'));
    });
  }

  /**
   * Retrieves all items currently stored in the cart.
   * @returns A promise that resolves to an array of CartItem
   */
  async getAllItems(): Promise<CartItem[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result as CartItem[]);
      };
      request.onerror = () => reject(new Error('Failed to get all cart items'));
    });
  }

  /**
   * Empties all items from the cart.
   */
  async clearCart(): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('highkey:cart-updated'));
        }
        resolve();
      };
      request.onerror = () => reject(new Error('Failed to clear cart'));
    });
  }

  /**
   * Helper method to get the total number of items in the cart (sum of quantities).
   */
  async getTotalQuantity(): Promise<number> {
    const items = await this.getAllItems();
    return items.reduce((total, item) => total + item.quantity, 0);
  }
}

// Export a singleton instance to be used throughout the app
export const cartEngine = new CartEngine();
