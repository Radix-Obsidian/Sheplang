/**
 * Style Extractor - Phase 7
 * 
 * Extracts and translates CSS/styling from React components to ShepLang style blocks.
 * Handles:
 * - className attributes (including Tailwind CSS)
 * - Inline styles
 * - CSS module imports
 * - Styled-components (basic detection)
 * 
 * Following Golden Sheep Methodology:
 * - Faithful translation, no loss
 * - Preserves styling intent
 */

import { JSXElement } from './reactParser';

/**
 * Extracted style information
 */
export interface ExtractedStyle {
  /** Original className string */
  className?: string;
  /** Parsed Tailwind classes grouped by category */
  tailwindClasses?: TailwindClassGroup;
  /** Inline style object */
  inlineStyle?: Record<string, string>;
  /** CSS module class references */
  cssModuleRefs?: string[];
  /** Dynamic className expressions */
  dynamicClassName?: string;
}

/**
 * Tailwind classes grouped by category
 */
export interface TailwindClassGroup {
  layout: string[];      // flex, grid, block, etc.
  spacing: string[];     // p-*, m-*, gap-*, etc.
  sizing: string[];      // w-*, h-*, max-*, min-*
  typography: string[];  // text-*, font-*, etc.
  colors: string[];      // bg-*, text-*, border-*
  borders: string[];     // border-*, rounded-*
  effects: string[];     // shadow-*, opacity-*, etc.
  responsive: string[];  // sm:, md:, lg:, xl:
  states: string[];      // hover:, focus:, active:
  other: string[];       // Everything else
}

/**
 * ShepLang style block
 */
export interface ShepLangStyle {
  name: string;
  properties: ShepLangStyleProperty[];
}

export interface ShepLangStyleProperty {
  property: string;
  value: string;
  responsive?: string;  // sm, md, lg, xl
  state?: string;       // hover, focus, active
}

/**
 * Extract styles from a JSX element
 */
export function extractStyleFromElement(element: JSXElement): ExtractedStyle {
  const style: ExtractedStyle = {};

  // Extract className
  if (element.props.className) {
    const classNameValue = element.props.className;
    
    // Check if it's a dynamic expression
    if (classNameValue.includes('{') || classNameValue.includes('`')) {
      style.dynamicClassName = classNameValue;
    } else {
      style.className = classNameValue;
      style.tailwindClasses = parseTailwindClasses(classNameValue);
    }
  }

  // Extract inline style
  if (element.props.style) {
    style.inlineStyle = parseInlineStyle(element.props.style);
  }

  // Check for CSS module references (styles.className pattern)
  if (element.props.className && element.props.className.includes('styles.')) {
    style.cssModuleRefs = extractCSSModuleRefs(element.props.className);
  }

  return style;
}

/**
 * Parse Tailwind CSS classes into categories
 */
export function parseTailwindClasses(className: string): TailwindClassGroup {
  const classes = className.split(/\s+/).filter(Boolean);
  
  const groups: TailwindClassGroup = {
    layout: [],
    spacing: [],
    sizing: [],
    typography: [],
    colors: [],
    borders: [],
    effects: [],
    responsive: [],
    states: [],
    other: []
  };

  for (const cls of classes) {
    // Handle responsive prefixes (sm:, md:, lg:, xl:, 2xl:)
    if (/^(sm|md|lg|xl|2xl):/.test(cls)) {
      groups.responsive.push(cls);
      continue;
    }

    // Handle state prefixes (hover:, focus:, active:, etc.)
    if (/^(hover|focus|active|disabled|group-hover|focus-within):/.test(cls)) {
      groups.states.push(cls);
      continue;
    }

    // Categorize by class pattern
    if (isLayoutClass(cls)) {
      groups.layout.push(cls);
    } else if (isSpacingClass(cls)) {
      groups.spacing.push(cls);
    } else if (isSizingClass(cls)) {
      groups.sizing.push(cls);
    } else if (isTypographyClass(cls)) {
      groups.typography.push(cls);
    } else if (isColorClass(cls)) {
      groups.colors.push(cls);
    } else if (isBorderClass(cls)) {
      groups.borders.push(cls);
    } else if (isEffectClass(cls)) {
      groups.effects.push(cls);
    } else {
      groups.other.push(cls);
    }
  }

  return groups;
}

