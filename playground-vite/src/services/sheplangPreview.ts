/**
 * Generate HTML preview from ShepLang code
 * This is a simplified client-side implementation for the Vite playground
 */
export async function generatePreview(code: string): Promise<string> {
  try {
    // Parse ShepLang code
    const parsed = parseShepLang(code);
    const { appName, views, dataModels, actions } = parsed;
    
    // Determine initial view
    const initialView = views.length > 0 ? views[0].name : 'Dashboard';
    
    // Generate interactive HTML with JavaScript runtime
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName} - ShepLang Preview</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #ff6600 0%, #ff8533 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    
    .app-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 600px;
      width: 100%;
      overflow: hidden;
    }
    
    .app-header {
      background: linear-gradient(135deg, #ff6600 0%, #ff8533 100%);
      color: white;
      padding: 24px;
      text-align: center;
    }
    
    .app-header h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    
    .app-header p {
      opacity: 0.9;
      font-size: 14px;
    }
    
    .app-content {
      padding: 32px;
    }
    
    .section {
      margin-bottom: 32px;
    }
    
    .section:last-child {
      margin-bottom: 0;
    }
    
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
    }
    
    .section-title::before {
      content: '';
      display: inline-block;
      width: 4px;
      height: 20px;
      background: #ff6600;
      margin-right: 12px;
      border-radius: 2px;
    }
    
    .text-element {
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      margin-bottom: 12px;
      color: #495057;
      line-height: 1.6;
    }
    
    .button-element {
      display: inline-block;
      padding: 12px 24px;
      background: linear-gradient(135deg, #ff6600 0%, #ff8533 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-right: 12px;
      margin-bottom: 12px;
      box-shadow: 0 4px 12px rgba(255, 102, 0, 0.4);
    }
    
    .button-element:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(255, 102, 0, 0.6);
    }
    
    .button-element:active {
      transform: scale(0.98);
    }
    
    .input-element {
      width: 100%;
      padding: 12px;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      font-size: 14px;
      margin-bottom: 12px;
      transition: border-color 0.3s ease;
    }
    
    .input-element:focus {
      outline: none;
      border-color: #ff6600;
    }
    
    .list-container {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 16px;
      min-height: 100px;
    }
    
    .list-empty {
      text-align: center;
      color: #6c757d;
      font-size: 14px;
      padding: 24px;
    }
    
    .list-item {
      padding: 12px;
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 6px;
      margin-bottom: 8px;
      color: #495057;
      font-size: 14px;
    }
    
    .badge {
      display: inline-block;
      padding: 4px 12px;
      background: #ff6600;
      color: white;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      margin-right: 8px;
      margin-bottom: 8px;
    }
    
    .empty-state {
      text-align: center;
      padding: 48px 24px;
      color: #6c757d;
    }
    
    .empty-state-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
  </style>
