import clsx from 'clsx';
import React, { useRef, useState, useEffect } from "react";

import ButtonStyles from '@docusaurus/theme-classic/src/theme/CodeBlock/Buttons/styles.module.css';
import CopyButton from '@theme/CodeBlock/Buttons/CopyButton';
import {
    CodeBlockContextProvider,
    createCodeBlockMetadata,
} from '@docusaurus/theme-common/internal';
import { useThemeConfig } from '@docusaurus/theme-common';
import { ThemeClassNames, usePrismTheme } from '@docusaurus/theme-common';
import { useColorMode } from '@docusaurus/theme-common';

import * as monaco from 'monaco-editor';
import Editor, { loader, useMonaco } from "@monaco-editor/react";

const conf = {
    autoClosingPairs: [
        { open: '(', close: ')' },
        { open: '[', close: ']' }
    ],
    comments: {
        lineComment: '#'
    }
};
const lang = {

    // Set defaultToken to invalid to see what you do not tokenize yet
    defaultToken: 'invalid',

    keywords: [
        'starting', 'from',
        'replace', 'by', 'end',
        'if', 'then', 'else', 'for', 'in', 'to', 'do', 'case', 'is',
        'assert', 'return',
        'reach', 'such', 'that',
        'cut', 'halt', 'at', 'as',
        'load', 'section', 'sections', 'print'
    ],

    operators: [
        ':=', '=', '<', '>', '<=', '=>', '+', '-', '*', '/', ':',
    ],

    builtins: [
        'nondet',
        'true', 'false'
    ],

    brackets: [
        ['(', ')', 'delimiter.parenthesis'],
        ['{', '}', 'delimiter.curly'],
        ['[', ']', 'delimiter.square']
    ],

    // we include these common regular expressions
    symbols: /[=<>~&amp;|+\-*\/%@]+/,

    // C# style strings
    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

    // The main tokenizer for our languages
    tokenizer: {
        root: [
            // identifiers and keywords
            [/[A-Za-z_][\w\-\.']*/, {
                cases: {
                    '@builtins': 'predefined.identifier',
                    '@keywords': 'keyword',
                    '@default': 'identifier'
                }
            }],
            [/[<][0-9]+[>]/, 'type.identifier'],
            [/[<][^>]+[>]/, 'string'],

            // whitespace
            { include: '@whitespace' },

            // delimiters and operators
            [/[()\[\]]/, '@brackets'],
            [/:=/, 'predefined.operator'],
            [/@symbols/, {
                cases: {
                    '@operators': 'predefined.operator',
                    '@default': 'operator'
                }
            }],


            // numbers
            [/0x[0-9a-fA-F]+/, 'number.hex'],
            [/0b[0-1]+/, 'number.binary'],
            [/\d+/, 'number'],

            // delimiter: after number because of .\d floats
            [/[,]/, 'delimiter'],

            // strings
            [/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-teminated string
            [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }]
        ],

        string: [
            [/[^\\"]+/, 'string'],
            [/@escapes/, 'string.escape'],
            [/\\./, 'string.escape.invalid'],
            [/"z?/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
        ],

        whitespace: [
            [/[ \t\r\n]+/, 'white'],
            [/#.*$/, 'comment'],
        ],
    },
};

loader.init().then((monaco) => {
    monaco.languages.register({ id: 'dba' });
    monaco.languages.setLanguageConfiguration('dba', conf);
    monaco.languages.setMonarchTokensProvider('dba', lang);
});

function ResetBtn(props) {
    const { resetCode } = props;
    return (
        <button
            type="button"
            aria-label="Reset code"
            title="Reset code"
            className={clsx(
                'clean-btn',
                ButtonStyles.button
            )}
            onClick={resetCode}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-counterclockwise" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z" />
                <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z" />
            </svg>
        </button>
    );
}

export default function CodeEditor(props) {
    const [code, setCode] = useState(props.value);

    const handleEditorChange = (value) => {
        setCode(value);
    }

    const onClickReset = () => {
        setCode(props.value);
    }

    const { prism } = useThemeConfig();
    const metadata = createCodeBlockMetadata({
        code: code,
        magicComments: prism.magicComments,
    });

    return (
        <CodeBlockContextProvider metadata={metadata}>
            <div className={clsx(ThemeClassNames.common.codeBlock)} style={{
                width: props.width,
                position: 'relative',
                direction: 'ltr',
                'border-radius': 'inherit',
            }}>
                <Editor {...props} theme={useColorMode().colorMode === 'dark' ? 'vs-dark' : 'vs'} value={code} onChange={handleEditorChange} />

                <div className={clsx(ButtonStyles.buttonGroup)}>
                    <CopyButton className={ButtonStyles.button} code={code} />
                    {!props.options.readOnly && <ResetBtn resetCode={onClickReset} />}
                </div>
            </div>
        </CodeBlockContextProvider >
    );
}