/**
 * Check if class is a layout class
 */
function isLayoutClass(cls: string): boolean {
  return /^(flex|grid|block|inline|hidden|absolute|relative|fixed|sticky|float|clear|overflow|z-)/.test(cls) ||
         /^(items-|justify-|content-|place-|self-|order-)/.test(cls);
}

/**
 * Check if class is a spacing class
 */
function isSpacingClass(cls: string): boolean {
  return /^(p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|space-|gap)-/.test(cls);
}

/**
 * Check if class is a sizing class
 */
function isSizingClass(cls: string): boolean {
  return /^(w-|h-|min-w-|min-h-|max-w-|max-h-|size-)/.test(cls);
}

/**
 * Check if class is a typography class
 */
function isTypographyClass(cls: string): boolean {
  return /^(text-|font-|leading-|tracking-|whitespace-|break-|truncate|uppercase|lowercase|capitalize|italic|not-italic|underline|line-through|no-underline)/.test(cls);
}

/**
 * Check if class is a color class
 */
function isColorClass(cls: string): boolean {
  return /^(bg-|text-|from-|via-|to-|placeholder-)/.test(cls) && 
         !/^text-(left|right|center|justify|xs|sm|base|lg|xl|2xl|3xl)/.test(cls);
}

/**
 * Check if class is a border class
 */
function isBorderClass(cls: string): boolean {
  return /^(border|rounded|ring|outline|divide)/.test(cls);
}

/**
 * Check if class is an effect class
 */
function isEffectClass(cls: string): boolean {
  return /^(shadow|opacity|blur|brightness|contrast|grayscale|hue-rotate|invert|saturate|sepia|backdrop|transition|duration|ease|delay|animate)/.test(cls);
}

/**
 * Parse inline style object or string
 */
function parseInlineStyle(style: any): Record<string, string> {
  if (typeof style === 'string') {
    // Parse CSS string: "color: red; font-size: 14px"
    const result: Record<string, string> = {};
    const parts = style.split(';').filter(Boolean);
    for (const part of parts) {
      const [key, value] = part.split(':').map(s => s.trim());
      if (key && value) {
        result[camelCase(key)] = value;
      }
    }
    return result;
  }
  
  if (typeof style === 'object') {
    // Already an object, just ensure string values
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(style)) {
      result[key] = String(value);
    }
    return result;
  }
  
  return {};
}

/**
 * Extract CSS module references
 */
function extractCSSModuleRefs(className: string): string[] {
  const refs: string[] = [];
  const matches = className.matchAll(/styles\.(\w+)/g);
  for (const match of matches) {
    refs.push(match[1]);
  }
  return refs;
}

/**
 * Convert kebab-case to camelCase
 */
function camelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert camelCase to kebab-case
 */
function kebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Generate ShepLang style block from extracted styles
 */
export function generateShepLangStyle(
  elementName: string,
  style: ExtractedStyle
): ShepLangStyle {
  const properties: ShepLangStyleProperty[] = [];

  // Convert Tailwind classes to ShepLang properties
  if (style.tailwindClasses) {
    properties.push(...tailwindToShepLang(style.tailwindClasses));
  }

  // Convert inline styles to ShepLang properties
  if (style.inlineStyle) {
    for (const [prop, value] of Object.entries(style.inlineStyle)) {
      properties.push({
        property: kebabCase(prop),
        value
      });
    }
  }

  return {
    name: elementName,
    properties
  };
}

/**
 * Convert Tailwind classes to ShepLang style properties
 */
