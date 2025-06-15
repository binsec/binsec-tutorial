import clsx from "clsx";
import { useState, useEffect } from "react";
import CodeBlock from "@theme/CodeBlock";
import { ThemeClassNames } from '@docusaurus/theme-common';
import ThemeCodeBlock from '@docusaurus/theme-classic/lib/theme/CodeBlock/Container/styles.module.css'

import styles from './styles.module.css';

const snippet = (value) => `starting from <fibonacci>
# highlight-next-line
rdi := nondet as n
reach <fibonacci> return such that rax = ` + value + ` then print dec n
cut at <fibonacci> return`

export default ({ onChange, ...props }) => {
    const [fibonacciSequence, setFibonacciSequence] = useState([]);

    const [value, setValue] = useState(5);
    const [code, setCode] = useState(snippet(5));

    const handleValueUpdate = (e) => {
        const value = e.target.value;
        const newCode = snippet(fibonacciSequence[value]);
        setValue(value);
        setCode(newCode);
        onChange(newCode);
    }

    useEffect(() => {
        onChange(code);
        const values = [];
        values.push(0n);
        values.push(1n);
        for (let i = 2; i <= 100; i += 1)
            values.push(values[i - 2] + values[i - 1]);
        setFibonacciSequence(values);
    }, []);

    return (
        <div>
            <CodeBlock language="dba">
                {code}
            </CodeBlock>
            <input className={clsx(ThemeClassNames.common.codeBlock, ThemeCodeBlock.codeBlockContainer, styles['slider'])} type="range" min="0" max="100" defaultValue={value} onChange={handleValueUpdate} />
        </div>)
}