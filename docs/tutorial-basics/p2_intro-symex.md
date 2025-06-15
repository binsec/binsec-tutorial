---
sidebar_position: 2
pagination_prev: tutorial-basics/p1_intro-reverse
description: "Get started with the symbolic execution engine."
slug: ./intro_symex
---

import { Tooltip } from 'react-tooltip';

import { useColorMode } from '@docusaurus/theme-common';
import CodeBlock from '@theme/CodeBlock';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import useBaseUrl from '@docusaurus/useBaseUrl';

import Icon from "@site/src/components/Icon";
import Toggle from "@site/src/components/Toggle";
import Hexdump from "@site/src/components/Hexdump";
import { Editor } from "@site/src/components/DBA/Editor";
import { Sample } from "@site/src/components/Binsec/Sample";

import { fibonacci, disassembly, hexdump, objdump } from "@site/src/components/Samples/Fibonacci"
import Snippet1 from "@site/src/components/Samples/Fibonacci/Snippet1"
import Snippet2 from "@site/src/components/Samples/Fibonacci/Snippet2"
import Snippet3 from "@site/src/components/Samples/Fibonacci/Snippet3"
import Snippet4 from "@site/src/components/Samples/Fibonacci/Snippet4"

# Symbolic execution in a nutshell

In this chapter, we are going to learn how to configure the **BINSEC** symbolic execution engine to explore the different behaviors of small binary programs.

## <Icon icon="fa-solid fa-backward" /> Previously on Fibonacci

Last chapter was introducing the basic reverse-engineering information we can read from the tiny ELF executable `fibonacci` <a href={useBaseUrl('/bin/fibonacci')} download><Icon icon="fa-solid fa-file-arrow-down" /></a>.
As a reminder, the following gives you an overview of the file content as read by **BINSEC**.

<Hexdump
  source={ hexdump }
  headers={`ELF Header:
  Class:               ELF64                        
  Data:                2's complement, little endian
  Type:                EXEC                         
  Machine:             x86                        
  Entry point address: 0x4000e8                     

Section Headers:
  [Nr] Name      Type     Addr             Off    Size   ES Flg Lk Inf Al
  [ 0]           NULL     0000000000000000 000000 000000 00      0   0  0
  [ 1] .text     PROGBITS 0000000000400078 000078 0000b1 00  AX  0   0  4
  [ 2] .rodata   PROGBITS 0000000000400129 000129 000013 00   A  0   0  1
  [ 3] .symtab   SYMTAB   0000000000000000 000140 000078 18      4   3  8
  [ 4] .strtab   STRTAB   0000000000000000 0001b8 00002b 00      0   0  1
  [ 5] .shstrtab STRTAB   0000000000000000 0001e3 000029 00      0   0  1
Key to Flags:
  W (write), A (alloc), X (execute), M (merge), S (strings), I (info),
  L (link order), G (group), T (TLS), O (extra OS processing required)

Symbol table '.symtab' contains 5 entries:
  Num:            Value Size Type   Bind   Section Name        
    0: 0000000000000000    0 NOTYPE LOCAL  UND                 
    1: 0000000000400090   38 FUNC   LOCAL  .text   parse_uint64
    2: 00000000004000b8   48 FUNC   LOCAL  .text   echo_uint64
    3: 00000000004000e8    0 NOTYPE GLOBAL .text   _start    
    4: 0000000000400078   23 FUNC   GLOBAL .text   fibonacci`}
  disassembly={ objdump }
/>

## <Icon icon="fa-solid fa-circle-play" /> Concrete emulation

Putting aside the *Symbolic* in *Symbolic execution* ends up with straight (concrete) execution: not the fastest nor the most robust, but enough to play with small machine code, even if it does not match the processor of your computer.

Here, we can evaluate the computation of the Fibonacci sequence of the eponymous function.
```c
int fibonacci(int);
```

:::info

