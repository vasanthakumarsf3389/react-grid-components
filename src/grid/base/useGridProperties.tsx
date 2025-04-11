import { MutableRefObject, RefObject, useId, useMemo, useRef } from "react";
import { GridMethods, GridPrivateMethods, GridPrivateProps, GridProps, IGrid, IGridProps } from "./GridInterfaces";
import { Column } from "../models/column";
import { prepareDirectiveColumns } from "./directive-utils";
import { prepareColumns } from "./util";
import { useScroll } from "../actions/useScroll";
import { useServiceLocator } from "../services/service-locator";
import { L10n, useLocaleContext } from "@syncfusion/react-base";
import { ValueFormatter } from "../services/value-formatter";

const initServices = (props: IGridProps & GridPrivateProps): void => {
    // props.serviceLocator?.register('widthService', props.widthService = useColumnWidthService({ parent: props as IGrid }));
    // props.serviceLocator?.register('cellRendererFactory', useCellRendererFactory);
    // props.serviceLocator?.register('rendererFactory', useRendererFactory);
    props.serviceLocator?.register('localization', props.localeObj = L10n('grid', props.defaultLocale as Object, props.locale));
    props.serviceLocator?.register('valueFormatter', props.valueFormatterService = ValueFormatter(props.locale));
    // props.serviceLocator?.register('showHideService', this.showHider = new ShowHide(this));
    // props.serviceLocator?.register('ariaService', props.ariaService = useAriaService());
    // props.serviceLocator?.register('focus', this.focusModule = new FocusStrategy(this));
};

export const useGridProperties = (publicProps: Partial<IGridProps>): IGridProps & GridPrivateProps => {
    const id = useId();
    const serviceLocator = useServiceLocator();
    const { locale } = useLocaleContext();
    const scrollModule = useScroll(publicProps as IGrid);

    // Step 1: Default public props
    const defaultPublicProps = useMemo<Partial<IGridProps>>(() => ({
        id: `grid_${id}`,
        columns: [],
        dataSource: [],
        height: 'auto',
        width: 'auto',
        className: 'e-grid',
        enableRtl: false,
        rowHeight: 30,
        clipMode: 'Ellipsis',
        textWrapSettings: { wrapMode: 'Both' },
        enableAltRow: true,
        allowTextWrap: false,
        allowResizing: false,
        enableHover: true,
        currentViewData: [],
        enableHtmlSanitizer: false,
        scrollModule: scrollModule,
        serviceLocator: serviceLocator,
        locale: locale
    }), [id, scrollModule]);

    // Step 2: Default private props
    const defaultPrivateProps = useMemo<GridPrivateProps>(() => ({
        isAutoGen: false,
        columnModel: [],
        defaultLocale: {
            EmptyRecord: 'No records to display',
        }
    }), []);

    // Step 3: Combine all props — no mutation, no override order issue
    const mergedProps = useMemo<IGridProps & GridPrivateProps>(() => ({
        ...defaultPublicProps,
        ...defaultPrivateProps,
        ...publicProps // Overrides final
    }), [defaultPublicProps, defaultPrivateProps, publicProps]);

    // Step 4: Resolve columns (pure, memoized)
    // ✅ Move this logic OUTSIDE of useMemo (make sure it’s pure!)
    let resolvedColumns: Column[] = [];
    if (!mergedProps.columns?.length && mergedProps.children) {
        resolvedColumns = prepareDirectiveColumns(mergedProps.children, false, mergedProps as IGrid);
    } else {
        resolvedColumns = prepareColumns(mergedProps.columns as Column[], false, mergedProps as IGrid);
    }

    initServices(mergedProps);

    // Step 5: Final props output with columns properly resolved
    return useMemo(() => ({
        ...mergedProps,
        columns: resolvedColumns
    }), [mergedProps, resolvedColumns]);
};
