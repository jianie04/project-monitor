# Copilot Instructions for project-monitor

## Overview
This project is a simple web-based dashboard catalog for tracking projects, built with vanilla HTML, CSS, and JavaScript. It uses Firebase Firestore as a backend for storing and retrieving project data.

## Architecture
- **Frontend:**
  - `index.html/index.html`: Main HTML file. Contains a form for adding projects and a table for listing them.
  - `style.css/style.css`: Styles for the form, table, and layout. Uses a clean, modern look.
  - `script.js/script.js`: Handles all client-side logic, including Firebase integration, form submission, and table updates.
- **Backend:**
  - Firebase Firestore (cloud-hosted, no server code in this repo).

## Key Patterns & Conventions
- **File Structure:**
  - Each main asset (HTML, JS, CSS) is in its own subfolder (e.g., `index.html/`, `script.js/`, `style.css/`).
  - Use absolute paths in HTML for linking scripts and styles (e.g., `/script.js/script.js`).
- **Firebase Usage:**
  - Firebase is initialized in `script.js/script.js` using the compat SDKs for v9.
  - All project data is stored in the `projects` collection in Firestore.
  - Adding a project is done via `db.collection("projects").add({...})`.
- **DOM Manipulation:**
  - Form and table elements are selected by ID or querySelector.
  - Form submission is handled with an async event listener.

## Developer Workflows
- **No build step:**
  - All files are static and can be opened directly in a browser.
- **Testing:**
  - Manual: Open `index.html/index.html` in a browser. Add projects and verify they appear in the table and in Firestore.
- **Debugging:**
  - Use browser dev tools for JS errors and network requests.
  - Firebase errors are logged to the console.

## Integration Points
- **Firebase:**
  - Uses Firestore for data storage. Requires internet access and valid Firebase credentials.
  - No authentication is implemented; all users can add projects.

## Project-Specific Notes
- The table header has a typo: "Updated Updated" (should be clarified if this is intentional).
- No automated tests or CI/CD are present.
- No package manager or dependencies beyond Firebase CDN.

## Example: Adding a Project
1. Fill out the form fields (Department, Developer, Data Report, Remarks).
2. Click "Add Project". The project is saved to Firestore and the form resets.

---

For major changes, update this file to reflect new conventions or workflows.
