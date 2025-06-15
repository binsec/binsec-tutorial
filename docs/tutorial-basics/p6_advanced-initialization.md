---
sidebar_position: 6
description: "How to start the exploration from a concrete state."
slug: ./advanced-initialization
---

import useBaseUrl from '@docusaurus/useBaseUrl';

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Icon from "@site/src/components/Icon";
import Hexdump from "@site/src/components/Hexdump";
import { Editor } from "@site/src/components/DBA/Editor";
import { Sample } from "@site/src/components/Binsec/Sample";

import { image, headers, hexdump, objdump } from "@site/src/components/Samples/Crackme"
import Snippet1 from "@site/src/components/Samples/Crackme/Snippet1"

import { core, sysroot } from "@site/src/components/Samples/Crackme"

# Coredump initialization

In the [previous chapter](./p4_advanced-script.md), we have seen how to model a function in the BINSEC intermediate language.


In the `level1` <a href={useBaseUrl('/bin/level1')} download><Icon icon="fa-solid fa-file-arrow-down" /></a> challenge,
we had to model the two functions `__isoc99_scanf` and `printf`.

:::note

A function stub **must** be provided when at least one of the following conditions is met:
<ul className="fa-ul">
<li><Icon style={{color: 'green'}} icon="fa-regular fa-circle-check" /> it produces new symbolic values (e.g. `__isoc99_scanf`);</li>
<li><Icon style={{color: 'orange'}} icon="fa-regular fa-circle-check" /> it interacts with the environment (e.g. `printf`);</li>
<li><Icon style={{color: 'red'}} icon="fa-regular fa-circle-xmark" /> its body is absent from the target binary (e.g. both `__isoc99_scanf` and `printf`).</li>
</ul>

::: 

*Still, what happens when there are more than two functions to modelize?*  
Providing a stub for each dynamically linked function can quickly become tricky and cumbersome. 

The good news is there is a way to partly automatize everything related to dynamic linking.
The tip is to start the analysis from a snapshot of the process after that the dynamic linker served
its purpose.

