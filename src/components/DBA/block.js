import clsx from "clsx";
import { useState } from "react"
import { Highlight, themes } from "prism-react-renderer"
import { InputNumber } from "../InputNumber";

export function DBAHighlight(children, ...props) {
    const [state, setState] = useState({
        format: "dec",
        value: "5",
        code: `
starting from <fibonacci>
rdi := 5
reach <fibonacci> return then print dec rax
`
    })

    const handleChange = (e) => {
        setState(s => ({
            ...s,
            [e.target.name]: e.target.value,
        }));
        setState(s => ({
            ...s,
            code: `
starting from <fibonacci>
rdi := ` + s.value + `
reach <fibonacci> return then print `+ s.format + ` rax
`
        }))
    }
    return (
        <div>
            <Highlight
                theme={themes.vsLight}
                code={state.code}
                language="dba"
            >
                {({ className, style, tokens, getLineProps, getTokenProps }) => (
                    <pre style={style}>
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
            <input
            className={clsx('button', 'button--primary', 'shadow--lw')}
                type="number"
                name="value"
                defaultValue="5"
                min="0"
                max="100"
                onChange={handleChange} />
            <select
            className={clsx('navbar__item', 'dropdown', 'dropdown--hoverable', 'dropdown--right')}
                name="format"
                onChange={handleChange}
            >
                <option value="dec">Decimal</option>
                <option value="hex">Hexadecimal</option>
                <option value="bin">Binary</option>
            </select>
            <InputNumber />
        </div>)
}