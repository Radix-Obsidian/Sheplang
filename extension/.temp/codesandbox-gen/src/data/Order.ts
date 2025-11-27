/**
 * Order - Generated from ShepLang
 */
export interface Order {
  id: string;
  title: string;
  status: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create a new Order
 */
export function createOrder(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order {
  return {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * Local storage key for Order
 */
const STORAGE_KEY = 'orders';

/**
 * Get all Orders from local storage
 */
export function getAllOrders(): Order[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Save Orders to local storage
 */
export function saveOrders(items: Order[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/**
 * Add a Order
 */
export function addOrder(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order {
  const items = getAllOrders();
  const newItem = createOrder(data);
  items.push(newItem);
  saveOrders(items);
  return newItem;
}

/**
 * Delete a Order
 */
export function deleteOrder(id: string): void {
  const items = getAllOrders();
  const filtered = items.filter(item => item.id !== id);
  saveOrders(filtered);
}
