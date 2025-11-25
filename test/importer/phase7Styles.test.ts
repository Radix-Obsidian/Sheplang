/**
 * Tests for Phase 7: CSS/Styling Preservation
 * 
 * Tests className → style blocks translation:
 * - Tailwind CSS class parsing
 * - Inline style extraction
 * - CSS module reference detection
 * - ShepLang style block generation
 * 
 * Following Golden Sheep Methodology: "Test deep."
 */

import { describe, it, expect } from 'vitest';
import { parseReactFile, ComponentStyle } from '../../extension/src/parsers/reactParser';
import { 
  parseTailwindClasses, 
  extractStyleFromElement,
  generateShepLangStyle,
  generateShepLangStyleCode,
  TailwindClassGroup
} from '../../extension/src/parsers/styleExtractor';
import { JSXElement } from '../../extension/src/parsers/reactParser';
import * as path from 'path';

const fixturesDir = path.join(__dirname, '../../test-import-fixtures');

describe('Phase 7: Style Extraction', () => {
  
  describe('Tailwind CSS Parsing', () => {
    
    it('parses layout classes', () => {
      const result = parseTailwindClasses('flex items-center justify-between');
      
      expect(result.layout).toContain('flex');
      expect(result.layout).toContain('items-center');
      expect(result.layout).toContain('justify-between');
    });
    
    it('parses spacing classes', () => {
      const result = parseTailwindClasses('p-4 px-2 m-auto mt-8');
      
      expect(result.spacing).toContain('p-4');
      expect(result.spacing).toContain('px-2');
      expect(result.spacing).toContain('m-auto');
      expect(result.spacing).toContain('mt-8');
    });
    
    it('parses sizing classes', () => {
      const result = parseTailwindClasses('w-full h-screen max-w-lg');
      
      expect(result.sizing).toContain('w-full');
      expect(result.sizing).toContain('h-screen');
      expect(result.sizing).toContain('max-w-lg');
    });
    
    it('parses typography classes', () => {
      const result = parseTailwindClasses('text-lg font-bold uppercase');
      
      expect(result.typography).toContain('text-lg');
      expect(result.typography).toContain('font-bold');
      expect(result.typography).toContain('uppercase');
    });
    
    it('parses color classes', () => {
      const result = parseTailwindClasses('bg-blue-500 text-white');
      
      expect(result.colors).toContain('bg-blue-500');
    });
    
    it('parses border classes', () => {
      const result = parseTailwindClasses('border rounded-lg border-gray-300');
      
      expect(result.borders).toContain('border');
      expect(result.borders).toContain('rounded-lg');
      expect(result.borders).toContain('border-gray-300');
    });
    
    it('parses effect classes', () => {
      const result = parseTailwindClasses('shadow-lg opacity-50 transition');
      
      expect(result.effects).toContain('shadow-lg');
      expect(result.effects).toContain('opacity-50');
      expect(result.effects).toContain('transition');
    });
    
    it('parses responsive prefixes', () => {
      const result = parseTailwindClasses('sm:flex md:hidden lg:block');
      
      expect(result.responsive).toContain('sm:flex');
      expect(result.responsive).toContain('md:hidden');
      expect(result.responsive).toContain('lg:block');
    });
    
    it('parses state prefixes', () => {
      const result = parseTailwindClasses('hover:bg-blue-600 focus:outline-none active:scale-95');
      
      expect(result.states).toContain('hover:bg-blue-600');
      expect(result.states).toContain('focus:outline-none');
      expect(result.states).toContain('active:scale-95');
    });
    
    it('handles complex className with multiple categories', () => {
      const result = parseTailwindClasses(
        'flex items-center p-4 w-full text-lg bg-white rounded-lg shadow-md hover:shadow-lg sm:p-6'
      );
      
      expect(result.layout.length).toBeGreaterThan(0);
      expect(result.spacing.length).toBeGreaterThan(0);
      expect(result.sizing.length).toBeGreaterThan(0);
      expect(result.typography.length).toBeGreaterThan(0);
      expect(result.colors.length).toBeGreaterThan(0);
      expect(result.borders.length).toBeGreaterThan(0);
      expect(result.effects.length).toBeGreaterThan(0);
      expect(result.responsive.length).toBeGreaterThan(0);
      expect(result.states.length).toBeGreaterThan(0);
    });
  });
  
  describe('Style Extraction from JSX', () => {
    
    it('extracts className from element', () => {
      const element: JSXElement = {
        type: 'div',
        props: { className: 'flex p-4' },
        children: []
      };
      
      const style = extractStyleFromElement(element);
      
      expect(style.className).toBe('flex p-4');
      expect(style.tailwindClasses).toBeDefined();
      expect(style.tailwindClasses!.layout).toContain('flex');
    });
    
    it('extracts inline style object', () => {
      const element: JSXElement = {
        type: 'div',
        props: { style: '{ color: red, fontSize: 14px }' },
        children: []
      };
      
      const style = extractStyleFromElement(element);
      
      expect(style.inlineStyle).toBeDefined();
    });
    
    it('detects dynamic className', () => {
      const element: JSXElement = {
        type: 'div',
        props: { className: '`flex ${isActive ? "bg-blue" : "bg-gray"}`' },
        children: []
      };
      
      const style = extractStyleFromElement(element);
      
      expect(style.dynamicClassName).toBeDefined();
    });
    
    it('detects CSS module references', () => {
      const element: JSXElement = {
        type: 'div',
        props: { className: 'styles.container styles.active' },
        children: []
      };
      
      const style = extractStyleFromElement(element);
      
      expect(style.cssModuleRefs).toBeDefined();
      expect(style.cssModuleRefs).toContain('container');
      expect(style.cssModuleRefs).toContain('active');
    });
  });
  
  describe('ShepLang Style Generation', () => {
    
    it('generates style block from extracted style', () => {
      const element: JSXElement = {
        type: 'div',
        props: { className: 'flex p-4' },
        children: []
      };
      
      const extracted = extractStyleFromElement(element);
      const style = generateShepLangStyle('container', extracted);
      
      expect(style.name).toBe('container');
      expect(style.properties.length).toBeGreaterThan(0);
    });
    
    it('generates ShepLang code from styles', () => {
      const styles = [{
        name: 'button',
        properties: [
          { property: 'display', value: 'flex' },
          { property: 'padding', value: '1rem' },
          { property: 'background-color', value: 'var(--color-blue-500)' }
        ]
      }];
      
      const code = generateShepLangStyleCode(styles);
      
      expect(code).toContain('style button:');
      expect(code).toContain('display: flex');
      expect(code).toContain('padding: 1rem');
    });
    
    it('includes responsive markers in generated code', () => {
      const styles = [{
        name: 'card',
        properties: [
          { property: 'display', value: 'block' },
          { property: 'display', value: 'flex', responsive: 'md' }
        ]
      }];
      
      const code = generateShepLangStyleCode(styles);
      
      expect(code).toContain('@md');
    });
    
    it('includes state markers in generated code', () => {
      const styles = [{
        name: 'link',
        properties: [
          { property: 'color', value: 'blue' },
          { property: 'color', value: 'darkblue', state: 'hover' }
        ]
      }];
      
      const code = generateShepLangStyleCode(styles);
      
      expect(code).toContain(':hover');
    });
  });
  
  describe('Integration with ReactParser', () => {
    
    it('extracts styles from component', () => {
      const componentPath = path.join(fixturesDir, 'nextjs-prisma', 'app', 'components', 'TaskList.tsx');
      const component = parseReactFile(componentPath);
      
      expect(component).not.toBeNull();
      expect(component!.styles).toBeDefined();
      expect(Array.isArray(component!.styles)).toBe(true);
    });
    
    it('styles have correct structure', () => {
      const componentPath = path.join(fixturesDir, 'nextjs-prisma', 'app', 'page.tsx');
      const component = parseReactFile(componentPath);
      
      expect(component).not.toBeNull();
      
      if (component!.styles.length > 0) {
        for (const style of component!.styles) {
          expect(style).toHaveProperty('elementName');
          // Should have either className or inlineStyles
          expect(style.className || style.inlineStyles).toBeDefined;
        }
      }
    });
    
    it('tailwindClasses array is populated when className exists', () => {
      const componentPath = path.join(fixturesDir, 'nextjs-prisma', 'app', 'components', 'TaskList.tsx');
      const component = parseReactFile(componentPath);
      
      expect(component).not.toBeNull();
      
      const stylesWithClassName = component!.styles.filter(s => s.className);
      for (const style of stylesWithClassName) {
        expect(style.tailwindClasses).toBeDefined();
        expect(Array.isArray(style.tailwindClasses)).toBe(true);
      }
    });
  });
  
  describe('Edge Cases', () => {
    
    it('handles empty className', () => {
      const result = parseTailwindClasses('');
      
      expect(result.layout).toHaveLength(0);
      expect(result.spacing).toHaveLength(0);
    });
    
    it('handles className with only spaces', () => {
      const result = parseTailwindClasses('   ');
      
      expect(result.layout).toHaveLength(0);
    });
    
    it('handles unknown classes gracefully', () => {
      const result = parseTailwindClasses('custom-class xyz-special');
      
      // Unknown classes should go to "other"
      expect(result.other).toContain('custom-class');
      expect(result.other).toContain('xyz-special');
    });
    
    it('preserves arbitrary values', () => {
      const result = parseTailwindClasses('w-[200px] h-[calc(100vh-64px)]');
      
      // Should be in sizing
      expect(result.sizing.length).toBeGreaterThan(0);
    });
  });
});

describe('Phase 7: Full Pipeline Test', () => {
  
  it('complete style extraction pipeline', () => {
    const componentPath = path.join(fixturesDir, 'nextjs-prisma', 'app', 'components', 'TaskList.tsx');
    const component = parseReactFile(componentPath);
    
    expect(component).not.toBeNull();
    
    // Phase 7 field exists
    expect(component).toHaveProperty('styles');
    
    // Still has all other phases
    expect(component).toHaveProperty('effects');      // Phase 5
    expect(component).toHaveProperty('imports');      // Phase 6
    expect(component).toHaveProperty('childComponents'); // Phase 6
    
    // Original fields still work
    expect(component).toHaveProperty('name');
    expect(component).toHaveProperty('elements');
    expect(component).toHaveProperty('handlers');
  });
});
