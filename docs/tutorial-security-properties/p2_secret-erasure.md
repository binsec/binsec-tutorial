---
sidebar_position: 2

sidebar_label: Secret erasure
title: Secret erasure
description: "Check if memory is erased properly."
slug : ./secret-erasure
pagination_next: null
---

<!-- Load of elements for compiling -->
import { Sample } from "@site/src/components/Binsec/Sample";
import { Editor } from "@site/src/components/DBA/Editor";
import { core0, sysroot0, core2, sysroot2 } from "@site/src/components/Samples/SecretErasure"
import Snippet1 from "@site/src/components/Samples/SecretErasure/Snippet1"

import Icon from "@site/src/components/Icon";
import useBaseUrl from '@docusaurus/useBaseUrl';

# Secret Erasure


In this chapter, we will exercise the **REL**ational **S**ymbolic **E**xecution engine of **BINSEC** to check that no secret data remains in memory after returning from a given function, also known as the **secret-erasure** property.

Indeed, a critical section should not keep the secret data in memory longer than necessary to prevent an attacker from exploiting a memory disclosure vulnerability and accessing the stored secret. Such code can thus use a so-called *scrubbing function* to fill the secret storage with public data (e.g. all zeros).
Unfortunately, the compiler may consider such writes as dead assignments and optimize them out, leaving the executable code unprotected.

<center>
  ![secret-erasure](img/secret-erasure.png "Secret Erasure illustration")
</center>

