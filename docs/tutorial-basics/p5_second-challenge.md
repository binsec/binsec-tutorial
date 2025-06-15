---
sidebar_position: 5
sidebar_label: Second challenge
title: Second challenge
description: "Yet another practice session."
slug: ./second_challenge
---

import useBaseUrl from '@docusaurus/useBaseUrl';

import Icon from "@site/src/components/Icon";
import Hexdump from "@site/src/components/Hexdump";
import { Editor } from "@site/src/components/DBA/Editor";
import { Sample } from "@site/src/components/Binsec/Sample";

import { image, headers, hexdump, objdump } from "@site/src/components/Samples/Vault"
import Snippet1 from "@site/src/components/Samples/Vault/Snippet1"


# Break the vault

In this session, your mission will be to find the password required by the challenge `vault` <a href={useBaseUrl('/bin/vault')} download><Icon icon="fa-solid fa-file-arrow-down" /></a> (from [Hackropole](https://hackropole.fr/fr/challenges/reverse/fcsc2019-reverse-vault/)).


## Hexdump

As usual, here is the summary of the basic reverse-engineering information.

:::tip

Do not forget to look at the `.plt` disassembly.

:::

:::note

- The `main` does not return, it directly calls directly `exit` (thus, you can not use `<main> return`).
- The function `tcgetattr` and `tcsetattr` can be stubbed to simply return `0`.

:::


<Hexdump
  source={ hexdump }
  headers={ headers }
  disassembly={ objdump }
/>

## Your solution

<Sample
    Model={Editor}
    height="15em"
    width='100%'
    value={
`# Enter your script here
# starting from ...
# ...
# reach ...
# cut at ...`}
    filename='vault'
    binary={image}
    maxDepth={10000}
    heuristic="bfs"
    monitor='toggle'
 />

<details>
<summary>Proposed solution</summary>

<Sample
    Model={Snippet1}
    height="10em"
    width='100%'
    value=''
    filename= 'vault'
    binary={image}
    maxDepth={10000}
    heuristic="bfs"
    monitor='toggle'
    >
    Download <a href={useBaseUrl('/snippet/vault_script_1.ini')} download><Icon icon="fa-solid fa-file-arrow-down" /></a> or copy the content of the script in the file `vault_script_1.ini`, then run the following command.
    ```bash
    binsec -sse -sse-script vault_script_1.ini -sse-depth 10000 vault
    ```
    ```plain title="Output"
[sse:info] Load section .data (0x0000000000202000, 0x18)
[sse:info] Load section .rodata (0x0000000000000c70, 0xfc)
[sse:info] TTY: press [space] to switch between log and monitor modes.
[sse:result] Path 82 reached address 0x00000780 (<puts@plt>) (0 to go)
[sse:result] C string stdin[0<64>, *] : "346bc605be4ed8361a68a3d9748fc9b87de397e1\n"
[sse:info] SMT queries
             Preprocessing simplifications
               total          375
               true           45
               false          122
               constant enum  208
             
             Satisfiability queries
               total          81
               sat            81
               unsat          0
               unknown        0
               time           0.14
               average        0.00
             
           Exploration
             total paths                      82
             completed/cut paths              40
             pending paths                    42
             stale paths                      0
             failed assertions                0
             branching points                 414
             max path depth                   2313
             visited instructions (unrolled)  3073
             visited instructions (static)    148
```
</Sample>

</details>
