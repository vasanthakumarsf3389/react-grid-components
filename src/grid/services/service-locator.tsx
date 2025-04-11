import React, { Dispatch, useCallback, useMemo, useRef, useState } from 'react';
import { isNullOrUndefined } from '@syncfusion/react-base';
// import { Filter } from '../actions/filter';
// import { Sort } from '../actions/sort';
// import { ColumnChooser } from '../actions/column-chooser';
// import { ColumnMenu } from '../..';
// import { ResponsiveDialogAction } from '../base/enum';
// import { ResponsiveDialogRenderer } from '../renderer/responsive-dialog-renderer';

/**
 * ServiceLocator hook for React components
 */
export interface ServiceLocator {
    register<T>(name: string, type: T): void;
    getService<T>(name: string): T;
    services: {
        [x: string]: unknown;
    };
    // setServices: Dispatch<React.SetStateAction<{
    //     [x: string]: unknown;
    // }>>

    // registerAdaptiveService(
    //     type: Filter | Sort | ColumnChooser | ColumnMenu,
    //     isAdaptiveUI: boolean,
    //     action: ResponsiveDialogAction
    // ): void;
}
export const useServiceLocator = (): ServiceLocator => {
    // const [services, setServices] = useState<{ [x: string]: unknown }>({});
    const servicesRef = useRef<{ [x: string]: unknown }>({});

    /**
     * Registers a service with the given name
     * 
     * @param name - The name of the service
     * @param type - The service implementation
     */
    const register = useCallback(<T,>(name: string, type: T): void => {
        // if (isNullOrUndefined(services[`${name}`])) {
        //     setServices(prevServices => ({
        //         ...prevServices,
        //         [`${name}`]: type
        //     }));
        // }
        if (isNullOrUndefined(servicesRef.current[name])) {
            servicesRef.current[name] = type; // 🔥 Update ref synchronously
        }
    }, []);

    /**
     * Gets a service by name
     * 
     * @param name - The name of the service to retrieve
     * @returns The requested service
     * @throws Error if the service is not registered
     */
    const getService = useCallback(<T,>(name: string): T => {
        // if (isNullOrUndefined(services[`${name}`])) {
        //     // eslint-disable-next-line no-throw-literal
        //     throw `The service ${name} is not registered`;
        // }
        // return services[`${name}`] as T;

        if (isNullOrUndefined(servicesRef.current[name])) {
            throw `The service ${name} is not registered`;
        }
        return servicesRef.current[name] as T;
    }, []);

    // /**
    //  * Registers adaptive service for responsive UI
    //  * 
    //  * @param type - The service type (Filter, Sort, ColumnChooser or ColumnMenu)
    //  * @param isAdaptiveUI - Whether adaptive UI is enabled
    //  * @param action - The responsive dialog action
    //  */
    // const registerAdaptiveService = useCallback((
    //     type: Filter | Sort | ColumnChooser | ColumnMenu,
    //     isAdaptiveUI: boolean,
    //     action: ResponsiveDialogAction
    // ): void => {
    //     if (isAdaptiveUI) {
    //         type.responsiveDialogRenderer = new ResponsiveDialogRenderer(type.parent, { getService });
    //         type.responsiveDialogRenderer.action = action;
    //     } else {
    //         if (type.responsiveDialogRenderer) {
    //             type.responsiveDialogRenderer.removeEventListener();
    //             type.responsiveDialogRenderer = undefined;
    //         }
    //     }
    // }, []);

    return useMemo(() => ({
        services: servicesRef.current,
        // services,
        register,
        getService,
        // registerAdaptiveService
    }), []);
};
