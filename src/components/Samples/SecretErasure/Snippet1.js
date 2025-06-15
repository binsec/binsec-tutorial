import { useEffect } from "react";
import CodeBlock from "@theme/CodeBlock";

const code = `starting from core

replace <high_input_32> (ptr) by
  @[ptr, 32] := secret as high_input_32
  return
end

replace <low_input_32> (ptr) by
  @[ptr, 32] := nondet as low_input_32
  return
end

replace opcode 0f ae f0 by 
end

check secret erasure over <main>

explore all`

export default ({ onChange, ...props }) => {

    useEffect(() => onChange(code), []);

    return (<CodeBlock language="dba">
            {code}
        </CodeBlock>)

}