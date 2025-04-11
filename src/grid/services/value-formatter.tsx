import { IInternationalization, isNullOrUndefined } from '@syncfusion/react-base';
import { Internationalization, setCulture, NumberFormatOptions, DateFormatOptions } from '@syncfusion/react-base';
import { IValueFormatter } from '../base/GridInterfaces';

/**
 * ValueFormatter class to globalize the value.
 *
 * @hidden
 */
export const ValueFormatter = (cultureName?: string) => {
  const intl: IInternationalization = Internationalization();
  
  const props: IValueFormatter = {
    /**
     * Returns the format function for the given format options
     * 
     * @param {NumberFormatOptions | DateFormatOptions} format - Defines the format options
     * @returns {Function} - Returns the formatter function
     */
    getFormatFunction: (format: NumberFormatOptions | DateFormatOptions): Function => {
      if (!isNullOrUndefined(format as DateFormatOptions) && 
          ((format as DateFormatOptions).type === 'dateTime' || 
           (format as DateFormatOptions).type === 'datetime' || 
           (format as DateFormatOptions).type === 'date' || 
           (format as DateFormatOptions).type === 'time')) {
        return intl.getDateFormat(format as DateFormatOptions);
      } else {
        return intl.getNumberFormat(format as NumberFormatOptions);
      }
    },
    
    /**
     * Returns the parser function for the given format options
     * 
     * @param {NumberFormatOptions | DateFormatOptions} format - Defines the format options
     * @returns {Function} - Returns the parser function
     */
    getParserFunction: (format: NumberFormatOptions | DateFormatOptions): Function => {
      if ((format as DateFormatOptions).type) {
        return intl.getDateParser(format as DateFormatOptions);
      } else {
        return intl.getNumberParser(format as NumberFormatOptions);
      }
    },
    
    /**
     * Converts the value from view (string) to the model (appropriate type)
     * 
     * @param {string} value - Defines the string value to be converted
     * @param {Function} format - Defines the parser function
     * @param {string} type - Defines the type of the value
     * @returns {string | number | Date} - Returns the converted value
     */
    fromView: (value: string, format: Function, type?: string): string | number | Date => {
      if ((type === 'date' || type === 'datetime' || type === 'number') && (!isNullOrUndefined(format))) {
        return format(value);
      } else {
        return value;
      }
    },
    
    /**
     * Converts the value from model to view for display purpose
     * 
     * @param {number | Date} value - Defines the value to be formatted
     * @param {Function} format - Defines the format function
     * @returns {string | Object} - Returns the formatted value
     */
    toView: (value: number | Date, format: Function): string | Object => {
      let result: string | Object = value;

      if (!isNullOrUndefined(format) && !isNullOrUndefined(value)) {
        result = format(value);
      }

      return result;
    },
    
    /**
     * Sets the culture to be used for formatting
     * 
     * @param {string} cultureName - Defines the culture name
     * @returns {void}
     */
    setCulture: (cultureName: string): void => {
      if (!isNullOrUndefined(cultureName)) {
        setCulture(cultureName);
      }
    }
  };
  
  // Initialize culture
  if (!isNullOrUndefined(cultureName)) {
    intl.culture = cultureName;
  }
  
  return props;
};

