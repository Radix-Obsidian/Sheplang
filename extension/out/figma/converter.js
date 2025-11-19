"use strict";
/**
 * Figma JSON to FigmaShepSpec Converter
 *
 * Converts Figma REST API response to our FigmaShepSpec format.
 *
 * Figma API structure docs:
 * - Node types: https://developers.figma.com/docs/rest-api/nodes/
 * - Document structure: https://developers.figma.com/docs/rest-api/files/
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertFigmaToSpec = convertFigmaToSpec;
/**
 * Convert Figma file data to FigmaShepSpec
 *
 * @param figmaData - Figma REST API response
 * @returns FigmaShepSpec ready for .shep generation
 */
function convertFigmaToSpec(figmaData) {
    // Find all FRAME nodes (these represent screens)
    const allFrames = findFrameNodes(figmaData.document);
    if (allFrames.length === 0) {
        throw new Error('No frames found in Figma file. Please select frames that represent screens.');
    }
    // Filter to top-level frames only (ignore nested frames/components)
    const topLevelFrames = filterTopLevelFrames(allFrames);
    // Extract entities and screens
    const entities = extractEntities(topLevelFrames);
    const screens = extractScreens(topLevelFrames);
    // Clean up app name
    const appName = cleanAppName(figmaData.name);
    return {
        appName,
        entities,
        screens,
    };
}
/**
 * Recursively find all FRAME nodes in the document tree
 * Figma docs: https://developers.figma.com/docs/rest-api/nodes/#frame-node
 */
function findFrameNodes(node) {
    const frames = [];
    if (node.type === 'FRAME') {
        frames.push(node);
    }
    if (node.children) {
        for (const child of node.children) {
            frames.push(...findFrameNodes(child));
        }
    }
    return frames;
}
/**
 * Filter to top-level frames only (main screens, not nested components)
 * Heuristics:
 * - Ignore frames with generic names (Frame1, Frame2, etc.)
 * - Ignore tiny frames (< 100px)
 * - Ignore frames that are clearly components/icons
 */
function filterTopLevelFrames(frames) {
    return frames.filter(frame => {
        const name = frame.name.toLowerCase();
        // Ignore generic frame names (Frame1, Frame123, Frame2609496, etc.)
        if (/^frame\d+$/.test(name)) {
            return false;
        }
        // Ignore any frame that starts with "frame" and has numbers
        if (/^frame.*\d/.test(name)) {
            return false;
        }
        // Ignore status/icon frames and numbered frames
        if (name.includes('icon') || name.includes('status') || /^\d+$/.test(name)) {
            return false;
        }
        // Ignore component-like frames
        if (name.includes('component') || name.includes('variant')) {
            return false;
        }
        // Check dimensions if available
        const width = frame.absoluteBoundingBox?.width || 0;
        const height = frame.absoluteBoundingBox?.height || 0;
        // Ignore tiny frames (likely components)
        if (width < 100 || height < 100) {
            return false;
        }
        // Ignore frames with only numbers in name
        if (/^\d+$/.test(frame.name)) {
            return false;
        }
        // Keep frames that look like screens (descriptive names)
        return true;
    });
}
/**
 * Clean app name from Figma file name
 * e.g., "Todo List App - Clean Modern (Free) [Community]" -> "TodoListApp"
 */
function cleanAppName(name) {
    // Remove common suffixes and noise words
    const cleaned = name
        .replace(/\s*[-–—]\s*.*/g, '') // Remove everything after dash
        .replace(/\s*\(.*?\)/g, '') // Remove parentheses
        .replace(/\s*\[.*?\]/g, '') // Remove brackets
        .replace(/\b(free|premium|paid|community|template|design|ui|kit|pack|bundle|clean|modern|simple|minimal|elegant)\b/gi, '') // Remove noise words
        .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special chars
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();
    return sanitizeName(cleaned) || 'MyApp';
}
/**
 * Extract entities (data models) from frames
 * Looks for repeating patterns that indicate lists
 * Consolidates similar entities (e.g., Simple, WithTags, SubTasks → Task)
 */
function extractEntities(frames) {
    const entityMap = new Map();
    for (const frame of frames) {
        const rawEntityName = inferEntityName(frame.name);
        // Only extract from list screens
        if (!frame.name.toLowerCase().includes('list') && !detectRepeatedComponents(frame)) {
            continue;
        }
        // Consolidate similar entity names to base entity
        const entityName = consolidateEntityName(rawEntityName);
        // Get or create field set for this entity
        if (!entityMap.has(entityName)) {
            entityMap.set(entityName, new Set());
        }
        const fieldSet = entityMap.get(entityName);
        // Extract meaningful fields (not UI text)
        const fields = extractMeaningfulFields(frame);
        fields.forEach(field => fieldSet.add(field));
    }
    // Convert map to entities with consolidated fields
    const entities = [];
    for (const [entityName, fieldSet] of entityMap) {
        const fieldNames = Array.from(fieldSet);
        // Add common fields if missing
        const allFields = new Set(fieldNames);
        if (entityName === 'Task') {
            if (!allFields.has('title'))
                allFields.add('title');
            if (!allFields.has('completed'))
                allFields.add('completed');
        }
        entities.push({
            name: entityName,
            fields: Array.from(allFields).map(fieldName => ({
                name: fieldName,
                type: inferFieldType(fieldName),
                required: fieldName === 'title'
            }))
        });
    }
    // Ensure at least one entity
    if (entities.length === 0) {
        entities.push({
            name: 'Task',
            fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'completed', type: 'yes/no', required: false }
            ]
        });
    }
    return entities;
}
/**
 * Consolidate similar entity names to a base entity
 * e.g., Simple, WithTags, SubTasks, TaskEmpty → Task
 */
