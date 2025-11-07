Follow the code snippet and review the component code only using this conversion rules. 

## Code review component structure Guidelines
You should strictly follow all these guidelines on review.
### Common guidelines
- Follow the class name defined in the TypeScript source and use it as the name of the React Function Component or React custom hook.
- Create a React component for the TypeScript classes if it uses or manipulates or returns UI elements (using React's View, Text, etc.); else create hooks which involve only the functions and actions without UI elements.
- Don't assign values for objects inside the return statement (JSX).
- Add additional checks for potentially null or undefined cases.
- Follow the variable and parameter names as they are in the TypeScript source.
- Use TypeScript template (`tsx`) and strictly follow typing for variables and methods.
- Use `export const ;` instead of `export default ;` for components, properties, and interfaces if needed.
- Include the `export` statement for all interfaces which are exported in the TypeScript source.
- Add export statements for all necessary variables, methods, hooks, etc., wherever they are used in the TypeScript source.
- Don't use any unwanted comment lines.
- Use `null` instead of `undefined`.
- Add all the JSDoc comments to all the props, methods, interfaces, and Component/Hook as the same as the TypeScript source, without any omitted parts.
- If the original code uses web-specific APIs or libraries (like DOM manipulation), replace them with their React equivalents (e.g., `document.getElementById` might need a `useRef` and direct manipulation or state management).
- Don't import the entire React object and maintain tree-shaking behavior.
- Don't change any variable names and keywords.
- Ignore below keywords related code from the React source if they are specific to web development:
  - databind
  - onPropertyChanged
  - ChildProperty
  - INotifyPropertyChanged
  - any DOM-specific APIs
  - refresh
  - created
  - destroyed
  - preRender
  - render
- Don't add the prefix `use` in the name of the custom hook; use the same name from the TypeScript source.
### React component guidelines
- Use React's built-in components (`View`, `Text`, `TextInput`, `TouchableOpacity`, `StyleSheet`, etc.) for UI elements.
- Define styles using `StyleSheet.create`.
- Create state variables using `useState` for interactive elements or private properties if needed, or use regular variables.
- Add the public and protected properties/methods to the props and potentially use `useImperativeHandle` with a `forwardRef` if external access to component methods is required.
Example Basic component structure for our default button component:

```typescript

import { useEffect, useRef, useState, useImperativeHandle, forwardRef, ButtonHTMLAttributes, Ref } from 'react';
import { preRender, useProviderContext, useRippleEffect } from '@syncfusion/react-base';
import * as React from 'react';

/**
 * Button component properties interface.
 * Extends standard HTMLButtonElement attributes.
 */
export interface ButtonProps {
    /**
     * Specifies the position of the icon relative to the button text. Options include placing the icon at the left, right, top, or bottom of the button content.
     *
     * @default 'Left'
     */
    iconPosition?: string | IconPosition;

    /**
     * Defines an icon for the button, which can either be a CSS class name for custom styling or an SVG element for rendering.
     *
     * @default -
     */
    icon?: string | React.ReactNode;

    /**
     * Indicates whether the button functions as a toggle button. If true, the button can switch between active and inactive states each time it is clicked.
     *
     * @default false
     */
    togglable?: boolean;

    /**
     * Sets the initial selected state for a toggle button. When true, the button is initially rendered in a 'selected' or 'active' state, otherwise it's inactive.
     *
     * @default false
     */
    selected?: boolean;

    /**
     * Specifies the Color style of the button. Options include 'warning', 'success', 'danger', and 'info'.
     *
     * @default -
     */
    color?: Color | string;

    /**
     * Specifies the variant style of the button. Options include 'outline', 'primary' and 'flat'.
     *
     * @default -
     */
    variant?: Variant | string;

    /**
     * Specifies the size style of the button. Options include 'small' and 'bigger'.
     *
     * @default -
     */
    size?: Size | string;
}

/**
 * Interface representing the Button component methods.
 */
export interface IButton extends ButtonProps {

    /**
     * This is button component element.
     *
     * @private
     * @default null
     */
    element?: HTMLElement | null;

}

type IButtonProps = IButton & ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * The Button component is a versatile element for creating styled buttons with functionalities like toggling, icon positioning, and HTML attribute support, enhancing interaction based on its configuration and state.
 *
 * ```typescript
 * <Button>Submit</Button>
 * ```
 */
export const Button: React.ForwardRefExoticComponent<IButtonProps & React.RefAttributes<IButton>> =
    forwardRef<IButton, IButtonProps>((props: IButtonProps, ref: Ref<IButton>) => {
        const buttonRef: React.RefObject<HTMLButtonElement | null> = useRef<HTMLButtonElement>(null);
        const {
            disabled = false,
            iconPosition = 'Left',
            icon,
            className = '',
            togglable = false,
            selected = false,
            color,
            variant,
            size,
            isLink = false,
            onClick,
            children,
            ...domProps
        } = props;

        const [isActive, setIsActive] = useState<boolean>(selected);
        const { dir, ripple } = useProviderContext();
        const { rippleMouseDown, Ripple} = useRippleEffect(ripple, { duration: 500 });
        const publicAPI: Partial<IButton> = {
            iconPosition,
            icon,
            togglable,
            selected,
            color,
            variant,
            size,
            isLink
        };

        /**
         * Handles the button click event.
         * For toggle buttons, it updates the active state.
         *
         * @param {React.MouseEvent<HTMLButtonElement>} event - React mouse event triggered on button click.
         * @returns {void}
         */
        const handleButtonClick: React.MouseEventHandler<HTMLButtonElement> = (event: React.MouseEvent<HTMLButtonElement>) => {
            if (togglable) {
                setIsActive((prevState: boolean) => !prevState);
            }
            onClick?.(event);
        };

        useEffect(() => {
            setIsActive(selected);
        }, [selected]);

        useEffect(() => {
            preRender('btn');
        }, []);

        useImperativeHandle(ref, () => ({
            ...publicAPI as IButton,
            element: buttonRef.current
        }), [publicAPI]);

        const classNames: string = [
            'sf-btn',
            className,
            dir === 'rtl' ? 'sf-rtl' : '',
            isActive ? 'sf-active' : '',
            isLink ? 'sf-link' : '',
            color ? `sf-${color.toLowerCase()}` : '',
            variant ? `sf-${variant.toLowerCase() === 'filled' ? 'primary' : variant.toLowerCase()}` : '',
            size ? `sf-${size.toLowerCase() === 'large' ? 'bigger' : size.toLowerCase()}` : ''
        ].filter(Boolean).join(' ');

        return (
            <button
                ref={buttonRef}
                className={classNames}
                onClick={handleButtonClick}
                onMouseDown={rippleMouseDown}
                disabled={disabled}
                {...domProps}
            >
                {typeof icon === 'string' && !children && (
                    <span className={`sf-btn-icon ${icon}`} />
                )}
                {typeof icon !== 'string' && !children && (
                    <span className={'sf-btn-icon'}>{icon}</span>
                )}
                {typeof icon === 'string' && children && (iconPosition === 'Left' || iconPosition === 'Top') && (
                    <span className={`sf-btn-icon ${icon} sf-icon-${iconPosition.toLowerCase()}`} />
                )}
                {typeof icon !== 'string' && children && icon && (iconPosition === 'Left' || iconPosition === 'Top') && (
                    <span className={`sf-btn-icon sf-icon-${iconPosition.toLowerCase()}`}>{icon}</span>
                )}
                {children}
                {typeof icon !== 'string' && children && icon && (iconPosition === 'Right' || iconPosition === 'Bottom') && (
                    <span className={`sf-btn-icon sf-icon-${iconPosition.toLowerCase()}`}>{icon}</span>
                )}
                {typeof icon === 'string' && children && (iconPosition === 'Right' || iconPosition === 'Bottom') && (
                    <span className={`sf-btn-icon ${icon} sf-icon-${iconPosition.toLowerCase()}`} />
                )}
                {ripple && <Ripple />}
            </button>
        );
    });

export default React.memo(Button);
```

### React hook guidelines
- Add the public and protected properties/methods to an object named 'props' inside the hook and return this 'props' object from the custom hook. This allows these properties to be modified from the returned object.
- Create an object-type hook if all the methods or properties are `static` in the TypeScript source, to achieve the same execution behavior.
- Create `ref` variables using `useRef` for managing mutable values across renders, similar to instance properties in classes. Use regular variables for simple values that don't trigger re-renders.
- If all the methods and properties are `static` in the helper class, then define the hook as an object type to adopt the same behavior as static.
