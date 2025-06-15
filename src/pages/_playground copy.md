---
title: Playground
---

# Markdown page example

You don't need React to write simple standalone pages.

import CodeEditor from "@site/src/components/DBA";

<div>
<CodeEditor
                height="10em"
                width='80ch'
                language="dba"
                theme='vs'
                value="halt"
                options={{
        readOnly: false,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        minimap: { enabled: false },
        fontSize: '15px'
    }}
            />
</div>

```dba
# comment aaaa "aaa"
starting from <main>
print "toto" # comment is a
assert true
print 10
print 0b1010
print 0x10
print rax<32> :: ebx + (5 * x) / @[esp, 4]
rax := nondet
halt
```
```dba
starting from <fibonacci>
# highlight-next-line
rdi := 5
reach <fibonacci> return then print dec rax
```

import { Highlight, themes } from "prism-react-renderer"

import { DBAHighlight } from "@site/src/components/DBA/block"

<DBAHighlight>
starting from
rdi := 5
reach return then print dec rax
</DBAHighlight>

<div class="prism-code language-js">
<code class="language-js">function int starting from</code>
</div>