function consolidateEntityName(name) {
    const lowerName = name.toLowerCase();
    // Common entity consolidation patterns (aggressive)
    if (lowerName.includes('task') || lowerName.includes('todo') || lowerName.includes('item') ||
        lowerName.includes('simple') || lowerName.includes('tags') || lowerName.includes('subtask') ||
        lowerName.includes('checked') || lowerName.includes('empty') || lowerName.includes('active') ||
        lowerName.includes('swipe') || lowerName.includes('delete')) {
        return 'Task';
    }
    if (lowerName.includes('user') || lowerName.includes('profile') || lowerName.includes('account')) {
        return 'User';
    }
    if (lowerName.includes('post') || lowerName.includes('article') || lowerName.includes('blog')) {
        return 'Post';
    }
    if (lowerName.includes('comment') || lowerName.includes('reply') || lowerName.includes('feedback')) {
        return 'Comment';
    }
    if (lowerName.includes('home') || lowerName.includes('dashboard')) {
        return 'Task'; // Home/dashboard usually shows tasks
    }
    // If no consolidation pattern matches, return cleaned name
    return name;
}
/**
 * Extract meaningful field names (not UI text like dates, times, or button labels)
 */
function extractMeaningfulFields(frame) {
    const fields = new Set();
    const skipPatterns = [
        /^\d+$/, // Pure numbers
        /^(today|tomorrow|yesterday)$/i, // Date labels
        /^\d{1,2}(am|pm)$/i, // Time labels
        /^(mon|tue|wed|thu|fri|sat|sun)/i, // Days
        /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i, // Months
        /^(save|cancel|delete|edit|add|new|create)$/i, // Button labels
    ];
    function traverse(node) {
        // Look for input fields or form elements
        const name = node.name.toLowerCase();
        if (name.includes('input') || name.includes('field')) {
            const fieldName = sanitizeName(node.name.replace(/input|field/gi, '').trim());
            if (fieldName && !skipPatterns.some(p => p.test(fieldName))) {
                fields.add(fieldName.toLowerCase());
            }
        }
        if (node.children) {
            for (const child of node.children) {
                traverse(child);
            }
        }
    }
    traverse(frame);
    // If no fields found, use common defaults based on screen name
    if (fields.size === 0) {
        const lowerName = frame.name.toLowerCase();
        if (lowerName.includes('todo') || lowerName.includes('task')) {
            fields.add('title');
            fields.add('completed');
        }
        else {
            fields.add('title');
        }
    }
    return Array.from(fields);
}
/**
 * Extract screens from frames
 */
function extractScreens(frames) {
    const screens = [];
    const seenNames = new Set();
    for (const frame of frames) {
        const screenName = sanitizeName(frame.name);
        // Skip duplicates
        if (seenNames.has(screenName)) {
            continue;
        }
        seenNames.add(screenName);
        const widgets = extractWidgets(frame);
        // Skip screens with no meaningful widgets
        if (widgets.length === 0) {
            continue;
        }
        // Infer screen type from name and content
        let screenType = 'detail';
        let entityName;
        const lowerName = frame.name.toLowerCase();
        const rawEntityName = inferEntityName(frame.name);
        if (lowerName.includes('list') || detectRepeatedComponents(frame)) {
            screenType = 'list';
            entityName = consolidateEntityName(rawEntityName);
            // Add default "New" button to list screens if not present
            if (!widgets.some(w => w.kind === 'button' && w.actionName?.toLowerCase().includes('new'))) {
                widgets.push({
                    kind: 'button',
                    label: `New ${entityName}`,
                    actionName: `Create${entityName}`
                });
            }
        }
        else if (lowerName.includes('create') ||
            lowerName.includes('add') ||
            lowerName.includes('new') ||
            lowerName.includes('edit') ||
            widgets.some(w => w.kind === 'input')) {
            screenType = 'form';
            entityName = consolidateEntityName(rawEntityName);
        }
        screens.push({
            name: screenName,
            type: screenType,
            entityName,
            widgets
        });
    }
    return screens;
}
/**
 * Extract widgets from a frame
 */
