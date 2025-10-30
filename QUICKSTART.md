# Quick Start Guide

Get up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Get Your Figma Access Token

1. Visit https://www.figma.com/settings
2. Scroll to "Personal access tokens"
3. Click "Create a new personal access token"
4. Give it a name (e.g., "HTML Converter")
5. Copy the token (starts with `figd_` - save it somewhere safe!)

### Important: Copy the Figma file to your workspace!
You need to have access to the file with your personal token. If it's someone else's file:
1. Open the file in Figma
2. Click the file name at the top
3. Select "Duplicate to your drafts"
4. Use the URL from your duplicated file

## Step 3: Configure Your Token

Create a `.env` file in the project root and add your token:

```
FIGMA_ACCESS_TOKEN=figd_your_actual_token_here
```

## Step 4: Run the Converter

Pass your Figma file URL as an argument:

```bash
# Full URL (easiest - just copy from browser)
npm start https://www.figma.com/file/ABC123/My-Design

# Or just the file key
npm start ABC123
```

You should see:
```
🎨 Figma to HTML/CSS Converter

📋 File Key: ABC123

📥 Fetching Figma file...
✅ Successfully fetched: My Design
   Last modified: 2024-01-15T10:30:00Z
   Schema version: 0

🔄 Converting to HTML/CSS...
✅ Generated: /path/to/output/index.html
✅ Generated: /path/to/output/styles.css

✨ Conversion complete!
📂 Open /path/to/output/index.html in your browser to view the result.
```

## Step 5: View the Result

Open `output/index.html` in your browser!

## Troubleshooting

### "Invalid token" error
- Check that your `.env` file exists in the project root
- Check that your token starts with `figd_`
- Make sure you copied the entire token

### "File not found" error
- Verify the file URL or key is correct
- Make sure you have access to the file (copy it to your workspace first!)
- Try duplicating the file to your own workspace
- Check that you're passing the URL/key as an argument

### "Module not found" error
- Run `npm install` again
- Make sure you're using Node.js 18+

### Empty output
- Check if the Figma file has visible frames
- The converter processes CANVAS nodes - make sure your design is on a canvas

## Next Steps

- Check `README.md` for detailed documentation
- Read about known limitations
- Customize the converter for your needs

Happy converting! 🎉

