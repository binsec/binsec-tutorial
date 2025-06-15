import { useEffect } from "react";
import CodeBlock from "@theme/CodeBlock";

const code = `starting from core

replace <puts> (_) by
  return 0
end

abort at <__stack_chk_fail>

stdin_pos<64> := 0
replace <fgets> (ptr, size, _) by
  for i<64> in 0 to size - 1 do
    @[ptr + i] := stdin[stdin_pos]
    stdin_pos := stdin_pos + 1
  end
  return size
end

reach <puts> such that @[rdi, 8] = "Welcome!" then print c string stdin
cut at <main> return`

export default ({ onChange, ...props }) => {

    useEffect(() => onChange(code), []);

    return (<CodeBlock language="dba" title='crackme_script_1.ini'>
            {code}
        </CodeBlock>)

}