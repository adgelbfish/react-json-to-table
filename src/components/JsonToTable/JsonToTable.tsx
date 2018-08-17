import * as React from "react";

import "./JsonToTable.css";
import { JSONObjectKeys, JSONObjectType } from "./JsonToTableUtils";
import JSONToTableUtils from "./JsonToTableUtils";

export interface IJsonToTableProps {
    id?: string;
    json: any;
    styles?: any;
}

export default class JsonToTable extends React.Component<IJsonToTableProps,
    {}> {
    // constructor
    constructor(props: any, context: any) {
        super(props, context);
    }

    public render() {
        return (
            <table>
                <tbody key={`__j2t_root`}>{this.renderObject(this.props.json)}</tbody>
            </table>
        );
    }

    private renderObject = (obj: any, header?: string) => {
        const phrase = [];
        let tmp;
        if (header) {
            phrase.push(this.renderRowHeader(header));
        }

        const objType: JSONObjectType = JSONToTableUtils.getObjectType(obj);

        switch (objType) {
            case JSONObjectType.ObjectWithNonNumericKeys:
                tmp = header ? (
                    <table>
                        <tbody
                            key={`__j2t_${JSONObjectType.ObjectWithNonNumericKeys.toString()}`}
                        >
                        {this.renderRows(obj)}
                        </tbody>
                    </table>
                ) : (
                    this.renderRows(obj)
                );
                break;
            case JSONObjectType.Array:
                tmp = header ? (
                    <table>
                        <tbody key={`__j2t_${JSONObjectType.Array.toString()}`}>
                        {this.parseArray(obj)}
                        </tbody>
                    </table>
                ) : (
                    this.parseArray(obj)
                );
                break;
        }
        phrase.push(tmp);
        const retval = phrase.map(p => p);
        return header ? (
            <tr>{this.renderCell({content: retval, colspan: 2})}</tr>
        ) : (
            retval
        );
    };

    private renderCell = (params: {
        content: any;
        colspan?: number;
        isHeader?: boolean;
    }) => {
        const {content, colspan, isHeader} = params;
        const valueDisplay = isHeader ? <strong>{content}</strong> : content;
        return <td colSpan={colspan ? colspan : 0}>{valueDisplay}</td>;
    };

    private renderHeader = (labels: any[]) => {
        return (
            <tr>
                {labels.map((v: string) => {
                    return this.renderCell({content: v});
                })}
            </tr>
        );
    };

    private renderValues = (values: string[]) => {
        return (
            <tr>
                {values.map(k => {
                    return this.renderCell({content: k});
                })}
            </tr>
        );
    };

    private renderRowValues = (anArray: any[], labels: any[]) => {
        return anArray.map((item, idx) => {
            return (
                <tr key={`__j2t_${idx.toString()}`}>
                    {labels.map(k => {
                        const isValuePrimitive =
                            JSONToTableUtils.getObjectType(k) === JSONObjectType.Primitive;
                        return isValuePrimitive
                            ? this.renderCell({content: item[k]})
                            : this.renderObject(item[k], k);
                    })}
                </tr>
            );
        });
    };

    private parseArray = (anArray: any[]): any => {
        const phrase = [];
        const labels: JSONObjectKeys = JSONToTableUtils.getUniqueObjectKeys(
            anArray
        );
        if (JSONToTableUtils.checkLabelTypes(labels.labels) !== "number") {
            phrase.push(this.renderHeader(labels.labels));
            phrase.push(this.renderRowValues(anArray, labels.labels));
        } else {
            phrase.push(this.renderValues(anArray));
        }
        return phrase;
    };

    private renderRow = (k: string, v: string | number) => {
        return (
            <tr key={`__j2t_${k}`}>
                <td>
                    <strong>{k}</strong>
                </td>
                <td>{v}</td>
            </tr>
        );
    };

    private renderRowHeader = (label: string) => {
        return (
            <div>
                <strong>{label}</strong>
            </div>
        );
    };

    private renderRows = (obj: any, labelKey?: any) => {
        return Object.keys(obj).map((k, idx) => {
            const value = obj[k];
            const isValuePrimitive =
                JSONToTableUtils.getObjectType(value) === JSONObjectType.Primitive;
            // render row when value is primitive otherwise inspect the value and make the key as header
            const retval: any = isValuePrimitive
                ? this.renderRow(k, value)
                : this.renderObject(value, k);

            return retval;
        });
    };
}
