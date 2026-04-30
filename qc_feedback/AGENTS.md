# AGENTS.md

## Overview

Simple feedback/screenshot capture Web Component library. No build system - just include `qc_feedback.js` in any HTML page.

## Quick Start

Open `index.html` in a browser to see the demo. No build commands needed.

## Tech Stack

- Vanilla JS Web Component (no framework)
- Dependencies from CDN: html2canvas 1.4.1, fabric.js 5.3.0

## File Structure

- `qc_feedback.js` - The Web Component (`<qc-feedback>` custom element)
- `index.html` - Demo/test page

## Usage

```html
<script src="qc_feedback.js"></script>
<qc-feedback
  app-name="YourApp"
  primary-color="#2563eb"
  position="bottom-right"
  whatsapp="573001112233"
  title="Feedback"
  theme="light|dark">
</qc-feedback>
```

## No Build Commands

This is a single-file library. No `npm install`, no build, no tests.

## Attributes

| Attribute | Default | Description |
|-----------|---------|-------------|
| `app-name` | document.title | App name displayed in messages |
| `primary-color` | #2563eb | Primary color for buttons and accents |
| `position` | bottom-right | FAB position (bottom-right, bottom-left, top-right, top-left) |
| `whatsapp` | (empty) | WhatsApp number to send feedback (format: 573001112233) |
| `title` | "Enviar feedback" | Chat window title |
| `subtitle` | "¿Qué te ocurrió?" | Welcome message |
| `theme` | light | Theme (light or dark) |

## Public API

```javascript
const widget = document.querySelector('qc-feedback');

// Open/close the widget
widget.openWidget();
widget.closeWidget();

// Capture screen
widget.capture();

// Change theme
widget.setTheme('dark');
```

## Events

```javascript
widget.addEventListener('feedback-open', () => console.log('Opened'));
widget.addEventListener('feedback-close', () => console.log('Closed'));
widget.addEventListener('feedback-submit', (e) => console.log(e.detail));
```

## Important Notes

- The component uses Shadow DOM, so styles are isolated
- Image editing uses Fabric.js canvas with pan/zoom support
- html2canvas captures the entire body (excluding the FAB itself)
- WhatsApp link opens in new tab and image downloads automatically