import clsx from "clsx";
import { useRef, useState  } from "react";

import ButtonStyles from '@docusaurus/theme-classic/src/theme/CodeBlock/Buttons/styles.module.css';
import CopyButton from '@theme/CodeBlock/Buttons/CopyButton';
import { CodeBlockContextProvider, createCodeBlockMetadata, } from '@docusaurus/theme-common/internal';
import { useThemeConfig } from '@docusaurus/theme-common';
import { ThemeClassNames, usePrismTheme } from '@docusaurus/theme-common';
import ThemeCodeBlock from '@docusaurus/theme-classic/lib/theme/CodeBlock/Container/styles.module.css'

import { Highlight } from "prism-react-renderer"

import Icon from '@site/src/components/Icon'

import styles from "./styles.module.css"

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
            <Icon icon="fa-solid fa-arrow-rotate-left" />
            {/* <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-counterclockwise" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z" />
                <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z" />
            </svg> */}
        </button>
    );
}

export function Editor({ value, width, height, onChange, ref }) {
    const [code, setCode] = useState(value);

    const textareaRef = ref !== undefined ? ref : useRef(null);
    const preRef = useRef(null);

    const handleEditorChange = (event) => {
        setCode(event.target.value);
        onChange(event.target.value);
    }

    const handleEditorReset = () => {
        setCode(value);
        onChange(value);
    }

    const handleEditorScroll = () => {
        preRef.current['scrollTop'] = textareaRef.current['scrollTop']
        preRef.current['scrollLeft'] = textareaRef.current['scrollLeft']
    }

    const { prism } = useThemeConfig();
    const metadata = createCodeBlockMetadata({
        code: code,
        magicComments: prism.magicComments,
    });
    return (
        <CodeBlockContextProvider metadata={metadata}>
            <div className={clsx(ThemeClassNames.common.codeBlock, ThemeCodeBlock.codeBlockContainer, styles['code-editor'])} style={{
                height: height,
                width: width,
                position: 'relative',
                direction: 'ltr',
            }}>
                <textarea
                    autoCorrect="off"
                    spellCheck="false"
                    wrap="off"
                    value={code}
                    onChange={handleEditorChange}
                    onScroll={handleEditorScroll}
                    ref={textareaRef}
                />
                <Highlight
                    theme={usePrismTheme()}
                    code={code}
                    language="dba"
                >
                    {({ className, style, tokens, getLineProps, getTokenProps }) => (
                        <pre className={className} style={style} ref={preRef}>
                            {tokens.map((line, i) => (
                                <div key={i} {...getLineProps({ line })}>
                                    {line.map((token, key) => (
                                        <span key={key} {...getTokenProps({ token })} />
                                    ))}
                                </div>
                            ))}
                        </pre>
                    )}
                </Highlight>
                <div className={clsx(ButtonStyles.buttonGroup)}>
                    <ResetBtn resetCode={handleEditorReset} />
                    <CopyButton className={ButtonStyles.button} code={code} />
                </div>

            </div>
        </CodeBlockContextProvider >);
}