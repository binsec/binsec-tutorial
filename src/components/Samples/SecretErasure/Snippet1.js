import { useEffect } from "react";
import CodeBlock from "@theme/CodeBlock";

const code = `starting from core
explore all
check secret erasure over <main>

replace <high_input_32> (ptr) by
  @[ptr, 32] := secret as high_input_32
  return
end

replace <low_input_32> (ptr) by
  @[ptr, 32] := public as low_input_32
  return
end
`

export default ({ onChange, ...props }) => {

    useEffect(() => onChange(code), []);

    return (<CodeBlock language="dba">
            {code}
        </CodeBlock>)

}