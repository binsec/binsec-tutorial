---
sidebar_position: 4
description: "How to deal with foreign or complex code."
slug: ./advanced-script
---

import useBaseUrl from '@docusaurus/useBaseUrl';

import Icon from "@site/src/components/Icon";
import Hexdump from "@site/src/components/Hexdump";
import { Editor } from "@site/src/components/DBA/Editor";
import { Sample } from "@site/src/components/Binsec/Sample";

import { image, headers, hexdump, objdump } from "@site/src/components/Samples/Level1"
import Snippet1 from "@site/src/components/Samples/Level1/Snippet1"


# Hooks and stubs

Software is not made up of a unique function, and no longer of a unique binary file.
Software interacts with environment and often depends of several libraries. It is now
time to learn how to deal with external (*dynamically linked*) functions, using DBA function stubs.

In this chapter, we will use the simple challenge named `level1` <a href={useBaseUrl('/bin/level1')} download><Icon icon="fa-solid fa-file-arrow-down" /></a> which comes from the site [crackmes.one](https://crackmes.one/crackme/646627a933c5d439389131d9).  


## <Icon icon="fa-solid fa-book" /> What is inside?

This challenge consist of an ELF `x86-64` executable that dynamically links with libraries.

Even if it is quite small (`~16KB`), it is already bigger than the previous examples.

:::note

By default, compilers tend to put a lot of metadata and to pad the content of sections to align on page boundaries (`4KB`), leading easily to binary files of tens of kilobytes.

:::

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
./level1
```
```plain title="Output"
./level1 
Welcome to Easy Crack MeWhat is the Secret ?
Better luck next time. :(
```

As we fail to provide the good one, it simply prompts the message `Better luck next time. :(` before exiting.
If we look at the strings in the `.rodata` section (`0x2000`), we can guess that the success is rewarded by the prompt `You are correct :)`.
Thus, our goal will be to find the password that lead the program to call a printing function (any of `putc`, `puts`, `printf`, etc.) with the string `You are correct :)` as argument.

Looking at the dynamic symbol table shows us the dynamically linked
functions the program may call: here `printf` for output and `__isoc99_scanf` for input.

```plain
Symbol table '.dynsym' contains 8 entries:
  Num:            Value Size Type   Bind   Section Name             
    0: 0000000000000000    0 NOTYPE LOCAL  UND                      
    1: 0000000000000000    0 FUNC   GLOBAL UND     __libc_start_main
    2: 0000000000000000    0 NOTYPE WEAK   UND     _ITM_deregiste...
# highlight-next-line
    3: 0000000000000000    0 FUNC   GLOBAL UND     printf           
    4: 0000000000000000    0 NOTYPE WEAK   UND     __gmon_start__   
# highlight-next-line
    5: 0000000000000000    0 FUNC   GLOBAL UND     __isoc99_scanf   
    6: 0000000000000000    0 NOTYPE WEAK   UND     _ITM_registerT...
    7: 0000000000000000    0 FUNC   WEAK   UND     __cxa_finalize   
```

:::info

The ELF format use the special section `.plt`, for *Procedure Linkage Table*, in order to call the dynamically loaded functions.

The caller first jumps to a fixed entry in the PLT that plays the role of a trampoline and that dispatchs to the actual function implementation.

The disassembly sometimes refers to the pseudo symbol `@plt` to identifies an entry in the PLT.

**BINSEC** partially supports this syntax, so we will be able to use `<printf@plt>` and `<__isoc99_scanf@plt>`. 

:::


## Writing a function stubs

Since the functions `printf` and `__isoc99_scanf` are absent of the binary, **BINSEC** is not able to to explore their code.

Yet, we can write a substitute body for them directly in the script.

For instance, we can model the `printf` function to do nothing else than simply returning to the caller.

```dba
replace <printf@plt> by
  return 0
end
```

:::warning

Even if we use a function name, the `replace` statement does not replace the function itself, it just hook the address of the symbol (which is used to be the function entrypoint).

:::

The function `isoc99_scanf` can be more tricky to model, but we do not have to implement all the behaviors of the original function. Here, it seems that the scan is only called once in the `main` function (`0x1222`). It has a concrete format specifier `%64s` (`0x2032` in `.rodata`) which means it will read a string of maximum 64 bytes.

We can model it with the following script.

```dba
replace <__isoc99_scanf@plt> (format, ptr) by
# highlight-next-line
  assert @[format, 5] = "%64s"z
  @[ptr, 64] := stdin[0, 64]
  return 1
end
```

The important points here are:
- **BINSEC** can match the function arguments according to the calling convention for us (e.g. `format` instead of `rdi` and `ptr` instead of `rsi`);
- we put an `assert` to make sure our prior guess is correct: the analysis will raise an error if the function is called with another argument than`"%64s"`;
- the main memory of the program is accessed via the builtin `@` array. Using another name will automatically declare a new symbolic array that we can use to model *string'like* objects like command line arguments or files. Here, we are (*wisely*) choosing the name `stdin` to model the password input entered by the user.


:::warning

The variable `format` and `ptr` are copies of the original values.
Straight assignment of a new values (`:=`) will not affect the original argument.

:::

:::note

The `z` at the end of `"%64s"z` stands for *zero terminated string* and is a shortcut for `"%64s\x00"`.

:::

## Final script

We can put the pieces together and run the following script.

<Sample
    Model={Snippet1}
    height="10em"
    width='100%'
    value=''
    filename= 'level1'
    binary={image}
    trace='toggle'
    >
    Download <a href={useBaseUrl('/snippet/level1_script_1.ini')} download><Icon icon="fa-solid fa-file-arrow-down" /></a> or copy the content of the script in the file `level1_script_1.ini`, then run the following command.
    ```bash
    binsec -sse -sse-script level1_script_1.ini level1
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

Remember that non initialized locations are treated as symbolic by **BINSEC**.
So, here we use 2 initialization commands to automatically concretize:
- the content of the memory in the `.rodata` and `.data` sections;
- the initial stack pointer.

:::tip

It is always safe to load read-only section like `.rodata` from the file. It is also highly recommended  to concretize or restrict the range of the stack and other pointers to help the symbolic engine to efficiently reason on memory.

:::

## Non replacement hook

Hooks are not limited to replacement and can also be used to instrument the code while still retaining the original behavior.

In fact, we already used hooks since most of the script commands are actually a syntactic sugar around the hook mechanism.

Thus, both versions are equivalent in the following code.

<div style={{ width: '50%', float: 'left', clear: 'left' }}>
```dba

at 0x400089 assert !of

```
</div>

<div style={{ width: '50%', float: 'right', clear: 'right' }}>
```dba
hook 0x400089 with
  assert !of
end
```
</div>

Hooks are somehow concatenated in the same order they appear in the script.

<div style={{ width: '50%', float: 'left', clear: 'left' }}>
```dba

reach <fibonacci> return then print dec rax
cut at <fibonacci> return

```
</div>

<div style={{ width: '50%', float: 'right', clear: 'right' }}>
```dba
hook <fibonacci> return with
  reach then print dec rax
  cut
end
```
</div>

:::note

The `hook` form fallthrough the underlying code at the end of the block if no explicit control flow instruction like `return` or `jump at` is used. On the other hand, the `replace` form raises an error if it reaches the end of the block.

:::

Now you have learned how to replace or instrument the code with hooks, it is time to put it into practice to solve another challenge.