The relational analysis plugin `checkct` proposes a **secret-erasure** check inspired by the [Daniel et al. paper](https://binsec.github.io/assets/publications/papers/2022-tops.pdf) to ensure that memory does not contain any secret past a given point (*a function return in this tutorial*).

We will use a binary challenges from the [original **RELSE** benchmark repository](https://github.com/binsec/rel_bench).

## Test harness

The benchmark challenges have been compiled with the following test harness.

```c
#define __STDC_WANT_LIB_EXT1__ 1
#include <string.h>
#include <stdlib.h>
#include <stddef.h>
#include <stdlib.h>
#include <assert.h>
#include <stdio.h>
#include "safeclib/include/safe_mem_lib.h"
#include "../__libsym__/sym.h"

/* --------------- SCRUBBING FUNCTIONS ------------------ */
/* Implement your own using the following declaration */

/* [ ... ] */

/* Scrubbing function using memset */
#if MEMSET
void scrub(char *buf, size_t size) {
  memset(buf, 0, size);
}
#endif

/* [ ... ] */

/* --------------- END OF SCRUBBING FUNCTIONS ------------------ */

#define PASSWORD_SIZE 32

/* Volatile so everything is not optimized away */
volatile char good = 0;

void get_secret(char *bufer) {
  // This function is stubbed in SE and puts secret data into bufer
  HIGH_INPUT(PASSWORD_SIZE)(bufer);
}

/* Function that read and check the password */
void __attribute__ ((noinline)) password_checker(char *attempt) {
  char password[PASSWORD_SIZE];

  /* Put secret data in [password] */
  get_secret(password);

  /* Compares attempt to the secret password */
  good = 1;
  for (unsigned int i = 0; i < PASSWORD_SIZE; ++i) {
    good = good & (password[i] == attempt[i]);
  }
  
  // Scrubs secret from memory
  scrub(password, PASSWORD_SIZE);
}


int main () {
  char attempt[PASSWORD_SIZE];
  LOW_INPUT(PASSWORD_SIZE)(attempt);
  
  password_checker(attempt);

  /* Ideally we should declassify good */
  scrub((char *) &good, 1);
  return 0;
}
```

## First (secure) candidate

We will start with the basic `memset` variant compiled without optimization (`O0`) <a href={useBaseUrl('/bin/secret-erasure_MEMSET_O0_gcc_10.2.0')} download><Icon icon="fa-solid fa-file-arrow-down" /></a>.

To simplify the initialization, we will start from a *core dump*, as seen in the [Core dump chapter](../tutorial-basics/p6_advanced-initialization.md).

<Sample
    Model={Snippet1}
    height="10em"
    width='100%'
    value=''
    filename= 'constanttime_1'
    binary={core0}
    sysroot={sysroot0}
    checkct
    noinfo
    >
    Download <a href={useBaseUrl('/snippet/secret_erasure.ini')} download><Icon icon="fa-solid fa-file-arrow-down" /></a> or copy the content of the script in the file `secret_erasure.ini`, then run the following command.

    Then download the snapshot <a href={useBaseUrl('/bin/secret-erasure_MEMSET_O0_gcc_10.2.0.snapshot.tar.gz')} download><Icon icon="fa-solid fa-file-arrow-down" /></a> and the sysroot <a href={useBaseUrl('/bin/secret-erasure_MEMSET_O0_gcc_10.2.0.sysroot.tar.gz')} download><Icon icon="fa-solid fa-file-arrow-down" /></a> archives 

    ```bash
    tar xzf secret-erasure_MEMSET_O0_gcc_10.2.0.snapshot.tar.gz
    tar xzf secret-erasure_MEMSET_O0_gcc_10.2.0.sysroot.tar.gz --one-top-level=sysroot
    binsec -sse -checkct -sse-script secret_erasure.ini secret-erasure_MEMSET_O0_gcc_10.2.0.snapshot -sse-sysroot sysroot
    ```

    ```plain title="Output"
[sse:info] Empty path worklist: halting ...
[sse:info] SMT queries
             Preprocessing simplifications
               total          14
               sat            14
               unsat          0
               time           0.00
             
             Satisfiability queries
               total          1
               sat            0
               unsat          1
               unknown        0
               time           0.27
               average        0.27
             
           Exploration
             total paths                      1
             completed/cut paths              1
             pending paths                    0
             discontinued paths               0
             failed assertions                0
             branching points                 37
             max path depth                   687
             visited instructions (unrolled)  687
             visited instructions (static)    138
             
           
[checkct:result] Program status is : secure (0.314)
[checkct:info] 1 visited path covering 138 instructions
[checkct:info] 51 / 51 control flow checks pass
[checkct:info] 637 / 637 memory access checks pass
[checkct:info] 1 / 1 secret erasure checks pass
```
</Sample>

Here, the only thing new is the `check secret erasure over <main>` command to instruct **BINSEC** to check the property at the function `<main>` return.

As expected, the function `memset` was called and the secret was erased from the memory.

:::note

We replaced the library function `high_input_32` and `low_input_32` to produce, respectively a secret or a public value of 32 bytes.

:::

## Second (insecure) candidate

Now, let us put it to the test with an optimizing compiler: we will try `memset` variant compiled with some optimization (`O2`) <a href={useBaseUrl('/bin/secret-erasure_MEMSET_O2_gcc_10.2.0')} download><Icon icon="fa-solid fa-file-arrow-down" /></a>.

<Sample
    Model={Snippet1}
    height="10em"
    width='100%'
    value=''
    filename= 'constanttime_1'
    binary={core2}
    sysroot={sysroot2}
    checkct
    noinfo
    >
    Download <a href={useBaseUrl('/snippet/secret_erasure.ini')} download><Icon icon="fa-solid fa-file-arrow-down" /></a> or copy the content of the script in the file `secret_erasure.ini`, then run the following command.

    Then download the snapshot <a href={useBaseUrl('/bin/secret-erasure_MEMSET_O2_gcc_10.2.0.snapshot.tar.gz')} download><Icon icon="fa-solid fa-file-arrow-down" /></a> and the sysroot <a href={useBaseUrl('/bin/secret-erasure_MEMSET_O2_gcc_10.2.0.sysroot.tar.gz')} download><Icon icon="fa-solid fa-file-arrow-down" /></a> archives 

    ```bash
    tar xzf secret-erasure_MEMSET_O2_gcc_10.2.0.snapshot.tar.gz
    tar xzf secret-erasure_MEMSET_O2_gcc_10.2.0.sysroot.tar.gz --one-top-level=sysroot
    binsec -sse -checkct -sse-script secret_erasure.ini secret-erasure_MEMSET_O2_gcc_10.2.0.snapshot -sse-sysroot sysroot
    ```

    ```plain title="Output"
[checkct:result] Secret-erasure check failure @ 0x8049680 (0.044s)
                 @ :
                    0xffa2f9d2 : 0x00
                  
                 public :
                    low_input_32 : 0x0000000000000000000000000000000000000000000000000000000000000000
                  
                 secret1 :
                    high_input_32 : 0x0000000000000000000000000000000000000000000000000000000000ff0000
                  
                 secret2 :
                    high_input_32 : 0x00000000000000000000000000000000000000000000000000000000007f7f7f
                  
[sse:info] Empty path worklist: halting ...
[sse:info] SMT queries
             Preprocessing simplifications
               total          3
               sat            3
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
             total paths                      1
             completed/cut paths              1
             pending paths                    0
             discontinued paths               0
             failed assertions                0
             branching points                 32
             max path depth                   324
             visited instructions (unrolled)  324
             visited instructions (static)    48
             
           
[checkct:result] Program status is : insecure (0.044)
[checkct:info] 1 visited path covering 48 instructions
[checkct:info] 35 / 35 control flow checks pass
[checkct:info] 284 / 284 memory access checks pass
[checkct:info] 0 / 1 secret erasure checks pass
```
</Sample>
