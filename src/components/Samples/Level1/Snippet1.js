import { useEffect } from "react";
import CodeBlock from "@theme/CodeBlock";

const code = `replace <printf@plt> by
  return 0
end

replace <__isoc99_scanf@plt> (format, ptr) by
  assert @[format, 5] = "%64s"z
  @[ptr, 64] := stdin[0, 64]
  return 1
end

# highlight-next-line  
load sections .rodata, .data from file
starting from <main>
# highlight-next-line  
with concrete stack pointer

reach <printf@plt> (str) such that @[str, 19] = "You are correct :)"z
                         then print c string stdin
cut at <main> return`

export default ({ onChange, ...props }) => {

    useEffect(() => onChange(code), []);

    return (<CodeBlock language="dba">
            {code}
        </CodeBlock>)

}