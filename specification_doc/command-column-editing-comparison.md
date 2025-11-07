# Command Column Editing Comparison Spec

## Overview

This document analyzes how the legacy TypeScript Grid command column (see [`grid-ai-prompts/old-source-spec-dom/src/grid/actions/command-column.ts`](grid-ai-prompts/old-source-spec-dom/src/grid/actions/command-column.ts)) implements row-level actions (Edit, Save, Cancel, Delete) and outlines the improvements required for the new pure React command column described in [`grid-ai-prompts/command-column-final-spec.md`](grid-ai-prompts/command-column-final-spec.md).

Focus areas:
- Event wiring and state management in the existing EJ2-driven implementation
- DOM structure and accessibility gaps that must be addressed
- Interaction flow between command buttons and the grid editing module
- Required enhancements for the React-based architecture, including hook-driven state, accessibility, and responsiveness

## Legacy TypeScript Implementation Summary

The existing command column module is an imperative class (`CommandColumn`) instantiated within the EJ2 Grid. Key behaviors include:

1. **Renderer Registration**
   - Uses `CellRendererFactory` to inject `CommandColumnRenderer` for cells flagged with `CellType.CommandColumn`.
   - Relies on EJ2’s service locator (`ServiceLocator`) to fetch and register renderers. This tightly couples the command column to the EJ2 infrastructure.

2. **Event Handling**
   - Subscribes to global grid events (`click`, `keyPressed`, `initialEnd`, `destroy`).
   - Central `commandClickHandler` walks the DOM to locate the clicked button via `closest('.e-unboundcell')` and matches the button with the column’s `commands` configuration.
   - Command IDs are injected during `load()` using `getUid('gridcommand')`, allowing the handler to map a clicked button back to the configuration object.

3. **Interaction with Editing Module**
   - After issuing a `commandClick` event, default behaviors call into `gObj.editModule` to execute `startEdit`, `endEdit`, `closeEdit`, or `deleteRecord` depending on `commandType`.
   - Relies on imperative EJ2 editing APIs and internal state such as `gObj.commandDelIndex` and `gObj.isFocusFirstCell`.

4. **Keyboard Support**
   - Basic keyboard activation for buttons (`enter`, `space`) via `keyPressHandler`. Focus management is otherwise left to the grid’s default behavior.

5. **Limitations**
   - Tight coupling to EJ2 services and DOM utilities (`closest`, `getUid`).
   - Minimal accessibility guarantees (no explicit ARIA roles or labels). The default renderer emits plain `<button>` elements without context-driven attributes.
   - No responsive behavior. Button visibility toggling is achieved by manipulating EJ2 button instances rather than declarative state.
   - Async actions and disabled states are handled by the EJ2 `ButtonModel`; no Promise-awareness or pending state exists out of the box.

## React Command Column Requirements & Enhancements

The React specification demands a headless-first, accessible, and responsive command column that works across multiple grid integrations. Core improvements include:

1. **Declarative Rendering**
   - Replace the EJ2 renderer registration with a reusable React component (`CommandColumn`) that receives row state through props (`row`, `isInEditMode`, `isSelected`, etc.).
   - Encourage host grids to supply actions via configuration while keeping rendering declarative.

2. **State & Interaction Model**
   - Implement action visibility rules based on edit state: Edit/Delete when idle; Save/Cancel while editing.
   - Support custom actions via `CommandAction` definitions with callback props like `onInvoke` and `onAction`.
   - Provide roving tabindex across action buttons, ensuring keyboard navigation with arrow keys, Home/End, Enter/Space, and Escape.

3. **Accessibility**
   - Wrap command buttons in a container with `role="group"` and `aria-label="Row actions"`.
   - Mirror selection state through `aria-selected` and `.sf-cmd-col--selected` classes.
   - Ensure buttons expose descriptive `aria-label`/`tooltip` text and handle disabled states using native HTML semantics.

4. **Responsive Design**
   - Mobile-first layout with configurable breakpoints (≤480px collapses secondary actions into an overflow menu).
   - Use CSS variables (`--rcmd-gap`, `--rcmd-outline`, etc.) for theming, with `.rcmd-col`/`.rcmd-btn` class names replacing legacy `.e-` prefixes.

