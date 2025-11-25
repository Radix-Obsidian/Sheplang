import React from 'react';
import { X, Info, Zap, BookOpen } from 'lucide-react';
import './Overlay.css';

interface ReactOverlayProps {
  isVisible: boolean;
  onClose: (permanent?: boolean) => void;
}

const ReactOverlay: React.FC<ReactOverlayProps> = ({ isVisible, onClose }) => {
  const handleDismiss = (permanent: boolean = false) => {
    onClose(permanent);
  };

  if (!isVisible) return null;

  return (
    <div className="overlay-backdrop" onClick={(e) => e.target === e.currentTarget && handleDismiss()}>
      <div className="overlay-content">
        {/* Header */}
        <div className="overlay-header">
          <div className="overlay-title">
            <Info className="title-icon" />
            <div>
              <h2>Why React in a ShepLang Playground?</h2>
              <p>ShepLang generates React - it's the construction crew for your architect's blueprint</p>
            </div>
          </div>
          <button 
            className="close-button" 
            onClick={() => handleDismiss(false)}
            aria-label="Close overlay"
          >
            <X size={20} />
          </button>
        </div>

        {/* Code Comparison */}
        <div className="comparison-section">
          <h3>Same App, Two Languages</h3>
          <div className="code-comparison">
            <div className="code-column sheplang-column">
              <div className="column-header">
                <h4>🎨 ShepLang</h4>
                <span className="line-count">8 lines</span>
              </div>
              <div className="code-block">
                <pre><code>{`app TodoApp {
  data Task {
    fields: {
      title: text
      completed: yes/no
    }
  }
  
  view Dashboard {
    list Task
    button "Add Task" -> TaskForm
  }
}`}</code></pre>
              </div>
              <div className="column-footer">
                <span className="readability">✅ Plain English</span>
              </div>
            </div>

            <div className="vs-divider">VS</div>

            <div className="code-column react-column">
              <div className="column-header">
                <h4>⚛️ React</h4>
                <span className="line-count">15+ lines</span>
              </div>
              <div className="code-block">
                <pre><code>{`function Dashboard() {
  const [tasks, setTasks] = useState([]);
  
  const handleAddTask = (title) => {
    const newTask = {
      id: Date.now().toString(),
      title,
      completed: false
    };
    setTasks([...tasks, newTask]);
  };
  
  return (
    <div>
      {tasks.map(task => (
        <li key={task.id}>
          {task.title}
        </li>
      ))}
    </div>
  );
}`}</code></pre>
              </div>
              <div className="column-footer">
                <span className="readability">🤓 JavaScript code</span>
              </div>
            </div>
          </div>
        </div>

        {/* Advantages */}
        <div className="advantages-section">
          <h3>Why ShepLang Wins</h3>
          <div className="advantages-grid">
            <div className="advantage-item winner">
              <Zap className="advantage-icon" />
              <div className="advantage-content">
                <h4>62% Less Code</h4>
                <p>8 lines vs 15+ lines for the same app</p>
              </div>
            </div>
            <div className="advantage-item winner">
              <Zap className="advantage-icon" />
              <div className="advantage-content">
                <h4>2 Hours vs 6 Months</h4>
                <p>Learn ShepLang in hours, React takes months</p>
              </div>
            </div>
            <div className="advantage-item winner">
              <Zap className="advantage-icon" />
              <div className="advantage-content">
                <h4>Built-in Safety</h4>
                <p>Catch errors before they happen</p>
              </div>
            </div>
          </div>
        </div>

        {/* The Blueprint Analogy */}
        <div className="analogy-section">
          <div className="analogy-content">
            <h3>🏗️ Architect vs Construction Crew</h3>
            <p>
              <strong>ShepLang</strong> is your architect's blueprint - you describe WHAT you want to build in plain English.<br/>
              <strong>React</strong> is the construction crew - detailed instructions for the browser to follow.
            </p>
            <p>Both are valuable, but only one is designed for humans to write directly.</p>
          </div>
        </div>

        {/* Actions */}
        <div className="overlay-actions">
          <div className="checkbox-group">
            <input 
              type="checkbox" 
              id="dont-show-react" 
              onChange={(e) => handleDismiss(e.target.checked)}
            />
            <label htmlFor="dont-show-react">Don't show this again</label>
          </div>
          <div className="action-buttons">
            <button 
              className="secondary-button" 
              onClick={() => handleDismiss(false)}
            >
              Got it
            </button>
            <button 
              className="primary-button"
              onClick={() => {
                // Open resources tab or link to documentation
                window.open('/resources/04-react-typescript-overlay.md', '_blank');
              }}
            >
              <BookOpen size={16} />
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReactOverlay;
