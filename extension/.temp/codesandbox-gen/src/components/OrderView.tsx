import { useState, useEffect } from 'react'
import { Order, getAllOrders, addOrder, deleteOrder } from '../data/Order'
import { Plus, Trash2, Check } from 'lucide-react'

interface OrderViewProps {
  onNavigate: (view: string) => void;
}

export default function OrderView({ onNavigate }: OrderViewProps) {
  const [items, setItems] = useState<Order[]>([])
  const [newItemTitle, setNewItemTitle] = useState('')
  
  useEffect(() => {
    setItems(getAllOrders())
  }, [])
  
  const handleAdd = () => {
    if (!newItemTitle.trim()) return
    const newItem = addOrder({ title: newItemTitle } as any)
    setItems([...items, newItem])
    setNewItemTitle('')
  }
  
  const handleDelete = (id: string) => {
    deleteOrder(id)
    setItems(items.filter(item => item.id !== id))
  }
  
  const handleToggle = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, done: !item.done } : item
    ))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">OrderView</h2>
      </div>
      
      {/* Add new item */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newItemTitle}
          onChange={(e) => setNewItemTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add new order..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Add
        </button>
      </div>
      
      {/* List of items */}
      <div className="bg-white rounded-lg shadow divide-y">
        {items.length === 0 ? (
          <p className="p-4 text-gray-500 text-center">No orders yet. Add one above!</p>
        ) : (
          items.map(item => (
            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-3">
                
                <span className={item.done ? 'line-through text-gray-400' : ''}>{item.title}</span>
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
      
      {/* Navigation buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => handleAdd()}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          New Order
        </button>
      </div>
    </div>
  )
}
