/**
 * Phase 7: ShepUI Screen Templates
 * Generate production-ready React components for different screen types
 * Following patterns from: react.dev and FreeCodeCamp Intersection Observer tutorial
 */

import type { AppModel } from '@goldensheepai/sheplang-language';
import type { ScreenModel } from './screen-parser.js';
import {
  parseScreens,
  shouldUseInfiniteScroll,
  shouldHaveImageGallery,
  getFormFields
} from './screen-parser.js';

/**
 * Generate Feed Screen with Infinite Scroll
 * Based on: https://www.freecodecamp.org/news/infinite-scrolling-in-react/
 */
export function generateFeedScreen(screen: ScreenModel): string {
  const entityName = screen.entity || 'Item';
  const entityVar = entityName.toLowerCase() + 's';
  const entitySingle = entityName.toLowerCase();
  
  return `// Auto-generated Feed Screen by ShepLang
import { useState, useEffect, useRef, useCallback } from 'react';
import type { ${entityName} } from '../models/${entityName}';
import { use${entityName}sRealtime } from '../hooks/use${entityName}Realtime';

interface ${screen.name}Props {}

export function ${screen.name}(props: ${screen.name}Props) {
  const [${entityVar}, set${entityName}s] = useState<${entityName}[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real-time updates
  const { data: realtime${entityName}s } = use${entityName}sRealtime();
  
  // Fetch data for current page
  useEffect(() => {
    if (!hasMore) return;
    
    setLoading(true);
    fetch(\`/api/${entityVar}?page=\${page}&search=\${searchQuery}\`)
      .then(res => res.json())
      .then(data => {
        if (data.length === 0) {
          setHasMore(false);
        } else {
          set${entityName}s(prev => [...prev, ...data]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load ${entityVar}:', err);
        setLoading(false);
      });
  }, [page, searchQuery]);
  
  // Merge real-time updates
  useEffect(() => {
    if (realtime${entityName}s && realtime${entityName}s.length > 0) {
      set${entityName}s(prev => {
        const existingIds = new Set(prev.map(item => item.id));
        const newItems = realtime${entityName}s.filter((item: ${entityName}) => !existingIds.has(item.id));
        return [...newItems, ...prev];
      });
    }
  }, [realtime${entityName}s]);
  
  // Intersection Observer for infinite scroll
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    }, { threshold: 0.5 });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);
  
  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    set${entityName}s([]);
    setPage(1);
    setHasMore(true);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">${screen.name}</h1>
        
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search ${entityVar}..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      {/* Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {${entityVar}.map((${entitySingle}, index) => (
          <div
            key={${entitySingle}.id || index}
            ref={${entityVar}.length === index + 1 ? lastElementRef : null}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold mb-2">
              {${entitySingle}.name || ${entitySingle}.title || ${entitySingle}.id}
            </h3>
            <div className="text-gray-600">
              {JSON.stringify(${entitySingle}, null, 2)}
            </div>
          </div>
        ))}
      </div>
      
      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* End of feed message */}
      {!hasMore && ${entityVar}.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          No more ${entityVar} to load
        </div>
      )}
      
      {/* Empty state */}
      {${entityVar}.length === 0 && !loading && (
        <div className="text-center py-16 text-gray-500">
          No ${entityVar} found
        </div>
      )}
    </div>
  );
}
`;
}

/**
 * Generate Detail Screen with Image Gallery
 */
