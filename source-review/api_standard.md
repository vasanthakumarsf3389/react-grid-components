# React Component Best Coding Practices

For a well-structured and consistent React component API, follow these best practices for **Props**, **Events**, and **Methods**. Do not add unused interfaces or enums.

---
Component must be forwardRef Exotic component and should follow same naming conventions as IComponentName for props IComponent for component imperativeMethods.

## 1. Typings for Ref Variables and normal Variables

**Important**: Always use explicit typing for ref variables and normal variable declaration everywhere inside function or useEffect or any place. Do not use implicit typing or any. 

```typescript
// Always use explicit typing for ref variables and normal variable declaration
const eleRef: React.RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);
const value: number = 5;
const isFirstPage: boolean = currentPage === 1;

// ❌ Avoid implicit typing or Missing type annotation
const badRef = useRef();
const value = 5;
const isFirstPage = currentPage === 1;
```

## 2. Typings for ForwardRef Components

```typescript
// Always use explicit typing for ForwardRef components
export const Message: React.ForwardRefExoticComponent<MsgProps & React.RefAttributes<IMessage>> = forwardRef<IMessage, MsgProps>((props: MsgProps, ref: Ref<IMessage>) => {
  // Component implementation
});

// ❌ Avoid implicit or any typing
export const BadExample = forwardRef((props, ref) => { // Missing type annotations
  // Component implementation
});
```

## 3. Example Component structure of message component.
 It is important this severity, variants are all enums associated with the message component alone do not define severity enum in new component generation and do not add unused interfaces or enums: 

```typescript
import * as React from 'react';
import { useEffect, useRef, useState, forwardRef, HTMLAttributes, useImperativeHandle, useMemo, useCallback, Ref } from 'react';
import { IL10n, L10n, preRender, useProviderContext, SvgIcon } from '@syncfusion/react-base';

export interface MessageProps {
    /**
     * Shows or hides the severity icon in the Message component.
     *
     * @default true
     */
    icon?: boolean | React.ReactNode;

    /**
     * Shows or hides the close icon in the Message component. An end user can click the close icon to hide the message, and the onClose event will be triggered.
     *
     * When set to `false` (default), the close icon is not rendered.
     * When set to `true`, a default close icon (SVG) is displayed on the right side of the message.
     * When a React node is provided, it will be rendered as a custom close icon, replacing the default one.
     *
     * @default false
     */
    closeIcon?: boolean | React.ReactNode;
}
export interface IMessage extends MessageProps {
    /**
     * This is message component element.
     *
     * @private
     * @default null
     */
    element?: HTMLDivElement | null;
}

type MsgProps = IMessage & HTMLAttributes<HTMLDivElement>;

/**
 * The Message component displays messages with severity by differentiating icons and colors to denote the importance and context of the message to the end user.
 *
 * ```typescript
 * <Message closeIcon={true}>Editing is restricted</Message>
 * ```
 */
export const Message: React.ForwardRefExoticComponent<MsgProps & React.RefAttributes<IMessage>> = forwardRef<IMessage, MsgProps>((props: MsgProps, ref: Ref<IMessage>) => {  
  const { children, icon = true, closeIcon = false, severity = Severity.Normal, variant = Variant.Text, visible, onClose, ...rest } = props;
  const [isVisible, setIsVisible] = useState(true);
  const eleRef: React.RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);l);

  // Logic omitted for brevity...

  return isVisible ? (
    <div ref={eleRef} {...rest}>
      {icon && <span>{/* Render icon */}</span>}
      <span>{children}</span>
      {closeIcon && (
        <button onClick={(e) => onClose?.({ element: eleRef.current!, event: e })}>
          {/* Close icon */}
        </button>
      )}
    </div>
  ) : null;
});

export default Message;
```

## 4. Props (Component API)

Props define the input API for a React component. They should be:

- ✅ CamelCase (`myProp`)
- ✅ Descriptive & meaningful
- ✅ Properly typed (TypeScript recommended)
- ✅ Boolean for flags
- ✅ Default values where possible

### ✅ Standard Naming Conventions

| Type      | Example Name   | Description                                            |
|-----------|----------------|--------------------------------------------------------|
| Boolean   | `disabled`     | Do not add prefix `is` for boolean flags (`isOpen`)    |
| Boolean   | `error`        | Do not add prefix `has` when indicating presence       |
| String    | `placeholder`  | No special prefix needed                               |
| Number    | `maxItems`     | Use `min`, `max`, `count` for numeric props            |
| Function  | `onChange`     | `on<EventName>` for event handlers                     |
| Object    | `style`        | No special prefix needed                               |
| Array     | `items`        | Use plural for arrays (`options`, `nodes`)             |

**Important** : All props should follow standard HTML attribute naming conventions. If a prop serves the same purpose as a native HTML attribute, use the same naming convention as the HTML attribute.

### 🔍 Examples

```tsx
type ButtonProps = {
  label?: string; // Optional string prop
  disabled?: boolean; // Boolean flag
  variant?: "primary" | "secondary" | "tertiary"; // Enum-like string
  icon?: React.ReactNode; // Node element
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void; // Event handler
};
```
### ✅ Best Practices

