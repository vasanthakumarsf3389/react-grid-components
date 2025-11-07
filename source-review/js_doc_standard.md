# Add proper jsDoc Comments:

Component must follow this kind of comments addition no single line comments. An empty line after description section. @default and @event and all @decorator rules are must.
- Add a clear description with no grammatical mistakes. Link the relevant property added in description.  
- The description should be added inside the backslash (`/`), followed by asterisks (`*`).  
- An asterisk (`*`) should precede each line description. 

## Property

- **Important Note**: if the default value for the string type is empty string ''. Use hypen like `@default -`.

Example: 

```ts
/**
 * Defines an icon for the button, which can either be a CSS class name for custom styling.
 *
 * @default -
 */
icon?: string | React.ReactNode;
``` 
- There should be a new line after the description and with the default value.

Example: 

```ts
/**
 * Specifies the position of the icon relative to the button text. Options include placing the icon at the left, right, top, or bottom of the button content.
 *
 * @default 'Left'
 */
iconPosition?: string | IconPosition;
```
---

## Event

- Event name can be defined in the `@event eventname` in the description.

Example: 
```ts
/**
 * Triggers when the CheckBox state has been changed by user interaction, allowing custom logic to be executed in response to the state change.
 *
 * @event change
 */
onChange?: (args: ChangeEvent) => void;
```
---

## Method

- Add `@param` directive with type annotation for all parameters in the method.  
- Add `@returns` type for the method in the description.

Example: 
```ts
/**
 * Adds new item(s) to the ListView.
 *
 * @param {Object[]} data - An array of objects representing the items to be added.
 * @param {Fields} fields - Optional. Specifies the fields configuration for the items.
 * @param {number} index - Optional. The index at which to insert the new items.
 * @public
 * @returns {void}
 */
addItem(data: { [key: string]: Object }[], fields?: Fields, index?: number): void;

/**
 * Navigates back from the current sub-list.
 *
 * @public
 * @returns {void}
 */
back(): void;
```

## Enum

- Left and right value should be same and it should start with capital letter. 
- Do not add unused interfaces or enums.

Example: 
Below is only the example for enum definition, do not define this severity or other unused enum in new component generation.

```typescript
/**
 * Specifies the type of severity to display the message with distinctive icons and colors.
 */
export enum Severity {
    /**
     * The message is displayed with icons and colors that indicate it is a normal message.
     */
    Normal = 'Normal',
    /**
     * The message is displayed with icons and colors that indicate it is a success message.
     */
    Success = 'Success'
}
```
---

> If it was a private method/property or event, add `@private`.