</head>
<body>
  <div id="app"></div>
  
  <script>
    // ShepLang Runtime State
    const state = {
      currentView: '${initialView}',
      data: {${dataModels.map(model => `${model.name}: []`).join(',')}}${dataModels.length > 0 ? ',' : ''}
      inputs: {}
    };
    
    // Initialize data stores
    ${dataModels.map(model => `state.data.${model.name} = [];`).join('\n    ')}
    
    // Parsed ShepLang structure
    const shepApp = ${JSON.stringify({ appName, views, dataModels, actions }, null, 2)};
    
    // Action handlers
    const actionHandlers = {
      ${actions.map(action => `
      ${action.name}: function(${action.params.join(', ')}) {
        ${action.operations.map((op: any) => {
          if (op.type === 'add') {
            // Parse field assignments from data expression
            const dataExpr = op.data;
            // Handle both param references and literals like "High", true, false, 123
            const assignments = dataExpr.split(',').map((assign: any) => {
              const parts = assign.trim().split('=');
              if (parts.length === 2) {
                const fieldName = parts[0].trim();
                const value = parts[1].trim();
                // If it's a quoted string, keep quotes; if it's a param, use param; if it's a boolean/number, use as is
                if (value.startsWith('"') || value.startsWith("'")) {
                  // Literal string
                  return `${fieldName}: ${value}`;
                } else if (value === 'true' || value === 'false') {
                  // Boolean literal
                  return `${fieldName}: ${value}`;
                } else if (!isNaN(Number(value))) {
                  // Number literal
                  return `${fieldName}: ${value}`;
                } else {
                  // Parameter reference
                  return `${fieldName}: ${value}`;
                }
              }
              return assign.trim();
            }).join(', ');
            return `
        // Add to ${op.model}
        const newItem = { id: Date.now(), ${assignments} };
        state.data.${op.model}.push(newItem);
        console.log('Added to ${op.model}:', newItem);
        console.log('Current ${op.model} data:', state.data.${op.model});`;
          } else if (op.type === 'delete') {
            return `
        // Delete from ${op.model}
        const id = ${op.id};
        state.data.${op.model} = state.data.${op.model}.filter(item => item.id !== id);
        console.log('Deleted from ${op.model}:', id);`;
          } else if (op.type === 'deleteWhere') {
            return `
        // Delete where ${op.condition}
        state.data.${op.model} = state.data.${op.model}.filter(item => !(${op.condition.replace(/=/g, '===').replace(/done === true/g, 'item.done === true')}));
        console.log('Deleted where ${op.condition}');`;
          } else if (op.type === 'toggle') {
            return `
        // Toggle ${op.model}[${op.id}].${op.field}
        const item = state.data.${op.model}.find(i => i.id === ${op.id});
        if (item) {
          item.${op.field} = !item.${op.field};
          console.log('Toggled ${op.field}:', item);
        }`;
          } else if (op.type === 'clear') {
            return `
        // Clear ${op.model}
        state.data.${op.model} = [];
        console.log('Cleared ${op.model}');`;
          } else if (op.type === 'show') {
            return `
        // Navigate to ${op.view}
        state.currentView = '${op.view}';
        console.log('Navigated to ${op.view}');`;
          }
          return '';
        }).join('')}
        render();
      }`).join(',')}
    };
    
    // Render function
    function render() {
      console.log('Render called. Current state:', state);
      const currentViewData = shepApp.views.find(v => v.name === state.currentView);
      if (!currentViewData) {
        document.getElementById('app').innerHTML = '<div class="empty-state"><p>View not found</p></div>';
        return;
      }
      console.log('Current view data:', currentViewData);
      
      let html = '<div class="app-container">';
      html += '<div class="app-header">';
      html += '<h1>' + shepApp.appName + '</h1>';
      html += '<p>Interactive ShepLang Application</p>';
      html += '</div>';
      html += '<div class="app-content">';
      
      // Render texts
      if (currentViewData.texts && currentViewData.texts.length > 0) {
        html += '<div class="section"><div class="section-title">Content</div>';
        currentViewData.texts.forEach(text => {
          html += '<div class="text-element">' + text + '</div>';
        });
        html += '</div>';
      }
      
      // Render inputs with proper type support
      if (currentViewData.inputs && currentViewData.inputs.length > 0) {
        html += '<div class="section"><div class="section-title">Inputs</div>';
        currentViewData.inputs.forEach(input => {
          const inputName = typeof input === 'string' ? input : input.name;
          const inputType = typeof input === 'object' && input.type === 'number' ? 'number' : 'text';
          html += '<input type="' + inputType + '" class="input-element" data-input-name="' + inputName + '" placeholder="Enter ' + inputName + '" />';
        });
        html += '</div>';
      }
      
      // Render lists
      console.log('Rendering lists:', currentViewData.lists, 'Data:', state.data);
      if (currentViewData.lists && currentViewData.lists.length > 0) {
        currentViewData.lists.forEach(listName => {
          html += '<div class="section"><div class="section-title">' + listName + ' List (' + (state.data[listName] ? state.data[listName].length : 0) + ')</div>';
          html += '<div class="list-container">';
          const items = state.data[listName] || [];
          if (items.length === 0) {
            html += '<div class="list-empty">No ' + listName.toLowerCase() + ' items yet - try adding one!</div>';
          } else {
            items.forEach((item, idx) => {
              html += '<div class="list-item" style="display: flex; align-items: center; gap: 12px;">';
              
              // If item has 'done' field, add checkbox
              if ('done' in item) {
                html += '<input type="checkbox" class="item-checkbox" data-item-id="' + item.id + '" data-model="' + listName + '" ' + (item.done ? 'checked' : '') + ' style="width: 18px; height: 18px; cursor: pointer;">';
              }
              
              // Item content with proper field type rendering
              html += '<div style="flex: 1;">';
              const displayFields = Object.entries(item).filter(([key]) => key !== 'id' && key !== 'done');
              if (displayFields.length > 0) {
                html += displayFields.map(([key, val]) => {
                  // Format based on value type
                  let formattedVal = val;
                  if (typeof val === 'number') {
                    formattedVal = val.toLocaleString();
                  } else if (typeof val === 'boolean') {
                    formattedVal = val ? '✓ Yes' : '✗ No';
                  }
                  return '<strong>' + key + ':</strong> ' + formattedVal;
                }).join(' | ');
              } else if (item.text) {
                html += item.text;
              }
              if ('done' in item && item.done) {
                html += ' <span style="color: #28a745; font-weight: bold;">✓ Complete</span>';
              }
              html += '</div>';
              
              // Delete button
              html += '<button class="delete-btn" data-item-id="' + item.id + '" data-model="' + listName + '" style="background: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">Delete</button>';
              
              html += '</div>';
            });
          }
          html += '</div></div>';
        });
      }
      
      // Render buttons
      if (currentViewData.buttons && currentViewData.buttons.length > 0) {
        html += '<div class="section"><div class="section-title">Actions</div>';
        currentViewData.buttons.forEach((button, idx) => {
          const buttonParams = button.params || [];
          html += '<button class="button-element" data-action="' + button.action + '" data-button-idx="' + idx + '" data-params="' + buttonParams.join(',') + '">' + button.label + '</button>';
        });
        html += '</div>';
      }
      
      html += '</div></div>';
      document.getElementById('app').innerHTML = html;
      
      // Attach input listeners with type conversion
      if (currentViewData.inputs) {
        currentViewData.inputs.forEach(input => {
          const inputName = typeof input === 'string' ? input : input.name;
          const inputType = typeof input === 'object' ? input.type : 'text';
          const inputEl = document.querySelector('[data-input-name="' + inputName + '"]');
          if (inputEl) {
            inputEl.addEventListener('input', (e) => {
              let value = e.target.value;
              // Convert to proper type
              if (inputType === 'number') {
                value = value === '' ? 0 : parseFloat(value) || 0;
              }
              state.inputs[inputName] = value;
            });
          }
        });
      }
      
      // Attach button listeners
      document.querySelectorAll('.button-element').forEach(btn => {
        btn.addEventListener('click', () => {
          const actionName = btn.getAttribute('data-action');
          const buttonParams = btn.getAttribute('data-params');
          const handler = actionHandlers[actionName];
          if (handler) {
            // Get param values from inputs or button definition
            let params = [];
            if (buttonParams && buttonParams.length > 0) {
              // Button has params defined (e.g., CreateUser(name, email))
              params = buttonParams.split(',').map(param => {
                const trimmedParam = param.trim();
                // Get value from input state
                return state.inputs[trimmedParam] || '';
              });
            } else if (currentViewData.inputs) {
              // No button params, use all inputs in view
              params = currentViewData.inputs.map(inp => {
                const inputName = typeof inp === 'string' ? inp : inp.name;
                return state.inputs[inputName] || '';
              });
            }
            console.log('Executing action:', actionName, 'with params:', params);
            handler(...params);
            
            // Notify parent about user interaction
            if (window.parent) {
              window.parent.postMessage({ type: 'sheplang-interaction' }, '*');
            }
            // Clear inputs after action
            if (currentViewData.inputs) {
              currentViewData.inputs.forEach(inp => {
                const inputName = typeof inp === 'string' ? inp : inp.name;
                state.inputs[inputName] = '';
              });
            }
          } else {
            console.warn('Action not found:', actionName);
          }
        });
      });
      
      // Attach delete button listeners
      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const itemId = parseInt(btn.getAttribute('data-item-id'));
          const modelName = btn.getAttribute('data-model');
          if (actionHandlers.DeleteTodo) {
            actionHandlers.DeleteTodo(itemId);
          } else if (actionHandlers['Delete' + modelName]) {
            actionHandlers['Delete' + modelName](itemId);
          } else {
            // Generic delete
            state.data[modelName] = state.data[modelName].filter(item => item.id !== itemId);
            render();
          }
        });
      });
      
      // Attach checkbox listeners for toggle
      document.querySelectorAll('.item-checkbox').forEach(cb => {
        cb.addEventListener('change', () => {
          const itemId = parseInt(cb.getAttribute('data-item-id'));
          const modelName = cb.getAttribute('data-model');
          if (actionHandlers.ToggleTodo) {
            actionHandlers.ToggleTodo(itemId);
          } else {
            // Generic toggle
            const item = state.data[modelName].find(i => i.id === itemId);
            if (item && 'done' in item) {
              item.done = !item.done;
              render();
            }
          }
        });
      });
    }
    
    // Initial render
    render();
  </script>