function tailwindToShepLang(groups: TailwindClassGroup): ShepLangStyleProperty[] {
  const properties: ShepLangStyleProperty[] = [];

  // Layout
  for (const cls of groups.layout) {
    const prop = tailwindClassToProperty(cls);
    if (prop) properties.push(prop);
  }

  // Spacing
  for (const cls of groups.spacing) {
    const prop = tailwindClassToProperty(cls);
    if (prop) properties.push(prop);
  }

  // Sizing
  for (const cls of groups.sizing) {
    const prop = tailwindClassToProperty(cls);
    if (prop) properties.push(prop);
  }

  // Typography
  for (const cls of groups.typography) {
    const prop = tailwindClassToProperty(cls);
    if (prop) properties.push(prop);
  }

  // Colors
  for (const cls of groups.colors) {
    const prop = tailwindClassToProperty(cls);
    if (prop) properties.push(prop);
  }

  // Borders
  for (const cls of groups.borders) {
    const prop = tailwindClassToProperty(cls);
    if (prop) properties.push(prop);
  }

  // Effects
  for (const cls of groups.effects) {
    const prop = tailwindClassToProperty(cls);
    if (prop) properties.push(prop);
  }

  // Responsive (preserve with prefix)
  for (const cls of groups.responsive) {
    const [prefix, actualClass] = cls.split(':');
    const prop = tailwindClassToProperty(actualClass);
    if (prop) {
      prop.responsive = prefix;
      properties.push(prop);
    }
  }

  // States (preserve with state)
  for (const cls of groups.states) {
    const [state, actualClass] = cls.split(':');
    const prop = tailwindClassToProperty(actualClass);
    if (prop) {
      prop.state = state;
      properties.push(prop);
    }
  }

  return properties;
}

/**
 * Convert a single Tailwind class to ShepLang property
 */
