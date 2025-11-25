/**
 * API Endpoint Tests
 * Tests all API routes for correct behavior
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST as analyzePost } from '../app/api/analyze/route';
import { POST as previewPost } from '../app/api/preview/route';
import { NextRequest } from 'next/server';

describe('API Endpoints', () => {
  describe('/api/analyze', () => {
    it('should return 400 for missing code', async () => {
      const request = new NextRequest('http://localhost:3000/api/analyze', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await analyzePost(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should return 400 for non-string code', async () => {
      const request = new NextRequest('http://localhost:3000/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ code: 123 }),
      });

      const response = await analyzePost(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should analyze valid ShepLang code', async () => {
      const request = new NextRequest('http://localhost:3000/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ 
          code: 'app TestApp\n\ndata Todo:\n  fields:\n    title: text' 
        }),
      });

      const response = await analyzePost(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.diagnostics).toBeDefined();
      expect(data.parseTime).toBeGreaterThanOrEqual(0);
    });

    it('should detect missing app declaration', async () => {
      const request = new NextRequest('http://localhost:3000/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ 
          code: 'data Todo:\n  fields:\n    title: text' 
        }),
      });

      const response = await analyzePost(request);
      const data = await response.json();

      expect(data.diagnostics.some((d: any) => 
        d.message.includes('app declaration')
      )).toBe(true);
    });
  });

  describe('/api/preview', () => {
    it('should return 400 for missing code', async () => {
      const request = new NextRequest('http://localhost:3000/api/preview', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await previewPost(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should generate HTML preview for valid code', async () => {
      const request = new NextRequest('http://localhost:3000/api/preview', {
        method: 'POST',
        body: JSON.stringify({ 
          code: `app TestApp

data Todo:
  fields:
    title: text

view Dashboard:
  text "Hello World"
  button "Click" -> ShowDashboard

action ShowDashboard():
  show Dashboard` 
        }),
      });

      const response = await previewPost(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.html).toContain('<!DOCTYPE html>');
      expect(data.html).toContain('TestApp');
      expect(data.generationTime).toBeGreaterThanOrEqual(0);
    });

    it('should handle errors gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/preview', {
        method: 'POST',
        body: JSON.stringify({ 
          code: null  // Invalid
        }),
      });

      const response = await previewPost(request);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Error Handling', () => {
    it('should never expose [object Event] in errors', async () => {
      // Test that error messages are always strings, not objects
      const request = new NextRequest('http://localhost:3000/api/analyze', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await analyzePost(request);
      const text = await response.text();

      expect(text).not.toContain('[object Event]');
      expect(text).not.toContain('[object Object]');
    });

    it('should return proper error structure', async () => {
      const request = new NextRequest('http://localhost:3000/api/analyze', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await analyzePost(request);
      const data = await response.json();

      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('error');
      expect(typeof data.error).toBe('string');
    });
  });
});
