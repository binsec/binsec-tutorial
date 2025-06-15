import clsx from "clsx"
import React, { useId, useState } from "react";

import { Tooltip } from 'react-tooltip';

import { ThemeClassNames, usePrismTheme, useColorMode } from '@docusaurus/theme-common';
import { getPrismCssVariables } from '@docusaurus/theme-common/internal';

export default function Disassembly({ source, ...props }) {

    const prismTheme = usePrismTheme();
    const prismCssVariables = getPrismCssVariables(prismTheme);

    const id = props.id === undefined ? useId() : props.id;

    return (<pre>
        {(Array.isArray(source)) &&
            source.map((section, i) =>
                <details key={`${id}-section-${i}`}>
                    <summary>Disassembly of section {section.section}:<br /></summary>
                    <table>
                        <tbody>
                            {section.disassembly.map((instruction, j) => {
                                const row = instruction.symbols.map((symbol, k) =>
                                    <tr key={`${id}-sym-${i}-${j}-${k}`}>
                                        <td colSpan={3}>
                                            {instruction.address.substring(2).padStart(8, 0)} &lt;{symbol}&gt;:
                                        </td>
                                    </tr>);
                                row.push(<tr key={`${id}-inst-${i}-${j}`}>
                                    <td>
                                        {instruction.address.substring(2).padStart(8, ' ')}:
                                    </td>
                                    <td>
                                        {instruction.opcode}
                                    </td>
                                    <td>
                                        <details>
                                            <summary>{instruction.mnemonic}</summary>
                                            <pre>
                                                {instruction.code.map(ins =>
                                                    <code key={`${id}-code-${i}-${j}-${ins.id}`}>{ins.id}: {ins.lines.map((line, k) =>
                                                        <span key={`${id}-line-${i}-${j}-${k}`}>{line}<br /></span>
                                                    )}</code>
                                                )}
                                            </pre>
                                        </details>
                                    </td>
                                </tr>);
                                return row;
                            })}
                        </tbody>
                    </table>
                </details>
            )}
        {(source.error !== undefined) &&
            <span>{source.error}</span>}
    </pre>)
} 
