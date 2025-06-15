import clsx from "clsx"
import React, { useId, useState } from "react";

import { Tooltip } from 'react-tooltip';

import { ThemeClassNames, usePrismTheme, useColorMode } from '@docusaurus/theme-common';
import { getPrismCssVariables } from '@docusaurus/theme-common/internal';

import Objdump from '@site/src/components/Objdump';

import styles from "./styles.module.css"

export default function Hexdump({ source, ...props }) {

    const prismTheme = usePrismTheme();
    const prismCssVariables = getPrismCssVariables(prismTheme);

    const config = {
        magic: { color: 'var(--ifm-color-info)', padding: '1px', radius: '10px', },
        header: { color: 'var(--ifm-color-info-darkest)', padding: '4px', radius: '0px', },
        section: { color: 'var(--ifm-color-secondary-darkest)', padding: '4px', radius: '0px', },
        instruction: { color: 'var(--ifm-color-danger)', padding: '2px', radius: '10px', },
        symbol: { color: 'transparent', padding: '0px', radius: '0px', },
        string: { color: '#32d8b4', padding: '1px', radius: '10px', },
    }

    const backgroundColor = (node) => {
        if (node.label === 'section')
            if (node.flags.includes('r')) {
                if (node.flags.includes('x'))
                    return 'var(--ifm-color-danger-darkest)';
                else if (node.flags.includes('w'))
                    return '#25c2a0';
                else return '#1fa588';
            }
        return config[node.label].color;
    }

    const tooltips = [];

    const id = props.id === undefined ? useId() : props.id;

    const padLine = (offsets, start, size) => {
        const startColumn = start % 16
        const endColumn = (start + size) % 16
        if (startColumn === 0 && endColumn === 0)
            return []
        const content = [];
        const n = (size <= 16 - startColumn) ? size : Math.min(size, 16 - startColumn + endColumn);
        for (let idx = 0; idx < n; idx += 1) {
            const offset = start + idx;
            content.push(<span key={id + '-pad-' + offset.toString()}>..</span>);
            if (idx + 1 < 16 && (offset & 1) !== 0)
                content.push(<span key={id + '-space-' + offset.toString()}> </span>);
        }
        if (size > 16 - startColumn && endColumn > 0) {
            const offset = (start + size) & (~0xf);
            offsets.push(<span key={id + '-offset-' + offset.toString()} className={clsx(styles['hex-offset'], styles['not-selectable'])}>{
                offset.toString(16).padStart(8, 0)}
            </span>)
        }
        return content;
    }


    const dump = (offsets, start, node) => {
        if (Array.isArray(node)) {
            const content = [];
            const end = node.reduce((acc, node) => {
                if (acc !== 0 && (acc & 1) == 0)
                    content.push(<span key={id + '-space-' + acc.toString()}> </span>);
                const [pos, subcontent] = dump(offsets, acc, node);
                content.push(subcontent);
                return pos;
            }, start);
            return [end, content];
        } else {
            if ('label' in node) {
                if (node.label === 'padding') {
                    return [start + node.size, padLine(offsets, start, node.size)];
                }
                let [end, content] = dump(offsets, start, node.content);
                if (node.label === 'instruction') {
                    const iid = id + '-inst-' + start.toString();
                    content =
                        <span className={styles['instruction']} key={iid} data-tooltip-id={iid}>{content}</span>
                    tooltips.push(
                        <Tooltip key={id + '-tooltip-' + start.toString()} id={iid}
                            role='dialog'
                            place='right-end'
                            opacity='1'
                            variant={useColorMode().colorMode}
                            openOnClick
                            clickable>
                            <h3>{node.opcode}</h3>
                            <span>{node.address} {node.mnemonic}</span>
                        </Tooltip>)
                } else if (node.label == 'symbol') {
                    const iid = id + '-sym-' + start.toString();
                    content =
                        <span className={styles['symbol']} key={iid} title={node.name}>{content}</span>
                }
                return [end,
                    (<span key={id + '-node-' + start} className={styles['hex-label']} title={'name' in node ? node.name : node.string} style={{
                        backgroundColor: backgroundColor(node),
                        borderRadius: config[node.label].radius,
                        color: '#fff', // 'light-dark(#fff, #000)',
                        paddingTop: config[node.label].padding,
                        paddingBottom: config[node.label].padding,
                        display: 'content',
                    }} >{content}</span>)
                ];
            }
            const content = [];
            node.bytes.forEach((byte, idx) => {
                const offset = start + idx;
                if (offset % 16 === 0)
                    offsets.push(<span key={id + '-offset-' + offset.toString()} className={clsx(styles['hex-offset'], styles['not-selectable'])}>{
                        offset.toString(16).padStart(8, 0)}
                    </span>)
                content.push(<span key={id + '-byte-' + offset.toString()}>{byte.toString(16).padStart(2, 0)}</span>);
                if (idx + 1 < node.bytes.length && (offset & 1) !== 0)
                    content.push(<span key={id + '-space-' + offset.toString()}> </span>);
            });
            return [start + node.size, content];
        }
    }

    const offsets = []
    const [size, content] = dump(offsets, 0, source);

    return (
        <div>
            <div className={styles['hex-panel']} style={prismCssVariables}>
                <div
                    className={styles['hex-dump']}
                >
                    <div>
                        {offsets/* {Array.from({ length: Math.ceil(size / 16) },
                            (_, idx) => (<span key={id + '-offset-' + idx.toString()} className={clsx(styles['hex-offset'], styles['not-selectable'])}>{
                                (16 * idx).toString(16).padStart(8, 0)}
                            </span>))} */}
                    </div>
                    <div>{content}</div>
                    {tooltips}
                </div>
                <div className={styles['hex-legend']}>
                    <table>
                        <tbody>
                            <tr >
                                <th >Legend</th>
                            </tr>
                            <tr >
                                <td >
                                    <span style={{
                                        backgroundColor: config['header'].color,
                                        borderRadius: config['header'].radius,
                                        color: '#fff',
                                        paddingLeft: '1em',
                                        paddingRight: '1em',
                                        paddingTop: config['header'].padding,
                                        paddingBottom: config['header'].padding,
                                    }} >Headers</span>
                                    <span > </span>
                                    <span style={{
                                        backgroundColor: config['magic'].color,
                                        borderRadius: config['magic'].radius,
                                        color: '#fff',
                                        paddingLeft: '1em',
                                        paddingRight: '1em',
                                        paddingTop: config['magic'].padding,
                                        paddingBottom: config['magic'].padding,
                                    }} >Magic</span>
                                </td>
                            </tr>
                            <tr >
                                <td >
                                    <span style={{
                                        backgroundColor: backgroundColor({ label: 'section', flags: 'r-x' }),
                                        borderRadius: config['section'].radius,
                                        color: '#fff',
                                        paddingLeft: '1em',
                                        paddingRight: '1em',
                                        paddingTop: config['section'].padding,
                                        paddingBottom: config['section'].padding,
                                    }} >Code</span>
                                    <span > </span>
                                    <span style={{
                                        backgroundColor: config['instruction'].color,
                                        borderRadius: config['instruction'].radius,
                                        color: '#fff',
                                        paddingLeft: '1em',
                                        paddingRight: '1em',
                                        paddingTop: config['instruction'].padding,
                                        paddingBottom: config['instruction'].padding,
                                    }} >Instructions</span>
                                </td>
                            </tr>
                            <tr >
                                <td >
                                    <span style={{
                                        backgroundColor: backgroundColor({ label: 'section', flags: 'r--' }),
                                        borderRadius: config['section'].radius,
                                        color: '#fff',
                                        paddingLeft: '1em',
                                        paddingRight: '1em',
                                        paddingTop: config['section'].padding,
                                        paddingBottom: config['section'].padding,
                                    }} >Read-Only Data</span>
                                    <span > </span>
                                    <span style={{
                                        backgroundColor: config['string'].color,
                                        borderRadius: config['string'].radius,
                                        color: '#fff',
                                        paddingLeft: '1em',
                                        paddingRight: '1em',
                                        paddingTop: config['string'].padding,
                                        paddingBottom: config['string'].padding,
                                    }} >Strings</span>
                                </td>
                            </tr>
                            <tr >
                                <td >
                                    <span style={{
                                        backgroundColor: backgroundColor({ label: 'section', flags: 'rw-' }),
                                        borderRadius: config['section'].radius,
                                        color: '#fff',
                                        paddingLeft: '1em',
                                        paddingRight: '1em',
                                        paddingTop: config['section'].padding,
                                        paddingBottom: config['section'].padding,
                                    }} >Data</span>
                                    <span > </span>
                                    <span style={{
                                        backgroundColor: backgroundColor({ label: 'section', flags: '---' }),
                                        borderRadius: config['section'].radius,
                                        color: '#fff',
                                        paddingLeft: '1em',
                                        paddingRight: '1em',
                                        paddingTop: config['section'].padding,
                                        paddingBottom: config['section'].padding,
                                    }} >Other Sections</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div >
            {(props.headers !== undefined && props.disassembly !== undefined) &&
                <Objdump {...props} />
            }
        </div>
    )
} 
