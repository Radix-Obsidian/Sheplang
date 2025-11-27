import { useState } from 'react'
import OrderView from './components/OrderView'

function App() {
  const [currentView, setCurrentView] = useState('OrderView')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">FullApp</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentView === 'OrderView' && <OrderView onNavigate={setCurrentView} />}
        
      </main>
      
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-gray-500 text-sm">
          Built with ShepLang
        </div>
      </footer>
    </div>
  )
}

export default App
