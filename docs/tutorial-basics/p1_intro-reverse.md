---
sidebar_position: 1
pagination_prev: tutorial-basics/index
description: "What is inside a tiny ELF executable."
slug: ./intro_reverse
---

import { Tooltip } from 'react-tooltip';

import { useColorMode } from '@docusaurus/theme-common';
import CodeBlock from '@theme/CodeBlock';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import useBaseUrl from '@docusaurus/useBaseUrl';

import Icon from "@site/src/components/Icon";
import { Sample } from "@site/src/components/Binsec/Sample";
import Hexdump from "@site/src/components/Hexdump";

import { Describe } from "@site/src/components/Binsec/Describe";
import { Disassemble } from "@site/src/components/Binsec/Disassemble";

import { fibonacci, disassembly, hexdump, objdump } from "@site/src/components/Samples/Fibonacci"

# Reverse in a nutshell

In this preparatory chapter, we are going to cover the basics of reverse-engineering an executable file. If you are already familiar with binary file format, you can skip and directly go to the [next chapter](p2_intro-symex.md).  

We are going to use the tiny ELF executable `fibonacci` <a href={useBaseUrl("/bin/fibonacci")} download><Icon icon="fa-solid fa-file-arrow-down" /></a> as a running example, paving the way to the next chapter.

## <Icon icon="fa-solid fa-book" /> What is inside?

An executable file contains machine code instructions and data that the processor will operate, but also some metadata that instruct the operating system how to map the content in the process memory.

:::note

The content and encoding of these metadata are operating system dependent. The common ones are:
<ul className="fa-ul">
<li><Icon style={{color: 'green'}} icon="fa-regular fa-circle-check" listItem data-tooltip-id="elf-support" /> the *Executable and Linkable Format* (ELF) for <Icon icon="fa-brands fa-linux" /> Linux;</li>
<li><Icon style={{color: 'orange'}} icon="fa-regular fa-circle-check" listItem data-tooltip-id="pe-support" /> the *Portable Executable* (PE) for <Icon icon="fa-brands fa-windows" /> Windows;</li>
<li><Icon style={{color: 'red'}} icon="fa-regular fa-circle-xmark" listItem data-tooltip-id="mac-o-support" /> *Mach-O* for <Icon icon="fa-brands fa-apple" /> MacOS.</li>
</ul>

:::
<Tooltip
  id="elf-support"
  place='top-start'
  border='solid'
  opacity="1"
  variant={useColorMode().colorMode}
>Well supported by **BINSEC**</Tooltip>
<Tooltip
  id="pe-support"
  place='top-start'
  border='solid'
  opacity="1"
  variant={useColorMode().colorMode} 
>Roughly supported by **BINSEC**</Tooltip>
<Tooltip
  id="mac-o-support"
  place='top-start'
  border='solid'
  opacity="1"
  variant={useColorMode().colorMode}
>Not yet supported by **BINSEC**</Tooltip>

### Hexdump

The following gives you an overview of the file content as read by **BINSEC**. Next sections describe this information in detail.

:::tip

<ul className="fa-ul">
<li><Icon icon="fa-solid fa-arrow-pointer" listItem />Hover block content to display section names or string constants.</li>
<li><Icon icon="fa-solid fa-hand-pointer" listItem />Click on instruction to get the disassembly preview.</li>
</ul>
 
:::

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

### Headers

The headers contain information about the type of the file and the structure of its content. 

**BINSEC** can output basic information about the file using the `-describe` flag.

<Tabs groupId="setup" queryString>
  <TabItem value="browser" label="Browser" default>
    <Describe binary={fibonacci}/>
  </TabItem>
  <TabItem value="command-line" label="Command-line">
    ```bash
    binsec -describe fibonacci
    ```
    ```plain title="Output"
[kernel:result]                          
ELF Header:
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
    4: 0000000000400078   23 FUNC   GLOBAL .text   fibonacci 
```
  </TabItem>
</Tabs>

:::tip