```tsx
<Button label="Submit" disabled />
```

### ❌ Avoid Abbreviations

```tsx
<MyComponent lbl="Title" /> // ❌ Bad Practice
```

### Avoid cssClass property in components

**Important**: 

Here’s the updated **Important** note with your two new ignore points added:

---

**Important**:  

- Previously we have used the `cssClass` property in TypeScript components; avoid this in React conversion. We will process `className` props through `...restProps` in props destructuring. So do not add any equivalent property for `cssClass`.  

- Ignore `enableRtl` prop used previously; RTL is now handled via Provider context, so do not add any equivalent prop for this.  

- Ignore `enableHtmlSanitizer` prop used previously; content sanitization should now be handled the React way, hence no need to add any equivalent prop for this.

--- 


## 5. Events (Callbacks)

Events should follow the `on<EventName>` pattern.

### ✅ Standard Naming Conventions

| Type            | Example Name   | Description                                |
|-----------------|----------------|--------------------------------------------|
| Click           | `onClick`      | Standard React naming                      |
| Change          | `onChange`     | Triggered when value changes               |
| Select          | `onSelect`     | Used for dropdowns, trees, etc.            |

### 🧩 Event Function Signature

```tsx
onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
onChange?: (value: string) => void;
onSelect?: (item: ItemType) => void;
```

### ✅ Example Usage

```tsx
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  console.log("Button clicked");
};

<Button onClick={handleClick} />;
```
**Important**

- ❌ Don't use EmitType for event typings.
- ❌ Don't use `created` and `destroyed` events in the component since we do not need it react components.

```ts
    onCreated?: () => void;
    
    onDestroyed?: () => void;
```
- ❌ Do not name event interfaces with suffix args like `ClickEventArgs`, should be named as `ClickEvent`. 

- ❌ **Important**: Avoid passing properties like `isInteracted`, `cancel`, `element` through args.

Example: 

❌ Incorrect Usage:

```ts
interface ClickEventArgs {
    isInteracted?: boolean;
    cancel?: boolean;
    element?: HTMLElement;
    index?: number;
    content?: string
}
```

✅ Correct Usage:

```ts
interface ClickEvent {
    index?: number;
    content?: string
}
```



### ✅ Best Practices
Prefix with 'handle' for component methods

```tsx
const handleChange = (value: string) => console.log(value);
<TextInput onChange={handleChange} />;
```
### ❌ Avoid Generic Handlers

```tsx
const handleEvent = () => {}; // ❌ Too generic
```
---

## 6. Methods (Imperative API)

Methods should be defined on a component’s `ref` using `forwardRef`.

### ✅ Standard Naming Conventions
| Type     | Example Method | Description                        |
|----------|----------------|------------------------------------|
| Focus    | `focus()`      | Sets focus on input                |
| Blur     | `blur()`       | Removes focus                      |
---

## 7. Constants

```ts
// UPPER_CASE for global constants
const API_BASE_URL = 'https://api.example.com';

// PascalCase for constant objects/arrays that won't change
const DefaultTheme = {
  primary: '#007bff',
  secondary: '#6c757d',
};
```

## 8. Icons

**Important**: All icon rendering must use SVG instead of font icons. Avoid using legacy iconCss or similar font-based class props. Use a prop named icon and set its type as ReactNode to allow direct SVG usage.

Example: 

❌ Previous Implementation (Using font icon via iconCss):

```typescript

export interface ButtonProps {
 
    iconCss?: string;
}

//Usage
<Button iconCss="e-icons e-add" />

```
✅ Updated Implementation (Using SVG directly via icon prop):

```typescript

export interface ButtonProps {

    icon?: React.ReactNode;

}

//Usage
<Button icon={<AddIcon />} />

```

## 9. Enum Prop Typing Rule: Enforce Strongly Typed Enums

**IMPORTANT**: Enum-type props must be strongly typed using only the enum. Do not extend enum types with string or any other types (e.g., MyEnum | string). This ensures strict type checking and prevents invalid values.

Example:

❌ Incorrect Usage (Not strongly typed):

```ts

interface MyComponentProps {
  size?: SizeEnum | string; // ❌ Avoid this pattern
};

```
✅ Correct Usage (Strongly typed):

```ts

interface MyComponentProps {
  size?: SizeEnum;
};

```

## 10. General Best Practices

### ✅ Do

- Use **camelCase** for props, event handlers, and methods
- Use clear prefixes: `on`, `set`
- Use **TypeScript** for strong type safety
- Follow React/HTML naming conventions (`onClick`, `onChange`)
- Expose imperative methods via `useImperativeHandle`

### ❌ Avoid

- Boolean prefixes for non-boolean values
- Writing `propName="true"` instead of `isPropName={true}`
- Single-letter props (`t`, `b`, `c`) → ❌ Not readable
- Using `any` for events

```tsx
const handleChange = (event: any) => {}; // ❌ Use proper typing
```