/**
 * Embedded Preview Service
 * 
 * Phase 4.2 of Strategic Plan - Centralized service for embedded previews
 * Handles StackBlitz, CodeSandbox and other embeds in a single place
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { outputChannel } from './outputChannel';
import { createStackBlitzEmbed } from '../commands/stackblitzEmbed';
import { createCodeSandboxEmbed } from '../commands/codeSandboxEmbed';

export class EmbeddedPreviewService {
  private context: vscode.ExtensionContext;
  
  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  /**
   * Show quick pick for preview options
   */
  public async showPreviewOptions(): Promise<void> {
    const options = [
      { label: '$(globe) StackBlitz', description: 'Preview in StackBlitz' },
      { label: '$(device-desktop) CodeSandbox', description: 'Preview in CodeSandbox' }
    ];
    
    const selected = await vscode.window.showQuickPick(options, {
      title: 'Choose a preview service',
      placeHolder: 'Select where to preview your ShepLang app'
    });
    
    if (!selected) return;
    
    if (selected.label.includes('StackBlitz')) {
      await createStackBlitzEmbed(this.context);
    } else if (selected.label.includes('CodeSandbox')) {
      await createCodeSandboxEmbed(this.context);
    }
  }
  
  /**
   * Register commands and toolbar buttons
   */
  public registerCommands(): vscode.Disposable[] {
    return [
      // Command to show preview options
      vscode.commands.registerCommand('sheplang.showEmbeddedPreviewOptions', () => {
        this.showPreviewOptions();
      }),
      
      // Direct commands for each service
      vscode.commands.registerCommand('sheplang.previewInStackBlitz', () => {
        createStackBlitzEmbed(this.context);
      }),
      
      vscode.commands.registerCommand('sheplang.previewInCodeSandbox', () => {
        createCodeSandboxEmbed(this.context);
      })
    ];
  }
  
  /**
   * Create a toolbar button for embedded previews
   */
  public createToolbarButton(): vscode.Disposable {
    const button = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    
    button.text = '$(preview) Preview Online';
    button.tooltip = 'Preview in StackBlitz/CodeSandbox';
    button.command = 'sheplang.showEmbeddedPreviewOptions';
    
    // Show only when ShepLang file is active
    vscode.window.onDidChangeActiveTextEditor(editor => {
      if (editor && editor.document.languageId === 'sheplang') {
        button.show();
      } else {
        button.hide();
      }
    });
    
    // Check current editor
    if (vscode.window.activeTextEditor?.document.languageId === 'sheplang') {
      button.show();
    }
    
    return button;
  }
}
