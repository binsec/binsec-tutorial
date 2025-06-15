import clsx from "clsx";
import { useState, useEffect } from "react";
import CodeBlock from "@theme/CodeBlock";
import { ThemeClassNames } from '@docusaurus/theme-common';
import ThemeCodeBlock from '@docusaurus/theme-classic/lib/theme/CodeBlock/Container/styles.module.css'

import styles from './styles.module.css';

const snippet = (value) => `starting from <fibonacci>
rdi := nondet as n
# highlight-next-line
assume 0 <= n <= ` + value + `
reach* <fibonacci> return then print dec rax
cut at <fibonacci> return`

export default ({ onChange, ...props }) => {
    const [value, setValue] = useState(10);
    const [code, setCode] = useState(snippet(10));

    const handleValueUpdate = (e) => {
        const value = e.target.value;
        const newCode = snippet(value);
        setValue(value);
        setCode(newCode);
        onChange(newCode);
    }

    useEffect(() => onChange(code), []);

    return (
        <div>
            <CodeBlock language="dba">
                {code}
            </CodeBlock>
            <input className={clsx(ThemeClassNames.common.codeBlock, ThemeCodeBlock.codeBlockContainer, styles['slider'])} type="range" min="0" max="100" defaultValue={value} onChange={handleValueUpdate} />
        </div>)
}