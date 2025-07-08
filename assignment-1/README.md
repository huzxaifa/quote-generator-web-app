# Quote Generator Web App Summary Report

## Run
- Navigate to the project folder (quote-generator) in the root directory
- Run `npm run dev`, access `http://localhost:3000`.

## Overview
The Quote Generator Web App is a Next.js application that allows users to enter or select a topic to retrieve inspirational quotes. The app features a polished UI with a night sky background, an accessible dropdown for topic selection, and a clear display of the selected topic. This report summarizes the functionalities, components, and technical details of the current implementation.

## Functionalities Implemented

### 1. Topic Input and Selection
- **Description**: Users can type a topic in a text input or select one from a dropdown list.
- **Details**:
  - Input field supports typing partial topics (e.g., "succ" filters to "success").
  - Dropdown opens automatically when typing a non-empty string.
  - Clicking the chevron button toggles the dropdown, but only if the input doesn’t match a valid topic (e.g., "life" prevents dropdown opening).
  - Selecting a topic from the dropdown populates the input field and closes the dropdown in one click.
  - Topics are sourced from `quotes.json` via `getAllTopics` in `utils.ts`.

### 2. Quote Retrieval
- **Description**: Quotes are displayed when the "Get Quotes" button is clicked.
- **Details**:
  - Clicking "Get Quotes" submits the current topic, fetches matching quotes using `getQuotesByTopic`, and clears the input.
  - Quotes are rendered as cards with text and author, styled with DaisyUI’s `cupcake` theme.

### 3. Selected Topic Display
- **Description**: The submitted topic is displayed below the "Get Quotes" button.
- **Details**:
  - Shows "Showing quotes for: [topic]" (e.g., "Showing quotes for: success") after clicking "Get Quotes".
  - Uses Tailwind’s `mt-4` for proper spacing between the button and quotes.

### 4. UI Styling
- **Home Page Background**:
  - Night sky gradient (`from-[#1a1a3d] to-[#2a4066]`) with subtle white starry specks (`radial-gradient` with `opacity: 0.3`).
  - Applied to the root `<div>` in `page.tsx`, covering the full viewport (`min-h-screen`).
- **Dropdown Styling**:
  - Opaque white background (`bg-[#ffffff]`) with `border-base-300` for visibility against the night sky.
  - Dropdown items use `text-base-content` for `cupcake` theme consistency, with `hover:bg-base-300` for interactivity.
  - Rounded corners (`rounded-box`) and shadow (`shadow-lg`) enhance the look.
- **Form Styling**:
  - Input and button use DaisyUI’s `input-bordered` and `btn-primary` classes, aligned with the `cupcake` theme.
  - Chevron button (`ChevronDownIcon`) rotates 180° when the dropdown is open.

### 5. Accessibility
- **Features**:
  - Input has `aria-label="Topic for quotes"` for screen reader support.
  - Chevron button has dynamic `aria-label` ("Open topic dropdown" or "Close topic dropdown").
  - Dropdown items are keyboard-navigable (Tab to input, arrow keys to navigate, Enter to select).
  - No ARIA errors, ensuring high Lighthouse Accessibility scores.
- **Details**: Simple HTML structure (`<ul>`, `<li>`, `<button>`) avoids complex ARIA roles, maintaining compatibility with screen readers like NVDA.

### 6. Event Handling
- **Click Outside**: Clicking outside the dropdown closes it, using a `useRef` and `mousedown` event listener.
- **Event Propagation**: Dropdown item clicks use `e.stopPropagation()` to prevent unintended bubbling.
- **State Management**: Uses `useState` for `topic`, `isDropdownOpen`, `filteredTopics`, and `selectedTopic`. `useMemo` stabilizes `topics` to prevent re-renders.

## Components Used
- **React Components**:
  - `QuoteForm` (`src/components/ui/QuoteForm.tsx`): Handles topic input, dropdown, and submission.
  - `Home` (`src/app/page.tsx`): Renders the main page, including `QuoteForm` and quote display.
- **UI Components (Shadcn/UI and DaisyUI)**:
  - `Button`: Used for the "Get Quotes" button (`btn btn-primary w-full`).
  - `Input`: Used for the topic input (`input input-bordered w-full pr-10 h-10 text-base`).
  - `Label`: Used for the input label (`text-base-content`).
