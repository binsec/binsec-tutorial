import { useEffect } from "react";
import CodeBlock from "@theme/CodeBlock";

const code = `starting from <magic>
@[esp + 4, 4] := nondet as x
reach <magic> return such that al <> 0 then print x
cut at <magic> return`

export default ({ onChange, ...props }) => {

    useEffect(() => onChange(code), []);

    return (<CodeBlock language="dba">
            {code}
        </CodeBlock>)

}