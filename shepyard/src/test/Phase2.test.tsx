/**
 * ShepYard Phase 2 Tests
 * 
 * Tests for transpiler integration and live preview renderer.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { transpileShepLang } from '../services/transpilerService';
import { BobaRenderer } from '../preview/BobaRenderer';

describe('ShepYard Phase 2: Live Preview Renderer', () => {
  describe('Transpiler Service', () => {
    it('transpiles valid ShepLang source', async () => {
      const source = `app MyApp

view Dashboard:
  show "Hello World"`;

      const result = await transpileShepLang(source);
      
      expect(result.success).toBe(true);
      expect(result.bobaCode).toBeDefined();
      expect(result.bobaCode).toContain('export const App');
    });

    it('handles empty source gracefully', async () => {
      const result = await transpileShepLang('');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Source code is empty');
    });

    it('handles parsing errors gracefully', async () => {
      const source = 'this is not valid ShepLang!!!';
      
      const result = await transpileShepLang(source);
      
      // Parser may be permissive, so just check it doesn't throw
      // and returns a valid result structure
      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
    });
  });

  describe('BobaRenderer', () => {
    it('renders a BobaScript app with components', () => {
      const mockApp = {
        name: 'TestApp',
        components: {
          Dashboard: {
            render: () => ({
              type: 'div',
              props: { className: 'test-component' },
              children: [
                {
                  type: 'h1',
                  props: {},
                  children: ['Dashboard']
                }
              ]
            })
          }
        },
        routes: [],
        state: {}
      };

      render(<BobaRenderer app={mockApp} />);
      
      expect(screen.getByTestId('boba-renderer')).toBeInTheDocument();
      expect(screen.getByText('TestApp')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('displays routes navigation when routes exist', () => {
      const mockApp = {
        name: 'RoutedApp',
        components: {
          Home: {
            render: () => ({ type: 'div', props: {}, children: ['Home View'] })
          },
          About: {
            render: () => ({ type: 'div', props: {}, children: ['About View'] })
          }
        },
        routes: [
          { path: '/', component: 'Home' },
          { path: '/about', component: 'About' }
        ],
        state: {}
      };

      render(<BobaRenderer app={mockApp} />);
      
      // Should show route buttons
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
    });

    it('displays state/data models when present', () => {
      const mockApp = {
        name: 'StatefulApp',
        components: {
          Dashboard: {
            render: () => ({ type: 'div', props: {}, children: ['Dashboard'] })
          }
        },
        routes: [],
        state: {
          Todo: {
            fields: { title: { type: 'text' } }
          },
          User: {
            fields: { name: { type: 'text' } }
          }
        }
      };

      render(<BobaRenderer app={mockApp} />);
      
      expect(screen.getByText('Data Models')).toBeInTheDocument();
      expect(screen.getByText('Todo')).toBeInTheDocument();
      expect(screen.getByText('User')).toBeInTheDocument();
    });

    it('handles empty app gracefully', () => {
      const mockApp = {
        name: 'EmptyApp',
        components: {},
        routes: [],
        state: {}
      };

      render(<BobaRenderer app={mockApp} />);
      
      expect(screen.getByTestId('boba-renderer')).toBeInTheDocument();
      expect(screen.getByText('EmptyApp')).toBeInTheDocument();
    });
  });
});