5. **Async & Error Handling**
   - Allow `onInvoke` handlers to return promises, disabling buttons while pending and preventing duplicate submissions.
   - Surface per-action error callbacks (`onError`) and integrate with grid-level notifications via `onAction`.

6. **Integration Strategy**
   - Provide adapters for Kendo, AG Grid, and MUI Data Grid that map their cell render APIs to the `CommandColumn` component while respecting each grid’s focus and selection semantics.
   - Offer a memoization strategy (`areEqual`) comparing row reference, action arrays, and simple props to avoid redundant renders in virtualized scenarios.

7. **Testing Expectations**
   - Unit tests for keyboard navigation, state class toggling, and async action handling.
   - Integration tests across the supported grid adapters to ensure row-level actions trigger the correct grid editing flows.
   - Accessibility validation (axe-core, screen readers) to confirm compliance with WCAG 2.1 AA.

## Key Differences & Required Changes

| Aspect | Legacy EJ2 Implementation | React Specification Expectations |
| --- | --- | --- |
| Rendering | Imperative renderer registration (`CommandColumnRenderer`). | Declarative React component returning JSX, easily themed and composed. |
| State Control | Command visibility managed by EJ2 button instances and grid edit module. | Prop-driven visibility with `isInEditMode`, `isEditable`, and custom `isVisible` callbacks. |
| Event Flow | `commandClick` event triggers EJ2 editing APIs directly. | Headless hooks: `onAction` callback, per-action `onInvoke` handlers, support async flows. |
| Accessibility | Minimal keyboard handling; limited ARIA support. | Full keyboard map (Tab, Arrow, Home/End, Enter/Space, Esc), `role="group"`, aria attributes, tooltips. |
| Responsiveness | None; buttons always visible. | Mobile-first design, overflow behavior, density variants. |
| Extensibility | Dependent on EJ2 `ButtonModel` and DOM traversal for matching actions. | Extensible `CommandAction` objects with stable IDs, icons, tooltips, custom handlers. |
| Theming | EJ2 CSS classes (`.e-unboundcell`, `.e-grid`). | Neutral CSS variables, `.rcmd-col`, `.rcmd-btn`, theme overrides via host app. |
| Integration | Works only within EJ2 Grid. | Adapter pattern for Kendo, AG Grid, MUI Data Grid, and generic headless usage. |

## Action Items for React Conversion

1. **Component Architecture**
   - Implement `CommandColumn` in React with props matching [`command-column-final-spec.md`](grid-ai-prompts/command-column-final-spec.md).
   - Expose type-safe `CommandAction`, `CommandColumnProps`, and `CommandColumn` component.

2. **Interaction Logic**
   - Implement roving tabindex management and keyboard handlers preventing event bubbling when necessary.
   - Handle edit state transitions (Edit → Save/Cancel) using prop-based control.

3. **Accessibility & Styling**
   - Adopt `.rcmd-col`, `.rcmd-btn`, and modifier classes (`--selected`, `--focused`, `--hovered`).
   - Ensure focus-visible styling and `aria-selected`, `aria-label`, `aria-live` integrations.

4. **Async Handling**
   - Support async `onInvoke` with pending state disabling and optional error reporting.

5. **Adapters & Integration**
   - Draft adapter utilities for popular grids, encapsulating platform-specific focus/selection handling.
   - Provide documentation/examples demonstrating integration with headless data grids.

6. **Testing & QA**
   - Add unit tests covering keyboard navigation, action toggles, async states, and class toggles.
   - Write integration tests for adapter implementations (Kendo, AG Grid, MUI).
   - Conduct accessibility audits (axe-core, screen readers) per spec.

## Conclusion

Transitioning from the legacy EJ2 command column to the new React-based implementation requires moving from imperative, service-locator-driven logic to a declarative, accessible, and extensible component. The React spec mandates robust keyboard support, responsive layouts, async awareness, and integration flexibility—all achievable through well-typed props, hooks, and adapter patterns. This comparison outlines the gaps and directs the necessary improvements to align with modern React standards while preserving row-level edit actions.