export function generateDetailScreen(screen: ScreenModel): string {
  const entityName = screen.entity || 'Item';
  const entityVar = entityName.toLowerCase();
  
  return `// Auto-generated Detail Screen by ShepLang
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { ${entityName} } from '../models/${entityName}';

interface ${screen.name}Props {}

export function ${screen.name}(props: ${screen.name}Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [${entityVar}, set${entityName}] = useState<${entityName} | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Fetch ${entityVar} data
  useEffect(() => {
    if (!id) return;
    
    fetch(\`/api/${entityVar.toLowerCase()}s/\${id}\`)
      .then(res => res.json())
      .then(data => {
        set${entityName}(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load ${entityVar}:', err);
        setLoading(false);
      });
  }, [id]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!${entityVar}) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">${entityName} not found</h1>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }
  
  // Mock images for gallery (replace with actual images from ${entityVar})
  const images = ${entityVar}.images || [];
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-600">
        <button onClick={() => navigate(-1)} className="hover:text-blue-600">
          ← Back
        </button>
      </nav>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          {images.length > 0 && (
            <div className="mb-6">
              <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={images[currentImageIndex]}
                  alt={${entityVar}.name || ${entityVar}.title || ''}
                  className="w-full h-full object-cover"
                />
                
                {/* Gallery Navigation */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(i => (i - 1 + images.length) % images.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(i => (i + 1) % images.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                    >
                      →
                    </button>
                  </>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto">
                  {images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={\`flex-shrink-0 w-20 h-20 rounded border-2 \${idx === currentImageIndex ? 'border-blue-500' : 'border-gray-300'}\`}
                    >
                      <img src={img} alt={\`Thumbnail \${idx + 1}\`} className="w-full h-full object-cover rounded" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Content */}
          <h1 className="text-3xl font-bold mb-4">
            {${entityVar}.name || ${entityVar}.title || 'Untitled'}
          </h1>
          
          <div className="prose max-w-none">
            <p className="text-gray-600">
              {${entityVar}.description || 'No description available'}
            </p>
          </div>
          
          {/* All fields */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Details</h3>
            <pre className="text-sm text-gray-600 overflow-auto">
              {JSON.stringify(${entityVar}, null, 2)}
            </pre>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">Actions</h3>
            <div className="space-y-2">
              {${screen.features.actions?.map(action => `
              <button
                onClick={() => console.log('${action} clicked')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                ${action}
              </button>`).join('\n              ') || '<!-- No actions defined -->'}}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`;
}

/**
 * Generate Form Screen with Validation
 * Integrates with Phase 5 validation
 */
export function generateFormScreen(screen: ScreenModel, app: AppModel): string {
  const entityName = screen.entity || 'Item';
  const entityVar = entityName.toLowerCase();
  const fields = getFormFields(screen, app);
  
  return `// Auto-generated Form Screen by ShepLang
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { use${entityName}Validation } from '../validation/${entityName}Validation';
import type { ${entityName} } from '../models/${entityName}';

interface ${screen.name}Props {}

export function ${screen.name}(props: ${screen.name}Props) {
  const navigate = useNavigate();
  const { validate } = use${entityName}Validation();
  
  const [formData, setFormData] = useState<Partial<${entityName}>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate using Phase 5 validation
    const validation = validate(formData);
    
    if (!validation.success) {
      setErrors(validation.errors || {});
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/${entityVar.toLowerCase()}s', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validation.data)
      });
      
      if (!response.ok) {
        const error = await response.json();
        setErrors(error.errors || { _general: error.message });
        setIsSubmitting(false);
        return;
      }
      
      const created = await response.json();
      navigate(\`/${entityVar.toLowerCase()}s/\${created.id}\`);
    } catch (error) {
      console.error('Failed to create ${entityVar}:', error);
      setErrors({ _general: 'Failed to create ${entityVar}. Please try again.' });
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">${screen.name}</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors._general && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {errors._general}
          </div>
        )}
        
        ${fields.map(field => `
        {/* ${field.name} field */}
        <div>
          <label htmlFor="${field.name}" className="block text-sm font-medium text-gray-700 mb-2">
            ${field.name.charAt(0).toUpperCase() + field.name.slice(1)}
          </label>
          <input
            id="${field.name}"
            type="${field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}"
            value={formData.${field.name} || ''}
            onChange={(e) => handleChange('${field.name}', ${field.type === 'number' ? 'parseFloat(e.target.value)' : 'e.target.value'})}
            className={\`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 \${errors.${field.name} ? 'border-red-500' : 'border-gray-300'}\`}
          />
          {errors.${field.name} && (
            <p className="mt-1 text-sm text-red-600">{errors.${field.name}}</p>
          )}
        </div>`).join('\n        ')}
        
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}
`;
}

/**
 * Generate all screen files for an app
 */
export function generateScreens(app: AppModel): Array<{path: string; content: string}> {
  const screens = parseScreens(app);
  const files: Array<{path: string; content: string}> = [];
  
  screens.forEach(screen => {
    let content: string;
    
    if (shouldUseInfiniteScroll(screen)) {
      content = generateFeedScreen(screen);
    } else if (shouldHaveImageGallery(screen)) {
      content = generateDetailScreen(screen);
    } else if (screen.entity) {
      // If it has an entity, generate a form
      content = generateFormScreen(screen, app);
    } else {
      // Fallback to basic view
      content = generateBasicScreen(screen);
    }
    
    files.push({
      path: `screens/${screen.name}.tsx`,
      content
    });
  });
  
  return files;
}

/**
 * Generate basic screen (fallback)
 */
function generateBasicScreen(screen: ScreenModel): string {
  return `// Auto-generated Basic Screen by ShepLang
import { useState } from 'react';

interface ${screen.name}Props {}

export function ${screen.name}(props: ${screen.name}Props) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">${screen.name}</h1>
      <p className="text-gray-600">This is a placeholder screen.</p>
    </div>
  );
}
`;
}