We will illustrate the process with the challenge named `crackme` <a href={useBaseUrl('/bin/crackme')} download><Icon icon="fa-solid fa-file-arrow-down" /></a> which comes from the site [crackmes.one](https://crackmes.one/crackme/644af68433c5d43938912c6b).

## <Icon icon="fa-solid fa-book" /> What is inside?

This challenge consist of an ELF `x86-64` executable that dynamically links with libraries.

### Hexdump

As before, we put here the summary of basic information that can be extracted via **BINSEC**.

<Hexdump
  source={ hexdump }
  headers={ headers }
  disassembly={ objdump }
/>

### Reverse engineering 

If we run it, we are asked to enter a password. 

```bash
./crackme
```
```plain title="Output"
./crackme
Enter password:
Go away!
```

As usual, failing to provide the good one greets us with an error message, while we can guess that we want the `Welcome!` message from the `.rodata` section (`0x2000`).

Looking at the dynamic symbol table shows us the dynamically linked
functions the program may call: here `puts` for output and `fgets` for input, but also `strncpy` and `strcmp` for data processing.

```plain
Symbol table '.dynsym' contains 12 entries:
  Num:            Value Size Type   Bind   Section Name             
    0: 0000000000000000    0 NOTYPE LOCAL  UND         
# highlight-next-line             
    1: 0000000000000000    0 FUNC   GLOBAL UND     strncpy          
    2: 0000000000000000    0 NOTYPE WEAK   UND     _ITM_deregiste...
# highlight-next-line
    3: 0000000000000000    0 FUNC   GLOBAL UND     puts             
    4: 0000000000000000    0 FUNC   GLOBAL UND     __stack_chk_fail 
    5: 0000000000000000    0 FUNC   GLOBAL UND     __libc_start_main
# highlight-next-line
    6: 0000000000000000    0 FUNC   GLOBAL UND     fgets         
# highlight-next-line   
    7: 0000000000000000    0 FUNC   GLOBAL UND     strcmp           
    8: 0000000000000000    0 NOTYPE WEAK   UND     __gmon_start__   
    9: 0000000000000000    0 NOTYPE WEAK   UND     _ITM_registerT...
   10: 0000000000000000    0 FUNC   WEAK   UND     __cxa_finalize   
   11: 0000000000004020    8 OBJECT GLOBAL .bss    stdin            
```

## Generating the core dump

First, we need to generate a *core dump*. For this, we will use the script [`make coredump.sh`](https://github.com/binsec/binsec/blob/2ecbb8aed2f6164acfa1b472119199376206c060/utils/make_coredump.sh).

This script is a wrapper around `gdb`. It runs the program with the environment variable
LD BIND NOW set, such that the dynamic linker resolves all the dynamic functions at
startup time, stopping at the main function and outputting the memory dump.

Gor the reproducibility, we can then use the script [`archive_sysroot.sh`](https://github.com/binsec/binsec/blob/2ecbb8aed2f6164acfa1b472119199376206c060/utils/archive_sysroot.sh) to create a copy of the files used by the snapshot.


We will illustrate the process with the challenge named `crackme` <a href={useBaseUrl('/bin/crackme')} download><Icon icon="fa-solid fa-file-arrow-down" /></a> which comes from the site [crackmes.one](https://crackmes.one/crackme/644af68433c5d43938912c6b).

<Tabs groupId="setup" queryString>
  <TabItem value="browser" label="Browser" default>
    We have already prepared the files `core.snapshot.tar.gz` <a href={useBaseUrl('/bin/core.snapshot.tar.gz')} download><Icon icon="fa-solid fa-file-arrow-down" /></a> and `sysroot.tar.gz` <a href={useBaseUrl('/bin/sysroot.tar.gz')} download><Icon icon="fa-solid fa-file-arrow-down" /></a>.
  </TabItem>
  <TabItem value="command-line" label="Command-line">
  The following commands will produce the files `core.snapshot` and `sysroot.tar.gz`.
```bash
make_coredump.sh core.snapshot crackme
archive_sysroot.sh core.snapshot sysroot.tar.gz
```

  :::tip

  You can also download the files `core.snapshot.tar.gz` <a href={useBaseUrl('/bin/core.snapshot.tar.gz')} download><Icon icon="fa-solid fa-file-arrow-down" /></a> and `sysroot.tar.gz` <a href={useBaseUrl('/bin/sysroot.tar.gz')} download><Icon icon="fa-solid fa-file-arrow-down" /></a>.

  Then extract the the content with the following commands.

  ```bash
tar xzf core.snapshot.tar.gz
tar xzf sysroot.tar.gz --one-top-level sysroot
  ```

  :::
  </TabItem>
</Tabs>

## Final script

We will use the following script.

<Sample
    Model={Snippet1}
    height="10em"
    width='100%'
    value=''
    filename= 'level1'
    binary={core}
    sysroot={sysroot}
    monitor='toggle'
    >
    Download <a href={useBaseUrl('/snippet/crackme_script_1.ini')} download><Icon icon="fa-solid fa-file-arrow-down" /></a> or copy the content of the script in the file `crackme_script_1.ini`.

    To run **BINSEC**, we have to pass the generated core dump instead of the original
binary.
    ```bash
    binsec -sse -sse-script crackme_script_1.ini core.snapshot -sse-sysroot sysroot
    ```
    ```plain title="Output"
[sse:result] Path 1 reached address 0x7df64f3135a0 (<puts>) (0 to go)
[sse:result] C string stdin[0<64>, *] : "Password"
[sse:info] SMT queries
             Preprocessing simplifications
               total          12
               sat            12
               unsat          0
               time           0.00
             
             Satisfiability queries
               total          1
               sat            1
               unsat          0
               unknown        0
               time           0.01
               average        0.01
             
           Exploration
             total paths                      2
             completed/cut paths              1
             pending paths                    1
             discontinued paths               0
             failed assertions                0
             branching points                 27
             max path depth                   185
             visited instructions (unrolled)  189
             visited instructions (static)    827
```
</Sample>

We are using an alternative statement `starting from core` to instruct the symbolic
engine to concretize everything from the memory snapshot. It thus replaces loading of
sections, initialization of the starting address and stack pointer.  
*The kind of thing we like to know!*

:::note

Here, we no longer have to anchor the dynamic functions with `@plt`; we can directly use the
symbol names (`<SYMBOL>`) that are automatically resolved by **BINSEC**.

:::

:::tip

The `abort at <__stack_chk_fail>` statement is juste a shortcut for the following.

```dba
replace <__stack_chk_fail> by
  assert false
end
```

:::
