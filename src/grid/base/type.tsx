import { ColumnModel } from "../models/column";

export type ValueAccessor = (field: string, data: Object, column: ColumnModel) => Object;

export type HeaderValueAccessor = (field: string, column: ColumnModel) => Object;