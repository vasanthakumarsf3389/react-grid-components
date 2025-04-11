import { forwardRef, ForwardRefExoticComponent, MutableRefObject, Ref, RefAttributes, useEffect, useId, useImperativeHandle, useMemo, useRef } from "react";
import { ExposeRender, IGrid, IGridProps } from "./GridInterfaces";
import { GridRender } from "../renderer/GridRender";
import { useGridProperties } from "./useGridProperties";
import { L10n } from "@syncfusion/react-base";
import { useGridMethods } from "./useGridMethods";

const Grid: ForwardRefExoticComponent<Partial<IGridProps> & RefAttributes<IGrid>> = forwardRef<IGrid, Partial<IGridProps>>((props: Partial<IGridProps>, ref: Ref<IGrid>) => {
    const gridRef = useRef<ExposeRender>(null);
    const combinedProps = useGridProperties(props);
    useGridMethods(combinedProps as IGrid, gridRef as MutableRefObject<ExposeRender>);
    
    // Expose methods through the ref
    useImperativeHandle(ref, () => ({
        ...gridRef.current?.publicProps as IGrid
    }), [gridRef]);
    return (<GridRender ref={gridRef} {...combinedProps} />)
});

export default Grid;