function tailwindClassToProperty(cls: string): ShepLangStyleProperty | null {
  // Common Tailwind to CSS mappings
  const mappings: Record<string, { property: string; value: string }> = {
    // Display
    'flex': { property: 'display', value: 'flex' },
    'grid': { property: 'display', value: 'grid' },
    'block': { property: 'display', value: 'block' },
    'inline': { property: 'display', value: 'inline' },
    'inline-block': { property: 'display', value: 'inline-block' },
    'hidden': { property: 'display', value: 'none' },
    
    // Flex direction
    'flex-row': { property: 'flex-direction', value: 'row' },
    'flex-col': { property: 'flex-direction', value: 'column' },
    'flex-row-reverse': { property: 'flex-direction', value: 'row-reverse' },
    'flex-col-reverse': { property: 'flex-direction', value: 'column-reverse' },
    
    // Justify content
    'justify-start': { property: 'justify-content', value: 'flex-start' },
    'justify-end': { property: 'justify-content', value: 'flex-end' },
    'justify-center': { property: 'justify-content', value: 'center' },
    'justify-between': { property: 'justify-content', value: 'space-between' },
    'justify-around': { property: 'justify-content', value: 'space-around' },
    'justify-evenly': { property: 'justify-content', value: 'space-evenly' },
    
    // Align items
    'items-start': { property: 'align-items', value: 'flex-start' },
    'items-end': { property: 'align-items', value: 'flex-end' },
    'items-center': { property: 'align-items', value: 'center' },
    'items-baseline': { property: 'align-items', value: 'baseline' },
    'items-stretch': { property: 'align-items', value: 'stretch' },
    
    // Position
    'relative': { property: 'position', value: 'relative' },
    'absolute': { property: 'position', value: 'absolute' },
    'fixed': { property: 'position', value: 'fixed' },
    'sticky': { property: 'position', value: 'sticky' },
    
    // Text alignment
    'text-left': { property: 'text-align', value: 'left' },
    'text-center': { property: 'text-align', value: 'center' },
    'text-right': { property: 'text-align', value: 'right' },
    'text-justify': { property: 'text-align', value: 'justify' },
    
    // Font weight
    'font-thin': { property: 'font-weight', value: '100' },
    'font-light': { property: 'font-weight', value: '300' },
    'font-normal': { property: 'font-weight', value: '400' },
    'font-medium': { property: 'font-weight', value: '500' },
    'font-semibold': { property: 'font-weight', value: '600' },
    'font-bold': { property: 'font-weight', value: '700' },
    'font-extrabold': { property: 'font-weight', value: '800' },
    'font-black': { property: 'font-weight', value: '900' },
    
    // Text transform
    'uppercase': { property: 'text-transform', value: 'uppercase' },
    'lowercase': { property: 'text-transform', value: 'lowercase' },
    'capitalize': { property: 'text-transform', value: 'capitalize' },
    'normal-case': { property: 'text-transform', value: 'none' },
    
    // Overflow
    'overflow-auto': { property: 'overflow', value: 'auto' },
    'overflow-hidden': { property: 'overflow', value: 'hidden' },
    'overflow-visible': { property: 'overflow', value: 'visible' },
    'overflow-scroll': { property: 'overflow', value: 'scroll' },
    
    // Cursor
    'cursor-pointer': { property: 'cursor', value: 'pointer' },
    'cursor-default': { property: 'cursor', value: 'default' },
    'cursor-not-allowed': { property: 'cursor', value: 'not-allowed' },
  };

  // Direct mapping
  if (mappings[cls]) {
    return mappings[cls];
  }

  // Dynamic patterns
  
  // Spacing: p-4, px-2, m-auto, etc.
  const spacingMatch = cls.match(/^(p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml)-(.+)$/);
  if (spacingMatch) {
    const [, type, value] = spacingMatch;
    const propMap: Record<string, string> = {
      'p': 'padding', 'px': 'padding-inline', 'py': 'padding-block',
      'pt': 'padding-top', 'pr': 'padding-right', 'pb': 'padding-bottom', 'pl': 'padding-left',
      'm': 'margin', 'mx': 'margin-inline', 'my': 'margin-block',
      'mt': 'margin-top', 'mr': 'margin-right', 'mb': 'margin-bottom', 'ml': 'margin-left'
    };
    return { property: propMap[type], value: tailwindValueToCSS(value) };
  }

  // Gap
  const gapMatch = cls.match(/^gap-(.+)$/);
  if (gapMatch) {
    return { property: 'gap', value: tailwindValueToCSS(gapMatch[1]) };
  }

  // Width/Height
  const sizeMatch = cls.match(/^(w|h|min-w|min-h|max-w|max-h)-(.+)$/);
  if (sizeMatch) {
    const [, type, value] = sizeMatch;
    const propMap: Record<string, string> = {
      'w': 'width', 'h': 'height',
      'min-w': 'min-width', 'min-h': 'min-height',
      'max-w': 'max-width', 'max-h': 'max-height'
    };
    return { property: propMap[type], value: tailwindSizeToCSS(value) };
  }

  // Text size
  const textSizeMatch = cls.match(/^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/);
  if (textSizeMatch) {
    const sizeMap: Record<string, string> = {
      'xs': '0.75rem', 'sm': '0.875rem', 'base': '1rem',
      'lg': '1.125rem', 'xl': '1.25rem', '2xl': '1.5rem',
      '3xl': '1.875rem', '4xl': '2.25rem', '5xl': '3rem',
      '6xl': '3.75rem', '7xl': '4.5rem', '8xl': '6rem', '9xl': '8rem'
    };
    return { property: 'font-size', value: sizeMap[textSizeMatch[1]] };
  }

  // Border radius
  const roundedMatch = cls.match(/^rounded(-(.+))?$/);
  if (roundedMatch) {
    const value = roundedMatch[2] || 'default';
    const radiusMap: Record<string, string> = {
      'none': '0', 'sm': '0.125rem', 'default': '0.25rem',
      'md': '0.375rem', 'lg': '0.5rem', 'xl': '0.75rem',
      '2xl': '1rem', '3xl': '1.5rem', 'full': '9999px'
    };
    return { property: 'border-radius', value: radiusMap[value] || value };
  }

  // Background color (simplified)
  const bgMatch = cls.match(/^bg-(.+)$/);
  if (bgMatch) {
    return { property: 'background-color', value: tailwindColorToCSS(bgMatch[1]) };
  }

  // Text color (simplified)
  const textColorMatch = cls.match(/^text-(gray|red|blue|green|yellow|purple|pink|indigo|slate|zinc|neutral|stone|orange|amber|lime|emerald|teal|cyan|sky|violet|fuchsia|rose)-(\d+)$/);
  if (textColorMatch) {
    return { property: 'color', value: tailwindColorToCSS(`${textColorMatch[1]}-${textColorMatch[2]}`) };
  }

  // Border width
  const borderMatch = cls.match(/^border(-(\d+))?$/);
  if (borderMatch) {
    const width = borderMatch[2] || '1';
    return { property: 'border-width', value: `${width}px` };
  }

  // Shadow
  const shadowMatch = cls.match(/^shadow(-(.+))?$/);
  if (shadowMatch) {
    return { property: 'box-shadow', value: 'var(--shadow)' };
  }

  // If no match, return the class as-is for preservation
  return { property: 'class', value: cls };
}

