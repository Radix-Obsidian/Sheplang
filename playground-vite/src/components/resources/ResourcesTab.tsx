import React, { useState } from 'react';
import { Book, Zap, Users, Code, ArrowRight, Search, ExternalLink, RefreshCw } from 'lucide-react';
import './ResourcesTab.css';

interface Resource {
  id: string;
  title: string;
  description: string;
  readTime: string;
  difficulty: string;
  icon: React.ComponentType<any>;
  path: string;
  featured?: boolean;
}

const resources: Resource[] = [
  {
    id: 'quick-start',
    title: 'Quick Start Guide',
    description: 'Build your first ShepLang app in 2 minutes. Perfect for beginners!',
    readTime: '2 min',
    difficulty: 'Beginner',
    icon: Zap,
    path: '/resources/01-quick-start.md',
    featured: true,
  },
  {
    id: 'syntax-cheat-sheet',
    title: 'Syntax Cheat Sheet',
    description: 'Complete reference for ShepLang syntax with playground examples.',
    readTime: '10 min',
    difficulty: 'Beginner',
    icon: Code,
    path: '/resources/02-syntax-cheat-sheet.md',
  },
  {
    id: 'playground-vs-extension',
    title: 'Playground vs Extension',
    description: 'Compare features and discover when to level up to the VS Code extension.',
    readTime: '8 min',
    difficulty: 'Beginner',
    icon: Users,
    path: '/resources/03-playground-vs-extension.md',
  },
  {
    id: 'react-typescript-comparison',
    title: 'React & TypeScript Comparison',
    description: 'Understand why React/TypeScript appear in the playground and ShepLang\'s advantages.',
    readTime: '12 min',
    difficulty: 'Intermediate',
    icon: Code,
    path: '/resources/04-react-typescript-overlay.md',
  },
  {
    id: 'migration-guide',
    title: 'Migration Guide',
    description: 'Step-by-step guide to move from playground to full VS Code extension.',
    readTime: '15 min',
    difficulty: 'Intermediate',
    icon: ArrowRight,
    path: '/resources/05-migration-guide.md',
    featured: true,
  },
];

const ResourcesTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  // Reset overlay dismissal state
  const resetOverlays = () => {
    localStorage.removeItem('sheplang-react-overlay-seen');
    localStorage.removeItem('sheplang-typescript-overlay-seen');
    
    // Show confirmation
    const button = document.querySelector('.reset-overlays-btn') as HTMLButtonElement;
    if (button) {
      const originalText = button.textContent;
      button.textContent = '✅ Overlays Reset!';
      button.style.backgroundColor = '#10b981';
      
      setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = '';
      }, 2000);
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || 
                             resource.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
    return matchesSearch && matchesDifficulty;
  });

  const featuredResources = resources.filter(resource => resource.featured);

  const openResource = (path: string) => {
    window.open(path, '_blank');
  };

  return (
    <div className="resources-tab">
      {/* Header */}
      <div className="resources-header">
        <div className="header-content">
          <div className="header-text">
            <h1>
              <Book className="header-icon" />
              ShepLang Resources
            </h1>
            <p>Master ShepLang with our comprehensive guides and tutorials</p>
          </div>
          <div className="header-actions">
            <button 
              className="extension-cta"
              onClick={() => window.open('https://marketplace.visualstudio.com/items?itemName=GoldenSheepAI.sheplang-vscode', '_blank')}
            >
              <Code size={16} />
              Download VS Code Extension
            </button>
          </div>
        </div>
      </div>

      {/* Featured Resources */}
      {featuredResources.length > 0 && (
        <div className="featured-section">
          <h2>🌟 Featured Guides</h2>
          <div className="featured-grid">
            {featuredResources.map(resource => {
              const IconComponent = resource.icon;
              return (
                <div 
                  key={resource.id}
                  className="featured-card"
                  onClick={() => openResource(resource.path)}
                >
                  <div className="featured-icon">
                    <IconComponent size={24} />
                  </div>
                  <div className="featured-content">
                    <h3>{resource.title}</h3>
                    <p>{resource.description}</p>
                    <div className="featured-meta">
                      <span className="read-time">⏱️ {resource.readTime}</span>
                      <span className="difficulty">{resource.difficulty}</span>
                    </div>
                  </div>
                  <div className="featured-action">
                    <ArrowRight size={20} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="resources-controls">
        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-container">
          <label htmlFor="difficulty-filter">Level:</label>
          <select
            id="difficulty-filter"
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="difficulty-select"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* All Resources */}
      <div className="resources-grid">
        {filteredResources.map(resource => {
          const IconComponent = resource.icon;
          return (
            <div 
              key={resource.id}
              className="resource-card"
              onClick={() => openResource(resource.path)}
            >
              <div className="resource-icon">
                <IconComponent size={20} />
              </div>
              <div className="resource-content">
                <h3>{resource.title}</h3>
                <p>{resource.description}</p>
                <div className="resource-meta">
                  <span className="read-time">⏱️ {resource.readTime}</span>
                  <span className={`difficulty ${resource.difficulty.toLowerCase()}`}>
                    {resource.difficulty}
                  </span>
                </div>
              </div>
              <div className="resource-action">
                <ExternalLink size={16} />
              </div>
            </div>
          );
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className="no-results">
          <Book size={48} className="no-results-icon" />
          <h3>No resources found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      )}

      {/* Footer */}
      <div className="resources-footer">
        <div className="footer-content">
          <div className="footer-text">
            <h3>Ready to build something amazing?</h3>
            <p>Start with the Quick Start guide and work your way up to full-stack applications.</p>
          </div>
          <div className="footer-actions">
            <button 
              className="reset-overlays-btn"
              onClick={resetOverlays}
              title="Reset tutorial overlays to see them again"
            >
              <RefreshCw size={16} />
              Reset Tutorial Overlays
            </button>
            <button 
              className="github-cta"
              onClick={() => window.open('https://github.com/Radix-Obsidian/Sheplang-BobaScript', '_blank')}
            >
              ⭐ Star on GitHub
            </button>
            <button 
              className="discord-cta"
              onClick={() => window.open('https://discord.gg/sheplang', '_blank')}
            >
              💬 Join Discord
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesTab;