You may get more / prettier information using dedicated tools like <Icon icon="fa-brands fa-linux" /> [`readelf`](https://manpages.debian.org/stretch/binutils/readelf.1.en.html) or <Icon icon="fa-brands fa-windows" /> [`readpe`](https://manpages.debian.org/testing/pev/readpe.1.en.html).

:::

#### ELF header

The ELF header identifies the type of the binary file.

```plain                         
ELF Header:
  Class:               ELF64                        
  Data:                2's complement, little endian
  Type:                EXEC                         
  Machine:             x86
  # highlight-next-line                          
  Entry point address: 0x4000e8                     
```

 Here `fibonacci` is an executable for the [`x86-64` architecture](https://en.wikipedia.org/wiki/X86-64). The entrypoint (`0x4000e8`) will be the first address to be executed when the program is started.

:::info

The [`file`](https://manpages.debian.org/bookworm/file/file.1.en.html) tool determine the file type by reading this header.

:::

 #### Section header

Sections structure the content of the file and provide the mapping between the file offsets and the process virtual addresses.  

 ```plain
Section Headers:
  [Nr] Name      Type     Addr             Off    Size   ES Flg Lk Inf Al
  [ 0]           NULL     0000000000000000 000000 000000 00      0   0  0
  # highlight-next-line
  [ 1] .text     PROGBITS 0000000000400078 000078 0000b1 00  AX  0   0  4
  # highlight-next-line
  [ 2] .rodata   PROGBITS 0000000000400129 000129 000013 00   A  0   0  1
  [ 3] .symtab   SYMTAB   0000000000000000 000140 000078 18      4   3  8
  [ 4] .strtab   STRTAB   0000000000000000 0001b8 00002b 00      0   0  1
  [ 5] .shstrtab STRTAB   0000000000000000 0001e3 000029 00      0   0  1
Key to Flags:
  W (write), A (alloc), X (execute), M (merge), S (strings), I (info),
  L (link order), G (group), T (TLS), O (extra OS processing required)
 ```

 Here, the program loads two section in memory (`A`):
 - `.text` gets the executable permission (`X`), it contains the machine instruction;
 - `.rodata` contains read-only data.

 :::note

The other sections are not loaded in memory. Their only purpose is to provide or complement metadata like the symbols (`.symtab`, `.strtab`) or section names (`.shstrtab`). They are optional (see [`strip`](https://manpages.debian.org/jessie/binutils/strip.1.en.html)), but their absence makes it more opaque for human.

 :::

 #### Symbol table

 Symbols label some elements of the program. They are often provided by the compilation process from a higher language to identify the program functions or global variables.

```plain
Symbol table '.symtab' contains 5 entries:
  Num:            Value Size Type   Bind   Section Name        
    0: 0000000000000000    0 NOTYPE LOCAL  UND                 
    1: 0000000000400090   38 FUNC   LOCAL  .text   parse_uint64
    2: 00000000004000b8   48 FUNC   LOCAL  .text   echo_uint64
    3: 00000000004000e8    0 NOTYPE GLOBAL .text   _start
    # highlight-next-line   
    4: 0000000000400078   23 FUNC   GLOBAL .text   fibonacci 
```

Here, `fibonacci` identifies the entry point of a function that we will study in the next chapter.

### Disassembly

The `.text` section is full of machine instruction opcode. The disassembly aims to recover the (*more*) human readable assembly language mnemonic.

**BINSEC** can output the code disassembly using the `-disasm` flag. 

<Tabs groupId="setup" queryString>
  <TabItem value="browser" label="Browser" default>
    <Disassemble binary={fibonacci} />
  </TabItem>
  <TabItem value="command-line" label="Command-line">
    ```bash
    binsec -disasm -disasm-o-dba fibonacci.dba -disasm-sections .text fibonacci
    ```
```plain title="Output"
[disasm:result] Linear disassembly from 0x00400078 to 0x00400128
[disasm:result] 0x00400078 31 c0                                  xor %eax,%eax
                0x0040007a 48 85 ff                               test %rdi,%rdi
                0x0040007d 74 0f                                  je 0x40008e
                0x0040007f ba 01 00 00 00                         mov $0x1,%edx
                0x00400084 48 92                                  xchg %rax,%rdx
                0x00400086 48 01 d0                               add %rdx,%rax
                0x00400089 48 ff cf                               dec %rdi
                0x0040008c 75 f6                                  jne 0x400084
                0x0040008e c3                                     ret
                0x0040008f 90                                     nop
                0x00400090 31 ff                                  xor %edi,%edi
                0x00400092 0f b6 06                               movzbl (%rsi),%eax
                0x00400095 85 c0                                  test %eax,%eax
                0x00400097 74 1c                                  je 0x4000b5
                0x00400099 83 e8 30                               sub $0x30,%eax
                0x0040009c 0f 88 82 00 00 00                      js 0x400124
                0x004000a2 3c 09                                  cmp $0x9,%al
                0x004000a4 77 7e                                  ja 0x400124
                0x004000a6 48 ff c6                               inc %rsi
                0x004000a9 48 8d 3c bf                            lea (%rdi,%rdi,4),%rdi
                0x004000ad 48 01 ff                               add %rdi,%rdi
                0x004000b0 48 01 c7                               add %rax,%rdi
                0x004000b3 eb dd                                  jmp 0x400092
                0x004000b5 c3                                     ret
                0x004000b6 66 90                                  nop
                0x004000b8 66 68 00 0a                            pushw $0xa00
                0x004000bc 48 89 e6                               mov %rsp,%rsi
                0x004000bf 66 5a                                  pop %dx
                0x004000c1 bb 0a 00 00 00                         mov $0xa,%ebx
                0x004000c6 48 ff ce                               dec %rsi
                0x004000c9 31 d2                                  xor %edx,%edx
                0x004000cb 48 f7 f3                               div %rbx
                0x004000ce 80 c2 30                               add $0x30,%dl
                0x004000d1 88 16                                  mov %dl,(%rsi)
                0x004000d3 48 85 c0                               test %rax,%rax
                0x004000d6 75 ee                                  jne 0x4000c6
                0x004000d8 bf 01 00 00 00                         mov $0x1,%edi
                0x004000dd 48 89 e2                               mov %rsp,%rdx
                0x004000e0 48 29 f2                               sub %rsi,%rdx
                0x004000e3 89 f8                                  mov %edi,%eax
                0x004000e5 0f 05                                  syscall
                0x004000e7 c3                                     ret
                0x004000e8 5f                                     pop %rdi
                0x004000e9 66 83 ff 02                            cmp $0x2,%di
                0x004000ed 75 1f                                  jne 0x40010e
                0x004000ef 48 89 e7                               mov %rsp,%rdi
                0x004000f2 48 8b 77 08                            mov 0x8(%rdi),%rsi
                0x004000f6 e8 95 ff ff ff                         call 0x400090
                0x004000fb e8 78 ff ff ff                         call 0x400078
                0x00400100 e8 b3 ff ff ff                         call 0x4000b8
                0x00400105 31 ff                                  xor %edi,%edi
                0x00400107 b8 3c 00 00 00                         mov $0x3c,%eax
                0x0040010c 0f 05                                  syscall
                0x0040010e bf 01 00 00 00                         mov $0x1,%edi
                0x00400113 48 8d 34 25 29 01 40 00                lea 0x400129,%rsi
                0x0040011b ba 13 00 00 00                         mov $0x13,%edx
                0x00400120 89 f8                                  mov %edi,%eax
                0x00400122 0f 05                                  syscall
                0x00400124 40 b7 ff                               mov $0xff,%dil
                0x00400127 eb de                                  jmp 0x400107
                
                ## Unresolved jumps (3)
                  0x0040008e; 0x004000b5; 0x004000e7;
```
<details>
<summary>In addition, this command output the DBA intermediate representation of **BINSEC** in the file `fibonacci.dba`.</summary> 
<CodeBlock language="dba" title="fibonacci.dba">
{disassembly}
</CodeBlock>
  </details>
  </TabItem>
</Tabs>

:::tip

You will get better output using [`objdump`](https://manpages.debian.org/jessie/binutils/objdump.1.en.html) or a more powerful GUI disassembler like [`cutter`](https://cutter.re/), [`Ghidra`](https://github.com/NationalSecurityAgency/ghidra) or [`IDA`](https://hex-rays.com/).

:::