/**
 * Convert Tailwind spacing value to CSS
 */
function tailwindValueToCSS(value: string): string {
  if (value === 'auto') return 'auto';
  if (value === 'px') return '1px';
  if (value === '0') return '0';
  
  const num = parseFloat(value);
  if (!isNaN(num)) {
    return `${num * 0.25}rem`;
  }
  
  // Arbitrary value [20px]
  if (value.startsWith('[') && value.endsWith(']')) {
    return value.slice(1, -1);
  }
  
  return value;
}

/**
 * Convert Tailwind size value to CSS
 */
function tailwindSizeToCSS(value: string): string {
  const fractionMap: Record<string, string> = {
    'full': '100%', 'screen': '100vh', 'min': 'min-content', 'max': 'max-content', 'fit': 'fit-content',
    '1/2': '50%', '1/3': '33.333333%', '2/3': '66.666667%',
    '1/4': '25%', '2/4': '50%', '3/4': '75%',
    '1/5': '20%', '2/5': '40%', '3/5': '60%', '4/5': '80%',
    '1/6': '16.666667%', '5/6': '83.333333%'
  };
  
  if (fractionMap[value]) return fractionMap[value];
  
  return tailwindValueToCSS(value);
}

/**
 * Convert Tailwind color to CSS (simplified)
 */
function tailwindColorToCSS(color: string): string {
  // Common colors
  const colorMap: Record<string, string> = {
    'white': '#ffffff',
    'black': '#000000',
    'transparent': 'transparent',
    'current': 'currentColor',
    // Add more as needed
  };
  
  if (colorMap[color]) return colorMap[color];
  
  // For Tailwind color scales, return CSS variable
  return `var(--color-${color})`;
}

/**
 * Generate ShepLang style code from styles
 */
export function generateShepLangStyleCode(styles: ShepLangStyle[]): string {
  const lines: string[] = [];
  
  lines.push('# Styles extracted from React components');
  lines.push('');
  
  for (const style of styles) {
    lines.push(`style ${style.name}:`);
    
    for (const prop of style.properties) {
      let line = `  ${prop.property}: ${prop.value}`;
      if (prop.responsive) {
        line += ` @${prop.responsive}`;
      }
      if (prop.state) {
        line += ` :${prop.state}`;
      }
      lines.push(line);
    }
    
    lines.push('');
  }
  
  return lines.join('\n');
}

/**
 * Extract all styles from a component's elements
 */
export function extractAllStyles(elements: JSXElement[]): Map<string, ExtractedStyle> {
  const styles = new Map<string, ExtractedStyle>();
  let counter = 0;

  const visit = (element: JSXElement, parentName: string = '') => {
    const style = extractStyleFromElement(element);
    
    // Only add if there's actual styling
    if (style.className || style.inlineStyle || style.dynamicClassName) {
      const name = `${parentName || element.type}_${counter++}`;
      styles.set(name, style);
    }
    
    // Recurse into children
    for (const child of element.children) {
      visit(child, element.type);
    }
  };

  for (const element of elements) {
    visit(element);
  }

  return styles;
}
