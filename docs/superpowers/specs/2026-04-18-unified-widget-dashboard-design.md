# Unified Widget Management Dashboard & Studio

**Date:** 2026-04-18
**Status:** Draft (Pending Review)

## 1. Overview
The goal is to transform the widget management experience into a high-fidelity "Command Center." We will consolidate the listing and creation into a single **Hub** and create an immersive **Studio** for detailed widget configuration.

## 2. Architecture & Routes

### A. The Hub (`/admin/widget`)
The central dashboard for all communication nodes.
*   **Action:** A "Deploy New Node" card/button at the start of the grid.
*   **Content:** "Active Communication Nodes" grid. Large, glassmorphic cards showing active widgets with "Configure" and "View" actions.
*   **Transition:** Clicking "Configure" on a card (or finishing the creation flow) navigates to the **Studio**.

### B. The Studio (`/admin/widget/[widgetId]`)
An immersive, full-screen editor for managing a specific widget.
*   **Center:** Floating Device Preview. A pixel-perfect mock mobile/web frame reflecting real-time changes.
*   **Right Sidebar:** Sleek tabbed interface containing:
    1.  **Design Tab:** Visuals (Colors, Shapes, Position) and Content (Welcome Message, Header Title).
    2.  **Embed Tab:** One-click copy for the widget `<script>` tag.
    3.  **Domains Tab:** Whitelist management for authorized origins.

## 3. Visual Aesthetic ("Command Center")
The UI must feel like a premium AI operating system, supporting both Light and Dark modes.

### Dark Mode ("The Void")
*   **Background:** Deep `#050505` slate.
*   **Surfaces:** Dark glassmorphism (`rgba(255, 255, 255, 0.05)` with `backdrop-blur-xl`).
*   **Accents:** Neon Electric Blue (Voice) and Emerald (Text) glows.
*   **Typography:** Plus Jakarta Sans for UI, JetBrains Mono for technical data.

### Light Mode ("The Gallery")
*   **Background:** Ultra-light `#F9FAFB`.
*   **Surfaces:** Frosted glass (`rgba(255, 255, 255, 0.7)` with `backdrop-blur-md`).
*   **Accents:** Vibrant Liquid Blue/Cyan gradients.
*   **Shadows:** Soft, layered "Natural" shadows.

## 4. Tab Functionality

### 🎨 Design Tab
*   **Real-time Controls:**
    *   `Primary Brand Color` (Bubble/Launcher).
    *   `Surface Color` (Chat Panel).
    *   `Corner Roundness` (0px to 32px slider).
    *   `Position` (Bottom Left vs. Bottom Right toggle).
*   **Content Settings:**
    *   `Header Title` input.
    *   `Welcome Message` textarea.

### 🔗 Embed Tab
*   **Component:** `CodeBlock` with copy-to-clipboard.
*   **Snippet:**
    ```html
    <script 
      src="[ORIGIN]/widget.js" 
      data-key="[WIDGET_ID]" 
      id="chat-widget-script"
      async>
    </script>
    ```

### 🌐 Domains Tab
*   **Feature:** Multi-domain whitelist.
*   **Input:** Tag-based input or simple list with delete actions.
*   **Validation:** Domain format checking (e.g., `example.com`).

## 5. Success Criteria
*   Seamless navigation between Hub and Studio.
*   Zero-latency preview updates in the Studio.
*   Responsive layout that maintains the premium feel on smaller screens.
*   Full visual parity between Design Tab settings and the Preview widget.
