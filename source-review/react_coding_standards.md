# Reusable React Component Development rules

This document outlines best practices, patterns, and anti-patterns when building reusable React components to ensure maintainability, consistency, and ease of use across projects.

---
## ✅ Do's

### 1. **Component Design**
- ✅ Design components to be small, focused, and do one thing well (Single Responsibility Principle).
- ✅ **Important**: Use `sf-` instead of `e-` in react components, example: `sf-control`.
- ✅ Create components that are reusable, not tied to a specific use case or layout.
- ✅ Use function components with hooks instead of class components.
- ✅Compose smaller components together to build more complex UIs.

### 2. **Props Design**
- ✅ Clearly define props using TypeScript interfaces.
- ✅ Prefer primitive types, enums, or defined shapes over `any`.
- ✅ Use `defaultProps` or provide default values using ES6 default arguments.

### 3. **Styling**
- ✅ Use `className` as the primary way to style components.

### 4. **Accessibility**
- ✅ Ensure ARIA attributes are used correctly.
- ✅ Use semantic HTML elements (`<button>`, `<input>`, etc.).
- ✅ Support keyboard navigation and screen readers.

### 5. **Code Practices**
- ✅ Write pure and stateless components when possible.
- ✅ Use `React.memo` and `useCallback`/`useMemo` wisely to avoid unnecessary re-renders.
- ✅ Use `forwardRef` for exposing underlying DOM nodes.
- ✅ Use `useImperativeHandle` when exposing custom methods.

### 6. **Testing**
- ✅ Write unit tests using Jest + Testing Library.
- ✅ Ensure all major prop combinations are tested.
- ✅ Include tests for accessibility behavior.

### 7. **Storybook Integration**
- ✅ Create Storybook stories for each component.
- ✅ Include examples for all variants, states, and edge cases.
- ✅ Use controls to allow dynamic prop manipulation.

### 8. **Prefer Prop-Driven UI Control**
- ✅ Use props to control the component's behavior and appearance.
- ✅ Avoid writing additional methods just to toggle UI's behavior or appearance, if it can be handled through props.

---

# ESLint Rules

- Follow **ESLint rules** strictly to ensure consistent, readable, and error-free code.
- Apply rules such as:
  - Proper spacing and indentation
  - No unused variables or imports
  - Consistent return types
  - Arrow function usage where appropriate
  - Avoid use of `any` type unless necessary
- Always use `const` or `let` instead of `var`
- Include type annotations where possible for better type safety
- Prefer `===` over `==` for strict equality
- Ensure `no-console` rule is followed in production code.
- Address all security-related ESLint warnings, especially those related to potential vulnerabilities like injection risks, unsafe DOM manipulation, and insecure resource loading
> Ensuring adherence to ESLint rules will result in **cleaner**, **more maintainable**, and **standardized** code across all modules.