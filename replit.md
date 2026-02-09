# FinTrack - Controle Financeiro

## Overview
A personal finance tracker PWA (Progressive Web App) built with plain HTML, CSS, and JavaScript. Created by Jonnie and Gabriel. All data is stored locally in the browser using localStorage.

## Project Architecture
- **Type**: Static frontend-only PWA
- **Language**: Vanilla HTML/CSS/JavaScript
- **Data Storage**: Browser localStorage
- **Charts**: Chart.js (loaded via CDN)
- **PWA**: Service worker + manifest.json for offline capability

## Key Files
- `index.html` - Main HTML page
- `app.js` - Application logic (transactions, filtering, CSV export, theme toggle)
- `style.css` - Styling with light/dark theme support
- `manifest.json` - PWA manifest
- `service-worker.js` - Offline caching service worker
- `fintrackimg.jpg` - App icon

## Features
- Add income (entrada) and expense (saida) transactions
- Recurring transactions (weekly/monthly)
- Filter and search transactions
- Export to CSV
- Light/dark theme toggle
- Bar chart summary via Chart.js
- PWA with offline support

## Running
Served as static files using Python's built-in HTTP server on port 5000.

## Deployment
Configured as a static site deployment serving from the root directory.
