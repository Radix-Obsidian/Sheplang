# How to Get Valid Anthropic API Key

## Step 1: Go to Anthropic Console
https://console.anthropic.com/settings/keys

## Step 2: Create New Key
1. Click "Create Key"
2. Give it a name like "ShepLang Extension"
3. Copy the key immediately (it only shows once!)

## Step 3: Update .env File
Open `extension/.env` and replace line 5:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_ACTUAL_KEY_HERE
```

**IMPORTANT:** The key should start with `sk-ant-api03-` and be much longer (about 120 characters total)

## Step 4: Rebuild
```bash
cd extension
npm run compile
```

## Step 5: Reload VS Code
Press `Ctrl+Shift+P` → `Developer: Reload Window`

---

## Current Key Status
❌ **Invalid** - Getting 401 authentication error

The key in your `.env` file is either:
- Incomplete
- Revoked
- Not a real Anthropic API key

## Valid Key Format Example
```
sk-ant-api03-1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJ
```
(About 108 characters after the `sk-ant-api03-` prefix)

---

## Alternative: Use Single File Mode (No AI)

If you can't get an API key right now, choose "Single File" mode instead of "AI Architect" during import:

1. Start import
2. When prompted "How should we organize your project?"
3. Select **"$(file) Single File"** instead of AI Architect
4. This bypasses the AI call entirely

You'll still get a working `.shep` file, just without the fancy AI-designed folder structure.