function extractWidgets(frame) {
    const widgets = [];
    const seenWidgets = new Set();
    function traverse(node) {
        const lowerName = node.name.toLowerCase();
        // Detect buttons (only if explicitly named, not generic rectangles)
        if (node.type === 'FRAME' ||
            node.type === 'INSTANCE' ||
            node.type === 'COMPONENT') {
            if (lowerName.includes('button') || lowerName.includes('btn') || lowerName.includes('cta')) {
                const buttonText = getTextFromNode(node);
                // Skip if no meaningful text found
                if (!buttonText || buttonText.toLowerCase().startsWith('rectangle')) {
                    return;
                }
                const label = buttonText;
                const actionName = inferActionName(label);
                // Deduplicate buttons
                const widgetKey = `button:${actionName}`;
                if (!seenWidgets.has(widgetKey)) {
                    seenWidgets.add(widgetKey);
                    widgets.push({
                        kind: 'button',
                        label,
                        actionName
                    });
                }
            }
        }
        // Detect input fields
        if (node.type === 'FRAME' || node.type === 'TEXT') {
            if (lowerName.includes('input') || lowerName.includes('field') || lowerName.includes('textbox')) {
                const fieldLabel = sanitizeName(node.name.replace(/input|field|textbox/gi, '').trim() || 'input');
                const fieldName = fieldLabel.toLowerCase();
                // Deduplicate inputs
                const widgetKey = `input:${fieldName}`;
                if (!seenWidgets.has(widgetKey)) {
                    seenWidgets.add(widgetKey);
                    widgets.push({
                        kind: 'input',
                        label: fieldLabel,
                        fieldName
                    });
                }
            }
        }
        // Traverse children
        if (node.children) {
            for (const child of node.children) {
                traverse(child);
            }
        }
    }
    traverse(frame);
    // If no widgets and it's a list, add default list widget
    if (widgets.length === 0 && detectRepeatedComponents(frame)) {
        const entityName = consolidateEntityName(inferEntityName(frame.name));
        widgets.push({
            kind: 'list',
            entityName
        });
    }
    return widgets;
}
/**
 * Detect if frame has repeated components (indicates a list)
 */
function detectRepeatedComponents(frame) {
    if (!frame.children || frame.children.length < 2) {
        return false;
    }
    // Look for instances or components (repeated items)
    const instances = frame.children.filter(child => child.type === 'INSTANCE' ||
        child.type === 'COMPONENT' ||
        (child.type === 'FRAME' && child.name.toLowerCase().includes('card')));
    return instances.length >= 2;
}
/**
 * Extract fields from a frame by analyzing text nodes
 */
function extractFieldsFromFrame(frame) {
    const fields = [];
    const fieldNames = new Set();
    function traverse(node) {
        if (node.type === 'TEXT') {
            const text = node.characters || '';
            const fieldName = sanitizeName(text).toLowerCase();
            if (fieldName && !fieldNames.has(fieldName)) {
                fieldNames.add(fieldName);
                fields.push({
                    name: fieldName,
                    type: inferFieldType(fieldName),
                    required: true
                });
            }
        }
        if (node.children) {
            for (const child of node.children) {
                traverse(child);
            }
        }
    }
    traverse(frame);
    return fields;
}
/**
 * Get text content from a node and its children
 */
function getTextFromNode(node) {
    if (node.type === 'TEXT') {
        return node.characters || null;
    }
    if (node.children) {
        for (const child of node.children) {
            const text = getTextFromNode(child);
            if (text)
                return text;
        }
    }
    return null;
}
/**
 * Infer entity name from screen name
 * e.g., "TaskList" -> "Task", "AddContact" -> "Contact"
 */
function inferEntityName(name) {
    const clean = name.replace(/List|Create|Add|New|Edit|Detail|Screen|View/gi, '').trim();
    return sanitizeName(clean || 'Item');
}
/**
 * Infer action name from button text
 * e.g., "Add Task" -> "AddTask"
 */
function inferActionName(text) {
    return sanitizeName(text.replace(/\s+/g, ''));
}
/**
 * Infer field type from field name
 */
function inferFieldType(fieldName) {
    const lower = fieldName.toLowerCase();
    if (lower.includes('email') || lower.includes('name') || lower.includes('title') || lower.includes('description')) {
        return 'text';
    }
    if (lower.includes('count') || lower.includes('number') || lower.includes('age') || lower.includes('price')) {
        return 'number';
    }
    if (lower.includes('date') && !lower.includes('time')) {
        return 'date';
    }
    if (lower.includes('time') && !lower.includes('date')) {
        return 'time';
    }
    if (lower.includes('datetime') || (lower.includes('date') && lower.includes('time'))) {
        return 'datetime';
    }
    if (lower.includes('done') || lower.includes('completed') || lower.includes('active') || lower.includes('enabled')) {
        return 'yes/no';
    }
    return 'text';
}
/**
 * Sanitize name for use in ShepLang
 * e.g., "My Task List" -> "MyTaskList"
 */
function sanitizeName(name) {
    return name
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
}
//# sourceMappingURL=converter.js.map