# Claude's Shopping List

A smart shopping list web app that helps you track items with categories, quantities, and purchase status. Built with Next.js and TypeScript.

## Prerequisites

Before getting started, make sure you have:

* Node.js (v18 or later)
* npm or yarn

## Getting Started

### 1. Install dependencies:

```bash
npm install
```

### 2. Run locally:

```bash
npm run dev
```

## Features

- ✅ Add items with name, quantity, and category
- ✅ Mark items as purchased with checkboxes
- ✅ Organize items by categories (groceries, electronics, clothing, home, other)
- ✅ Persistent storage using localStorage
- ✅ Clean, modern UI with dark theme
- ✅ Fully responsive design
- ✅ Delete individual items
- ✅ Clear all purchased items at once

## How to Use

1. Enter an item name in the input field
2. Set the quantity (defaults to 1)
3. Select a category from the dropdown
4. Click "ADD TO LIST" to add the item
5. Check the checkbox to mark items as purchased
6. Click the trash icon to delete items
7. Use "Clear All" to remove all purchased items

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: CSS Modules
- **State Management**: React useState + localStorage

## Deployment

Deploy to Vercel with one click:

```bash
vercel --prod
```

Or deploy to any other hosting platform that supports Next.js.