</body>
</html>`;

  } catch (error: unknown) {
    console.error('Preview generation error:', error);
    return `<!DOCTYPE html>
<html>
<head>
  <title>ShepLang Preview Error</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      padding: 2rem;
      background: #fff1f0;
      color: #d32f2f;
    }
    h1 { margin-bottom: 1rem; }
    pre { 
      background: #ffebee;
      padding: 1rem;
      border-radius: 0.25rem;
      white-space: pre-wrap;
      overflow-wrap: break-word;
    }
  </style>
</head>
<body>
  <h1>Error Generating Preview</h1>
  <pre>${error instanceof Error ? error.message : String(error)}</pre>
</body>
</html>`;
  }
}

/**
 * Parse ShepLang code into structured data
 */
function parseShepLang(code: string) {
  // Extract app name
  const appMatch = code.match(/^app\s+(\w+)/m);
  const appName = appMatch ? appMatch[1] : 'ShepLang App';
  
  // Extract views with their content
  const views: any[] = [];
  const viewRegex = /view\s+(\w+):\s*([\s\S]*?)(?=(?:view\s+\w+:|action\s+\w+\(|data\s+\w+:|$))/g;
  let viewMatch;
  while ((viewMatch = viewRegex.exec(code)) !== null) {
    const viewName = viewMatch[1];
    const viewContent = viewMatch[2];
    
    // Extract elements from view content
    const texts = [...viewContent.matchAll(/text\s+"([^"]+)"/g)].map(m => m[1]);
    console.log('Parsed texts for view ' + viewName + ':', texts, 'from content:', viewContent);
    // Parse buttons with action name and optional parameters
    const buttons = [...viewContent.matchAll(/button\s+"([^"]+)"\s+->\s+(\w+)(?:\(([^)]*)\))?/g)].map(m => ({
      label: m[1],
      action: m[2],
      params: m[3] ? m[3].split(',').map((p: string) => p.trim()) : []
    }));
    const lists = [...viewContent.matchAll(/list\s+(\w+)/g)].map(m => m[1]);
    console.log('Parsed lists for view ' + viewName + ':', lists);
    // Enhanced input parsing: supports text, number
    const inputs = [...viewContent.matchAll(/input\s+(\w+)\s+as\s+(\w+)/g)].map(m => ({
      name: m[1],
      type: m[2] // 'text' or 'number'
    }));
    
    views.push({ name: viewName, texts, buttons, lists, inputs });
  }
  
  // Extract data models with enhanced field type support
  const dataModels: any[] = [];
  const dataRegex = /data\s+(\w+):\s*fields:\s*([\s\S]*?)(?=(?:view\s+\w+:|action\s+\w+\(|data\s+\w+:|$))/g;
  let dataMatch;
  while ((dataMatch = dataRegex.exec(code)) !== null) {
    const modelName = dataMatch[1];
    const fieldsContent = dataMatch[2];
    // Enhanced field parsing: supports text, number, yes/no
    const fields = [...fieldsContent.matchAll(/(\w+):\s*([^\n]+)/g)].map(m => {
      const fieldType = m[2].trim();
      return {
        name: m[1],
        type: fieldType,
        // Determine field category for rendering
        category: fieldType.includes('number') ? 'number' : 
                fieldType.includes('yes/no') ? 'boolean' : 'text'
      };
    });
    dataModels.push({ name: modelName, fields });
  }
  
  // Extract actions with enhanced operation parsing
  const actions: any[] = [];
  const actionRegex = /action\s+(\w+)\(([^)]*)\):\s*([\s\S]*?)(?=(?:view\s+\w+:|action\s+\w+\(|data\s+\w+:|$))/g;
  let actionMatch;
  while ((actionMatch = actionRegex.exec(code)) !== null) {
    const actionName = actionMatch[1];
    const params = actionMatch[2].split(',').map(p => p.trim()).filter(p => p);
    const body = actionMatch[3];
    
    // Parse action operations with enhanced support for literals
    const operations = [];
    
    // Add operation - now handles literals like "High", "Todo"
    if (body.includes('add')) {
      const addMatch = body.match(/add\s+(\w+)\s+with\s+([^\n]+)/);
      if (addMatch) {
        const dataExpression = addMatch[2];
        operations.push({ type: 'add', model: addMatch[1], data: dataExpression });
      }
    }
    
    // Delete operation
    if (body.includes('delete')) {
      const deleteWhereMatch = body.match(/delete\s+(\w+)\s+where\s+([^\n]+)/);
      const deleteIdMatch = body.match(/delete\s+(\w+)\[(\w+)\]/);
      if (deleteWhereMatch) {
        operations.push({ type: 'deleteWhere', model: deleteWhereMatch[1], condition: deleteWhereMatch[2] });
      } else if (deleteIdMatch) {
        operations.push({ type: 'delete', model: deleteIdMatch[1], id: deleteIdMatch[2] });
      }
    }
    
    // Toggle operation
    if (body.includes('toggle')) {
      const toggleMatch = body.match(/toggle\s+(\w+)\[(\w+)\]\.([\w]+)/);
      if (toggleMatch) {
        operations.push({ type: 'toggle', model: toggleMatch[1], id: toggleMatch[2], field: toggleMatch[3] });
      }
    }
    
    // Clear operation
    if (body.includes('clear')) {
      const clearMatch = body.match(/clear\s+(\w+)/);
      if (clearMatch) {
        operations.push({ type: 'clear', model: clearMatch[1] });
      }
    }
    
    // Show operation
    if (body.includes('show')) {
      const showMatch = body.match(/show\s+(\w+)/);
      if (showMatch) {
        operations.push({ type: 'show', view: showMatch[1] });
      }
    }
    
    actions.push({ name: actionName, params, operations });
    console.log('Parsed action ' + actionName + ':', operations);
  }
  
  console.log('Final parsed data:', { appName, views, dataModels, actions });
  return { appName, views, dataModels, actions };
}
