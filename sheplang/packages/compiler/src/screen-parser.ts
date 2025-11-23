/**
 * Phase 7: ShepUI Screen Parser
 * Parses screen definitions from ShepLang views
 * Following research from: react.dev/reference/react/hooks
 */

import type { AppModel } from '@goldensheepai/sheplang-language';

export type ScreenType = 'feed' | 'detail' | 'form' | 'list';

export interface ScreenModel {
  name: string;
  type: ScreenType;
  entity?: string;
  fields?: string[];
  features: ScreenFeatures;
}

export interface ScreenFeatures {
  infiniteScroll?: boolean;
  imageGallery?: boolean;
  filters?: string[];
  search?: boolean;
  relatedItems?: boolean;
  actions?: string[];
  pagination?: boolean;
  sorting?: boolean;
}

/**
 * Infer screen type from view definition
 */
export function inferScreenType(view: any): ScreenType {
  // If view has buttons that trigger actions, it's likely a list
  if (view.buttons && view.buttons.length > 0) {
    return 'list';
  }
  
  // If view has a list property, infer based on context
  if (view.list) {
    // Default to feed for lists
    return 'feed';
  }
  
  // If view has no list, might be detail or form
  // For now, default to list
  return 'list';
}

/**
 * Extract features from view definition
 */
export function extractFeatures(view: any): ScreenFeatures {
  const features: ScreenFeatures = {};
  
  // Infinite scroll for feed screens
  if (view.list) {
    features.infiniteScroll = true;
    features.search = true;
  }
  
  // Extract actions from buttons
  if (view.buttons && view.buttons.length > 0) {
    features.actions = view.buttons.map((b: any) => b.action);
  }
  
  return features;
}

/**
 * Parse screen from view definition
 */
export function parseScreen(view: any): ScreenModel {
  const type = inferScreenType(view);
  const features = extractFeatures(view);
  
  return {
    name: view.name,
    type,
    entity: view.list,
    features
  };
}

/**
 * Parse all screens from app model
 */
export function parseScreens(app: AppModel): ScreenModel[] {
  return app.views.map(view => parseScreen(view));
}

/**
 * Determine if screen should use infinite scroll
 */
export function shouldUseInfiniteScroll(screen: ScreenModel): boolean {
  return screen.type === 'feed' && screen.features.infiniteScroll === true;
}

/**
 * Determine if screen should have image gallery
 */
export function shouldHaveImageGallery(screen: ScreenModel): boolean {
  return screen.type === 'detail' && screen.features.imageGallery === true;
}

/**
 * Get fields for form screen
 */
export function getFormFields(screen: ScreenModel, app: AppModel): Array<{name: string; type: string}> {
  if (!screen.entity) return [];
  
  const dataModel = app.datas.find(d => d.name === screen.entity);
  if (!dataModel) return [];
  
  return dataModel.fields;
}
