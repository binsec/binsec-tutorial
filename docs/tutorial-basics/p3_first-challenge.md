---
sidebar_position: 3
sidebar_label: Small Challenge
title: Small Challenge
description: "Solve a small challenge yourself."
slug : ./small-challenge
---

import useBaseUrl from '@docusaurus/useBaseUrl';

import TabItem from "@theme/TabItem";
import Tabs from "@theme/Tabs";

import Icon from "@site/src/components/Icon";
import Toggle from "@site/src/components/Toggle";
import Hexdump from "@site/src/components/Hexdump";
import { Editor } from "@site/src/components/DBA/Editor";
import { Sample } from "@site/src/components/Binsec/Sample";

import { image, headers, hexdump, objdump } from "@site/src/components/Samples/Magic"
import Snippet1 from "@site/src/components/Samples/Magic/Snippet1"



# Dispel the magic

In this session, your mission will be to solve the small reverse-engineering challenge called `magic` <a href={useBaseUrl('/bin/magic')} download><Icon icon="fa-solid fa-file-arrow-down" /></a>.

The function `magic` to analyze has the following prototype.
```c
int magic (int);
```
<details>
<summary>Its logic checks whether the given input is equal to the expected magic number.</summary>

  Your goal is to find the unique input that validates the challenge.
  The function returns `true` (i.e. *non-zero value*) when called with the right magic number, and `false` (i.e. `0`) otherwise.
</details>

## Hexdump

As usual, here is the summary of the basic reverse-engineering information.

:::info

The `x86-32` calling convention states that arguments are passed in the stack. The stack pointer is `esp`. The memory layout at the callee entry is as follow.

<table>
<tbody>
<tr>
<th>`esp` offset</th>
<th>Size</th>
<th>Value</th>
<th>**BINSEC** syntax</th>
</tr>
<tr>
<td>+0</td>
<td>4 bytes</td>
<td>Return address</td>
<td>`@[esp, 4]`</td>
</tr>
<tr>
<td>+4</td>
<td>4 bytes</td>
<td>First argument</td>
<td>`@[esp + 4, 4]`</td>
</tr>
<tr>
<td>+8</td>
<td>4 bytes</td>
<td>Second argument</td>
<td>`@[esp + 8, 4]`</td>
</tr>
<tr><td colSpan="4">...</td></tr>
<tr>
<td>+(4*i+4)</td>
<td>4 bytes</td>
<td>i<sup>th</sup> argument</td>
<td>`@[esp + 4 * (i + 1), 4]`</td>
</tr>
</tbody>
</table>

The return value is put in `eax`.

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
    filename='magic'
    binary={image}
    heuristic='bfs'
    maxDepth={10000}
    trace='toggle'
    monitor='toggle'
 />

 :::tip

<Tabs groupId="setup" queryString>
  <TabItem value="browser" label="Browser" default>
    **BINSEC** can display exploration metrics on the fly using the <Toggle title="Monitor" value={false} /> switch  
    (c.f. https://github.com/binsec/binsec/blob/master/doc/sse/exploration_board.md#how-to-2-read-the-sse-exploration-board).
  </TabItem>
  <TabItem value="command-line" label="Command-line">
    When the `curses` package is installed, **BINSEC** can display exploration metrics on the fly by pressing the `[space]` bar 
    (c.f. https://github.com/binsec/binsec/blob/master/doc/sse/exploration_board.md#how-to-2-read-the-sse-exploration-board).
  </TabItem>
</Tabs>

:::

<details>
<summary>Proposed solution</summary>

<Sample
    Model={Snippet1}
    height="10em"
    width='100%'
    value=''
    filename= 'magic'
    binary={image}
    >
    Download <a href={useBaseUrl('/snippet/magic_script_1.ini')} download><Icon icon="fa-solid fa-file-arrow-down" /></a> or copy the content of the script in the file `magic_script_1.ini`, then run the following command.
    ```bash
    binsec -sse -sse-script magic_script_1.ini magic
    ```
    ```plain title="Output"
[sse:info] Load section .data (0x0000000000004010, 0x10)
[sse:info] Load section .rodata (0x0000000000002000, 0x64)
[sse:result] Path 9 reached address 0x00001030 (<printf@plt>) (0 to go)
[sse:result] C string stdin[0<64>, *] : "sudo0x18"
[sse:info] SMT queries
             Preprocessing simplifications
               total          9
               true           2
               false          3
               constant enum  4
             
             Satisfiability queries
               total          8
               sat            8
               unsat          0
               unknown        0
               time           0.01
               average        0.00
             
           Exploration
             total paths                      9
             completed/cut paths              0
             pending paths                    9
             stale paths                      0
             failed assertions                0
             branching points                 13
             max path depth                   74
             visited instructions (unrolled)  74
             visited instructions (static)    84
```
</Sample>

More detail at https://github.com/binsec/binsec/blob/master/doc/sse/beginners.md
</details>
