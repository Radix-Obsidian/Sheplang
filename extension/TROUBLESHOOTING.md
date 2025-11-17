# 🔧 Troubleshooting Guide

Common issues and solutions for the ShepLang VS Code extension.

---

## Table of Contents

- [Extension Issues](#extension-issues)
- [Preview Issues](#preview-issues)
- [Backend Issues](#backend-issues)
- [Syntax & IntelliSense Issues](#syntax--intellisense-issues)
- [Performance Issues](#performance-issues)
- [Getting Help](#getting-help)

---

## Extension Issues

### Extension Not Activating

**Symptoms:**
- No syntax highlighting
- Commands not available
- No IntelliSense

**Solutions:**

1. **Check Extension is Installed:**
   - Open Extensions panel (`Ctrl+Shift+X`)
   - Search for "ShepLang"
   - Verify it's enabled

2. **Reload VS Code:**
   - Press `Ctrl+Shift+P`
   - Type "Reload Window"
   - Press Enter

3. **Check File Extension:**
   - Make sure files end with `.shep` or `.shepthon`
   - VS Code must recognize the language

4. **View Output Logs:**
   - Press `Ctrl+Shift+L`
   - Check for activation errors
   - Look for red error messages

5. **Reinstall Extension:**
   ```bash
   # Uninstall
   code --uninstall-extension sheplang
   
   # Reinstall from VSIX
   code --install-extension sheplang-0.1.0.vsix
   ```

---

## Preview Issues

### Preview Not Opening

**Symptoms:**
- Command executes but no preview panel appears
- Error: "No active editor found"

**Solutions:**

1. **Open a .shep File First:**
   - The preview only works with `.shep` files
   - Make sure you have a `.shep` file open and focused

2. **Check File is Saved:**
   - Save the file (`Ctrl+S`)
   - Try the preview command again

3. **View Error Details:**
   - Press `Ctrl+Shift+L` to open Output channel
   - Look for error messages
   - Check for parse errors

4. **Verify Backend File Exists:**
   - Make sure you have a matching `.shepthon` file
   - `app.shep` needs `app.shepthon`
   - Files must have the same base name

### Preview Shows "Content Unavailable"

**Symptoms:**
- Preview panel opens but shows "Content unavailable"
- Or shows blank white screen

**Solutions:**

1. **Check Backend Status:**
   - Look for green "✓ Backend" badge in preview
   - If red "✗ Backend", the backend failed to start

2. **View Backend Logs:**
   - Press `Ctrl+Shift+L`
   - Look for "[ShepThon]" or "[Runtime]" errors
   - Check for parse errors in `.shepthon` file

3. **Restart Backend:**
   - Press `Ctrl+Shift+R`
   - Or close and reopen the `.shepthon` file

4. **Check Syntax:**
   - Make sure your `.shepthon` file has no syntax errors
   - Red squiggles indicate errors
   - Hover over them for details

### Preview Not Updating

**Symptoms:**
- Make changes to .shep file
- Preview doesn't reflect changes

**Solutions:**

1. **Save the File:**
   - Press `Ctrl+S` to save
   - Preview auto-updates on save

2. **Manual Reload:**
   - Close the preview panel
   - Run "ShepLang: Show Preview" again

3. **Check File Watcher:**
   - View Output logs (`Ctrl+Shift+L`)
   - Look for "[Preview] File changed" messages
   - If missing, file watcher isn't working

4. **Reload VS Code:**
   - Press `Ctrl+R` (in Extension Development Host)
   - Or close and reopen VS Code

---

## Backend Issues

### "Backend Connection Failed"

**Symptoms:**
- Red "✗ Backend" badge in preview
- Error: "Failed to load ShepThon backend"

**Solutions:**

1. **Check .shepthon File Exists:**
   - Make sure you have a `.shepthon` file
   - Must have same base name as `.shep` file
   - Example: `app.shep` + `app.shepthon`

2. **Check for Syntax Errors:**
   - Open the `.shepthon` file
   - Look for red squiggles
   - Fix any syntax errors

3. **View Detailed Error:**
   - Press `Ctrl+Shift+L`
   - Look for "[Runtime]" or "[ShepThon]" errors
   - Error message will suggest fixes

4. **Restart Backend:**
   - Press `Ctrl+Shift+R`
   - Or close/reopen the `.shepthon` file

5. **Check Port Conflicts:**
   - If error says "EADDRINUSE"
   - Another process is using the port
   - Close other dev servers
   - Or restart VS Code

### Backend Starts But Endpoints Don't Work

**Symptoms:**
- Green "✓ Backend" badge
- But clicking buttons does nothing
- Or shows errors in preview

**Solutions:**

1. **Check Endpoint Paths Match:**
   ```sheplang
   # Frontend (app.shep)
   call POST "/todos"(title)
   ```
   ```shepthon
   # Backend (app.shepthon)
   endpoint POST "/todos" (title: string) -> Todo {
     // ...
   }
   ```
   - Paths must match exactly (including `/`)

2. **Check Parameter Names Match:**
   - Frontend: `call POST "/todos"(title)`
   - Backend: `endpoint POST "/todos" (title: string)`
   - Parameter names must match

3. **View Request/Response in Logs:**
   - Press `Ctrl+Shift+L`
   - Look for "[Webview] Calling POST /todos"
   - Check response or error messages

4. **Check Model Names Match:**
   - Frontend model: `data Todo:`
   - Backend model: `model Todo {`
   - Names must match exactly (case-sensitive)

### Database Operations Failing

**Symptoms:**
- Error: "Table not found"
- Error: "Field not found"
- Data not persisting

**Solutions:**

1. **Check Model Definitions:**
   ```shepthon
   model Todo {
     id: id
     title: text
     done: bool = false
   }
   ```
   - Make sure model is defined in backend

2. **Check Field Names:**
   ```shepthon
   db.Todo.create({
     title: "Task",  # Must match model field
     done: false
   })
   ```
   - Field names must match model exactly

3. **Restart Backend to Reset DB:**
   - Press `Ctrl+Shift+R`
   - In-memory DB resets on restart
   - Data is not persistent between restarts

4. **Check Database Operation Syntax:**
   - `db.Todo.findAll()` ✅
   - `db.Todo.FindAll()` ❌ (wrong case)
   - `Todo.findAll()` ❌ (missing db.)

---

## Syntax & IntelliSense Issues

### No IntelliSense/Autocomplete

**Symptoms:**
- Typing doesn't show suggestions
- No hover documentation
- No snippets

**Solutions:**

1. **Check File Extension:**
   - Files must end with `.shep` or `.shepthon`
   - VS Code must show correct language in bottom-right

2. **Trigger IntelliSense Manually:**
   - Press `Ctrl+Space` to trigger completions
   - If still nothing, LSP might not be running

3. **Check LSP Server Status:**
   - Press `Ctrl+Shift+L`
   - Look for "[LSP]" or "[Language Server]" messages
   - Should see "Language server started"

4. **Restart Language Server:**
   - Press `Ctrl+Shift+P`
   - Type "Reload Window"
   - This restarts all extension services

5. **Check Settings:**
   - Open Settings (`Ctrl+,`)
   - Search for "sheplang"
   - Make sure LSP is enabled

### Syntax Errors on Valid Code

**Symptoms:**
- Red squiggles on code that should work
- Error messages don't make sense

**Solutions:**

1. **Check Syntax:**
   - Refer to [Language Reference](./LANGUAGE_REFERENCE.md)
   - Common mistakes:
     - Missing colons after data/view/action
     - Wrong indentation
     - Missing quotes around strings

2. **Common Syntax Fixes:**
   
   **Wrong:**
   ```sheplang
   data Todo  # Missing colon
     fields:
   ```
   **Right:**
   ```sheplang
   data Todo:  # Colon required
     fields:
   ```

   **Wrong:**
   ```shepthon
   model Todo  # Missing braces
     id: id
   ```
   **Right:**
   ```shepthon
   model Todo {  # Braces required
     id: id
   }
   ```

3. **Reload to Clear False Errors:**
   - Save all files (`Ctrl+K S`)
   - Press `Ctrl+R` to reload VS Code

### Hover Documentation Not Showing

**Symptoms:**
- Hover over keywords shows nothing
- Or shows generic info

**Solutions:**

1. **Wait for LSP to Start:**
   - Language server takes ~2 seconds to start
   - Check Output logs for "Language server ready"

2. **Hover Over Correct Elements:**
   - Hover over keywords: `app`, `data`, `view`, `action`, `model`, `endpoint`
   - Not all elements have hover docs

3. **Check File is Saved:**
   - Unsaved files may not have full LSP support
   - Save file (`Ctrl+S`)

---

## Performance Issues

### Preview is Slow to Load

**Symptoms:**
- Preview takes >5 seconds to open
- Preview shows "Loading..." for a long time

**Solutions:**

1. **Check File Size:**
   - Very large .shep files may be slow
   - Consider splitting into multiple files

2. **Check Backend Complexity:**
   - Many models/endpoints slow down parsing
   - Simplify for testing

3. **Restart VS Code:**
   - Close VS Code completely
   - Reopen project

4. **Check System Resources:**
   - Open Task Manager (Windows) or Activity Monitor (Mac)
   - Check CPU/Memory usage
   - Close other programs

### Extension Using Too Much Memory

**Symptoms:**
- VS Code feels sluggish
- High memory usage in Task Manager

**Solutions:**

1. **Disable Verbose Logging:**
   - Open Settings (`Ctrl+,`)
   - Search "sheplang.verboseLogging"
   - Set to `false`

2. **Close Unused Preview Panels:**
   - Each preview uses memory
   - Close panels you're not using

3. **Restart VS Code:**
   - Press `Ctrl+R` (Extension Development Host)
   - Or close and reopen VS Code

4. **Update VS Code:**
   - Help → Check for Updates
   - Update to latest version

---

## Common Error Messages

### "No active editor found"

**Cause:** No file is open or focused

**Fix:**
1. Open a `.shep` file
2. Click in the editor to focus it
3. Try the command again

### "Preview is only available for .shep files"

**Cause:** Current file is not a .shep file

**Fix:**
1. Open a `.shep` file
2. Make sure file extension is `.shep` not `.txt`

### "Failed to load ShepThon backend"

**Cause:** Backend file missing or has errors

**Fix:**
1. Create a `.shepthon` file with same base name
2. Check for syntax errors in `.shepthon` file
3. View logs: `Ctrl+Shift+L`

### "Endpoint not found: GET /todos"

**Cause:** Backend doesn't have matching endpoint

**Fix:**
1. Check endpoint exists in `.shepthon` file
2. Verify path matches exactly
3. Check HTTP method (GET/POST/PUT/DELETE)

### "Port already in use"

**Cause:** Another process using the same port

**Fix:**
1. Close other dev servers
2. Restart VS Code
3. Check for other running ShepLang instances

---

## Getting Help

### Built-in Help

1. **Output Logs** (`Ctrl+Shift+L`)
   - Most detailed error information
   - Shows exactly what went wrong

2. **Smart Error Recovery**
   - Extension suggests fixes automatically
   - Click suggestion buttons to fix

3. **Documentation**
   - [Getting Started](./GETTING_STARTED.md)
   - [Language Reference](./LANGUAGE_REFERENCE.md)
   - [AI Best Practices](./AI_BEST_PRACTICES.md)

### Community Help

- **GitHub Issues:** [Report a Bug](https://github.com/Radix-Obsidian/Sheplang-BobaScript/issues)
- **Documentation:** [GitHub Repo](https://github.com/Radix-Obsidian/Sheplang-BobaScript)

### Reporting Bugs

When reporting bugs, please include:

1. **Error Message**
   - Copy from Output channel (`Ctrl+Shift+L`)
   - Include full error stack trace

2. **Steps to Reproduce**
   - What you did before the error
   - Minimal example that reproduces it

3. **Environment**
   - VS Code version (Help → About)
   - Extension version
   - Operating System

4. **Code Sample**
   - Share your `.shep` and `.shepthon` files
   - Or minimal example showing issue

---

## Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| No preview | Open `.shep` file, press `Ctrl+Shift+P` |
| Backend not working | Check `.shepthon` exists, press `Ctrl+Shift+R` |
| No IntelliSense | Check file extension, press `Ctrl+Space` |
| Syntax errors | Check [Language Reference](./LANGUAGE_REFERENCE.md) |
| Preview not updating | Save file (`Ctrl+S`) |
| Extension not loading | Reload window (`Ctrl+Shift+P` → "Reload Window") |
| Need logs | Press `Ctrl+Shift+L` |

---

**Still stuck?** Press `Ctrl+Shift+L` to view logs, or [open an issue](https://github.com/Radix-Obsidian/Sheplang-BobaScript/issues).

🐑 **Happy debugging!**