- **Icons**:
  - `ChevronDownIcon` (from `lucide-react`): Toggles the dropdown with rotation animation.
- **Hooks**:
  - `useState`: Manages `topic`, `isDropdownOpen`, `filteredTopics`, `selectedTopic`, and `quotes`.
  - `useEffect`: Handles dropdown filtering and click-outside detection.
  - `useRef`: Tracks the dropdown container for click-outside functionality.
  - `useMemo`: Stabilizes `topics` from `getAllTopics`.

## Technical Details
- **Framework**: Next.js (client-side rendering with `"use client"`).
- **Styling**:
  - Tailwind CSS with DaisyUI’s `cupcake` theme for vibrant colors.
  - Custom night sky gradient (`#1a1a3d` to `#2a4066`) and starry effect in `page.tsx`.
  - Opaque white dropdown (`#ffffff`) with `cupcake` theme borders and text.
- **Data**:
  - `quotes.json` (`src/data/quotes.json`, artifact ID `80045009-c6bf-4a9b-a770-65b09fce0ce4`): Provides topics and quotes.
  - Structure: Array of `QuoteCategory` objects (`{ topic: string, quotes: Quote[] }`), where `Quote` is `{ text: string, author: string }`.
- **Utilities**:
  - `src/lib/utils.ts` (artifact ID `d6827d68-f7b0-4be7-975a-d2cb9aec3d3b`):
    - `getAllTopics`: Returns topic array from `quotes.json`.
    - `getQuotesByTopic`: Returns quotes for a given topic.
  - `src/lib/types.ts`:
    - Defines `Quote` and `QuoteCategory` interfaces for type safety.
- **Dependencies**:
  - `react`, `react-dom`
  - `next`
  - `lucide-react` (for `ChevronDownIcon`)
  - `@radix-ui/react-*` (via Shadcn/UI for `Button`, `Input`, `Label`)
  - `daisyui` (for Tailwind plugin and `cupcake` theme)
- **Accessibility**: High Lighthouse score, tested with NVDA for screen reader compatibility.

## Files and Artifacts
- **QuoteForm.tsx**:
  - Artifact ID: `a7d0c147-1d81-40b2-af69-07d9129c782a`
  - Version ID: `8d6c0c4b-5341-458a-9c21-e5e4958a984f`
  - Path: `src/components/ui/QuoteForm.tsx`
- **page.tsx**:
  - Path: `src/app/page.tsx`
  - Implements night sky background and quote display.
- **utils.ts**:
  - Artifact ID: `d6827d68-f7b0-4be7-975a-d2cb9aec3d3b`
  - Path: `src/lib/utils.ts`
- **types.ts**:
  - Path: `src/lib/types.ts`
  - Defines `Quote` and `QuoteCategory` interfaces.
- **quotes.json**:
  - Artifact ID: `80045009-c6bf-4a9b-a770-65b09fce0ce4`
  - Path: `src/data/quotes.json`

## Testing
- **Test Cases**:
  - **Home Page**: Night sky gradient with starry specks.
  - **Dropdown**: Opaque white background, `text-base-content` items, single-click selection.
  - **Filtering**: Type "succ" → shows "success." Select → updates textbox, closes dropdown.
  - **Chevron**: No dropdown if input is valid (e.g., "life"); shows filtered/all topics otherwise.
  - **Quotes**: Display only after "Get Quotes" click.
  - **Topic Display**: Shows "Showing quotes for: [topic]" with proper spacing.
  - **Keyboard**: Tab to input, type "succ," arrow keys to navigate, Enter to select.
  - **Accessibility**: No ARIA errors in Lighthouse, screen reader compatible.
- **Cache Clearing**: `rm -rf .next && npm run dev` if issues arise.

## Notes
- The app uses a client-side approach for simplicity, with data loaded from `quotes.json`.
- The `cupcake` theme ensures vibrant colors, with custom night sky styling for the home page.
- The implementation prioritizes accessibility and UX, with single-click dropdown selection and clear topic feedback.