The `x86-64` calling convention states that the first (*integer'like*) arguments are given, in order, via the registers `rdi`, `rsi`, `rdx`, `rcx`, `r8` and `r9`.
The result is returned in the register `rax`.

:::

We can feed **BINSEC** with the following script.

<Sample
    Model={Snippet1}
    height="10em"
    width='100%'
    value=''
    filename= 'fibonacci'
    binary={fibonacci}
    noinfo
    trace='toggle'>
    Download <a href={useBaseUrl('/snippet/fibonacci_script_1.ini')} download><Icon icon="fa-solid fa-file-arrow-down" /></a> or copy the content of the script in the file `fibonacci_script_1.ini`, then run the following command.
    ```bash
    binsec -sse -sse-script fibonacci_script_1.ini fibonacci
    ```
    ```plain title="Output"
[sse:result] Path 1 reached address 0x0040008e (<fibonacci> return) (0 to go)
[sse:result] Value rax<64> : 5
[sse:info] SMT queries
             Preprocessing simplifications
               total          8
               true           5
               false          2
               constant enum  1
             
             Satisfiability queries
               total          0
               sat            0
               unsat          0
               unknown        0
               time           0.00
               average        -nan
             
           Exploration
             total paths                      1
             completed/cut paths              0
             pending paths                    1
             stale paths                      0
             failed assertions                0
             branching points                 6
             max path depth                   24
             visited instructions (unrolled)  24
             visited instructions (static)    9
```
</Sample>

Here, the script is close to the natural language:
- the first line moves the initial instruction pointer to the value of the symbol `<fibonacci>` (i.e. `0x400078`);
- the second line initialize the register `rdi`, i.e. the function argument according to the calling convention of `x86-64`;
- the last line add the address of the function return (i.e. `0x4000b5`) to the goal of the analysis.
If the address is reach, the engine will print the value of the register `rax` (return value).

:::tip

You can adjust the value of the argument by using the slider.

:::

:::tip

<Tabs groupId="setup" queryString>
  <TabItem value="browser" label="Browser" default>
    **BINSEC** can log the instructions it executes using the <Toggle title="Trace" value={false} /> switch.
  </TabItem>
  <TabItem value="command-line" label="Command-line">
    **BINSEC** can log the instructions it executes using the option `-sse-debug-level 2`.
  </TabItem>
</Tabs>

:::

## <Icon icon="fa-solid fa-circle-play" /> Input-Output inversion

Let us reintroduce the *symbolic* in the equation!
Instead of choosing a concrete input value for `rdi`, we will give some freedom to the symbolic engine.
Symbolic execution is able to provide an input witness, called "*model*", for each program path it covers, i.e. an assignment for the symbolic variables we can feed to the program to follow the given path.
Thus, it means we can query the tool to find a set of inputs that triggers a special condition.

Here, we can use the following script to find the input number which produces a given Fibonacci sequence value.

<Sample
    Model={Snippet2}
    height="10em"
    width='100%'
    value=''
    filename='fibonacci'
    binary={fibonacci}
    heuristic='bfs'
    noinfo
    trace='toggle'
>
   Download <a href={useBaseUrl('/snippet/fibonacci_script_2.ini')} download><Icon icon="fa-solid fa-file-arrow-down" /></a> or copy the content of the script in the file `fibonacci_script_2.ini`, then run the following command.
    ```bash
    binsec -sse -sse-script fibonacci_script_2.ini fibonacci
    ```
    ```plain title="Output"
[sse:result] Path 7 reached address 0x0040008e (<fibonacci> return) (0 to go)
[sse:result] Value n<64> : 5
[sse:info] SMT queries
             Preprocessing simplifications
               total          6
               true           1
               false          4
               constant enum  1
             
             Satisfiability queries
               total          6
               sat            6
               unsat          0
               unknown        0
               time           0.00
               average        0.00
             
           Exploration
             total paths                      7
             completed/cut paths              4
             pending paths                    3
             stale paths                      0
             failed assertions                0
             branching points                 6
             max path depth                   24
             visited instructions (unrolled)  24
             visited instructions (static)    9
```
</Sample>

:::warning

A `reach` does not prevent the execution to go past its address.
To avoid the exploration to go outside the `fibonacci` code, we add the `cut` instruction, so the execution will stop at the fibonacci return address even if the condition is not met.

:::

:::note

Any non-initialized location (registers and memory) is implicitly treated as symbolic by **BINSEC**. Yet, you can not reliably use or constraint them in the script without a name. Thus, it is recommended to always explicitly initialize the program variables either with concrete values or symbolic declarations.

:::

:::warning

Beware that when there are multiple paths to explore, the order in which the instruction appears in the trace log depends on the search strategy of the engine. Instructions from different paths may be interleaved, making it less relevant for us to understand what is happening.

:::

## <Icon icon="fa-solid fa-circle-play" /> Path enumeration

Up to now, we were looking for a precise, single goal. But, we can also use the symbolic execution to just explore and report all the way to reach a given address.

Here, we will use the `reach*` goal which stands for *reach all*.

<Sample
    Model={Snippet3}
    height="10em"
    width='100%'
    value=''
    filename='fibonacci'
    binary={fibonacci}
    heuristic='bfs'
    noinfo
    trace='toggle'
    >
   Download <a href={useBaseUrl('/snippet/fibonacci_script_3.ini')} download><Icon icon="fa-solid fa-file-arrow-down" /></a> or copy the content of the script in the file `fibonacci_script_3.ini`, then run the following command.
    ```bash
    binsec -sse -sse-script fibonacci_script_3.ini -sse-heuristics bfs fibonacci
    ```
    ```plain title="Output"
[sse:result] Path 1 reached address 0x0040008e (<fibonacci> return) (* to go)
[sse:result] Value rax<64> : 0
[sse:result] Path 3 reached address 0x0040008e (<fibonacci> return) (* to go)
[sse:result] Value rax<64> : 1
[sse:result] Path 4 reached address 0x0040008e (<fibonacci> return) (* to go)
[sse:result] Value rax<64> : 1
[sse:result] Path 5 reached address 0x0040008e (<fibonacci> return) (* to go)
[sse:result] Value rax<64> : 2
[sse:result] Path 6 reached address 0x0040008e (<fibonacci> return) (* to go)
[sse:result] Value rax<64> : 3
[sse:result] Path 7 reached address 0x0040008e (<fibonacci> return) (* to go)
[sse:result] Value rax<64> : 5
[sse:result] Path 8 reached address 0x0040008e (<fibonacci> return) (* to go)
[sse:result] Value rax<64> : 8
[sse:result] Path 9 reached address 0x0040008e (<fibonacci> return) (* to go)
[sse:result] Value rax<64> : 13
[sse:result] Path 10 reached address 0x0040008e (<fibonacci> return) (* to go)
[sse:result] Value rax<64> : 21
[sse:result] Path 11 reached address 0x0040008e (<fibonacci> return) (* to go)
[sse:result] Value rax<64> : 34
[sse:result] Path 2 reached address 0x0040008e (<fibonacci> return) (* to go)
[sse:result] Value rax<64> : 55
[sse:info] Empty path worklist: halting ...
[sse:info] SMT queries
             Preprocessing simplifications
               total          22
               true           11
               false          0
               constant enum  11
             
             Satisfiability queries
               total          12
               sat            11
               unsat          1
               unknown        0
               time           0.00
               average        0.00
             
           Exploration
             total paths                      11
             completed/cut paths              11
             pending paths                    0
             stale paths                      0
             failed assertions                0
             branching points                 11
             max path depth                   44
             visited instructions (unrolled)  44
             visited instructions (static)    9
```
</Sample>

:::note

**BINSEC** symbolic execution runs until either all the goals are fulfilled or there is no other valid successor state to execute.
As consequences:
- a single goal script will stop as soon as it reach its target;
- a script without any goal will stop immediately;
- an infeasible or infinite goal prevents the exploration to stop before its worklist exhaustion.

:::

:::tip

Here, we use an assumption to reduce the valid range of value for `n` . It should be the preferred way to limit the search space of the analysis.

:::

## <Icon icon="fa-solid fa-circle-play" /> Bounded verification

Last but not least, if we are able to exhaustively explore all the paths of a program up to a given bound, we can all along verify that nothing wrong will happen under this scope.

For instance, we may wonder what is the upper limit of `n` for which our fibonacci computation is correct. Indeed, the fibonacci sequence grows exponentially while the implementation use fixed 64-bit values.

:::info

Beside the actual result, the x86 arithmetic instructions also update the condition flags, including the carry flag `cf` and the overflow flag `of`. The addition instruction `add` sets these flags when the, respectively unsigned and signed results do not fit in the destination operand.

:::

<Sample
    Model={Snippet4}
    height="10em"
    width='100%'
    value=''
    filename='fibonacci'
    binary={fibonacci}
    heuristic='bfs'
    trace='toggle'
 >
   Download <a href={useBaseUrl('/snippet/fibonacci_script_4.ini')} download><Icon icon="fa-solid fa-file-arrow-down" /></a> or copy the content of the script in the file `fibonacci_script_4.ini`, then run the following command.
    ```bash
    binsec -sse -sse-script fibonacci_script_4.ini -sse-heuristics bfs fibonacci
    ```
    ```plain title="Output"
[sse:info] Empty path worklist: halting ...
[sse:info] SMT queries
             Preprocessing simplifications
               total          10
               true           10
               false          0
               constant enum  0
             
             Satisfiability queries
               total          12
               sat            11
               unsat          1
               unknown        0
               time           0.00
               average        0.00
             
           Exploration
             total paths                      11
             completed/cut paths              11
             pending paths                    0
             stale paths                      0
             failed assertions                0
             branching points                 11
             max path depth                   44
             visited instructions (unrolled)  44
             visited instructions (static)    9
```
</Sample>

Here, we put an assertion to test the overflow flag `of` just after the execution of the `add` instruction. If **BINSEC** terminates its exploration without raising an alarm, we have the guaranty the no overflow will happen up to the chosen limit. Yet, starting from `93`, the assertion fails, meaning the program output is no longer reliable.

:::tip

The `explore all` command ensure the exhaustive enumeration of the program paths. It makes clear the goal of the script and will never been optimized out in the future.

:::

##

In this chapter, you have learned how to setup the entrypoint and the goal of the analysis, how to initialize or symbolize program variables and how to make use of assumption and assertions.
*It is time to put what you have just learned into practice.*


{/*<Sample
    Model={Editor}
    height="10em"
    width='100%'
    value={`starting from <fibonacci>
rdi := 5
reach <fibonacci> return then print dec rax`}
    filename='fibonacci'
    binary={fibonacci}
    heuristic='bfs'
    maxDepth={100000000}
    noinfo />*/}
