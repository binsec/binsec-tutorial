---
sidebar_position: 1
sidebar_label: Constant time
title: Constant time
description: "Analyse resistance to timing attacks."
slug : ./constant-time
---

import { Sample } from "@site/src/components/Binsec/Sample";
import CodeBlock from "@theme/CodeBlock";

import { image, image2 } from "@site/src/components/Samples/ConstantTime"
import Snippet1 from "@site/src/components/Samples/ConstantTime/Snippet1"
import { Mapping, From, To, Link } from '@site/src/components/Mapping';

import useBaseUrl from '@docusaurus/useBaseUrl';
import Icon from "@site/src/components/Icon";

# Checking Constant Time Property

<blockquote> By carefully measuring the amount of time required to perform private key operations, attackers may be able to find fixed Diffie-Hellman exponents, factor RSA keys, and break other cryptosystems.</blockquote>

<blockquote className="citation"> Timing Attacks on Implementations of Diffie-Hellman, RSA, DSS, and Other Systems, 1996, Paul Kocher</blockquote>

***Constant-time programming*** is one of the ways to ensure that a given implementation does not leak information over any sensitive data (e.g. private cryptographic keys) through a *timing* side channel.

Indeed, a run may take more or less time depending on the path taken (control flow leak), and on almost any modern processor, timing may also vary depending on its cache behavior (memory access leak).

To detect this behaviour, **BINSEC** verifies that no sensitive data (tagged as **secret**) affects the control flow decision: whatever the *secrets*, two runs with the same other inputs (tagged as **public**) will follow the same path. At the same time, it also verifies that these two runs will always access the same addresses in memory.

We will illustrate this with the function `memcmp`.

## The `memcmp` function

We will use the usual definition of the function.

```c
int memcmp(const void *s1, const void *s2, size_t n);
```

The `memcmp` function compares the first `n` bytes of the memory areas `s1` and `s2`. It returns an integer less than, equal to, or greater than zero if the the first `n` bytes of `s1` is found, respectively, to be less than, to match, or be greater than the first `n` bytes of `s2`.

## Test harness

In order to ease the verification process, we will rely on the following test harness.

```c title="test_harness.c"
#include <stdlib.h>

int memcmp(const void *s1, const void *s2, size_t n); /* function under analysis */

#define SIZE (1 << 4) /* 16B */
char s1[SIZE];   /* secret buffer */
char s2[SIZE];   /* public buffer */
size_t n = SIZE; /* public variable */

int main(int argc, char *argv[])
{
	int res = memcmp(s1, s2, n);
	
	/* ensure the result is in [-1..1] */
	res |= res >> 1;
	res |= res >> 2;
	res |= res >> 4;
	res |= res >> 8;
	res |= res >> 16;
	res = (res & 1) | (res >> 31);
	
	exit(res); /* identify halting point and prevent compiler optimizations */
}
```
It just wraps the call to `memcmp`, performs a constant-time reduction of its result before calling the `exit` function.

:::note
It is not strictly necessary but using the result of `memcmp` as an argument to `exit` helps preventing the compiler from optimizing the call away.
:::

This test harness will allow us to configure more easily the relational engine of **BINSEC**. Indeed, it gives us a well known starting point (`main`), a named ending point (`exit`) and several global symbols to mark as **public** or **secret** (`s1`, `s2` and `n`).

This allow to setup a minimal script as follows.

<CodeBlock title="constant_time.ini" language="dba">{`
starting from <main>

with concrete stack pointer
secret global s1
public global s2, n

assume 0 < n < 10

halt at <exit>
explore all
`}
</CodeBlock>


The analysis will start from `main`, trying to explore all paths that reach `exit`. We mark the variable `s1` as `secret` while `s2` and `n` are tagged `public`.

:::tip
We can further add constraints on these symbolic variables. For instance, here we limit the number of rounds (`size`) in the range`[1..9]`.
:::

:::info
We also concretize the stack pointer. Otherwise, the analysis would likely be stuck reasoning on non meaningful memory aliasing.
:::

---
## First (non constant-time) candidate

Here is a common way to implement the function `memcmp`.

```c title="test_memcmp_1.c"
#include <stddef.h>

int memcmp(const void *s1, const void *s2, size_t n)
{
    const char *p1 = (const char *)s1, *p2 = (const char *)s2;
    for (size_t i = 0; i < n; i += 1) {
        if (p1[i] < p2[i]) return -1;
        else if (p1[i] > p2[i]) return 1;
    }
    return 0;
}
```

Let us run **BINSEC** on its compiled version <a href={useBaseUrl('/bin/constanttime_1')} download><Icon icon="fa-solid fa-file-arrow-down" /></a>.

<Sample
    Model={Snippet1}
    height="10em"
    width='100%'
    value=''
    filename= 'constanttime_1'
    binary={image}
    checkct
    >
    Download <a href={useBaseUrl('/snippet/constant_time.ini')} download><Icon icon="fa-solid fa-file-arrow-down" /></a> or copy the content of the script in the file `constant_time.ini`, then run the following commands.
    - Compile our test  or get it (<a href={useBaseUrl('/bin/constanttime_1')} download><Icon icon="fa-solid fa-file-arrow-down" /></a>):
    ```bash
    gcc -g -static test_harness.c test_memcmp_1.c -o constant_time_1 
    ```
    - Run BINSEC :

    ```bash
    binsec -sse -checkct -sse-script constant_time.ini constanttime_1
    ```

    ```plain title="Output"
[checkct:result] Instruction 0x401933 has control flow leak (0.271s)
[checkct:result] Instruction 0x40195a has control flow leak (0.329s)
```

<details>
  <summary>... details</summary>
```plain
[sse:info] Empty path worklist: halting ...
[sse:info] SMT queries
             Preprocessing simplifications
               total          56
               sat            56
               unsat          0
               time           0.00
             
             Satisfiability queries
               total          29
               sat            27
               unsat          2
               unknown        0
               time           0.43
               average        0.01
             
           Exploration
             total paths                      27
             completed/cut paths              27
             pending paths                    0
             discontinued paths               0
             failed assertions                0
             branching points                 28
             max path depth                   273
             visited instructions (unrolled)  1045
             visited instructions (static)    83
```
</details>
```plain           
[checkct:result] Program status is : insecure (0.761)
[checkct:info] 27 visited paths covering 83 instructions
[checkct:info] 37 / 39 control flow checks pass
[checkct:info] 781 / 781 memory access checks pass
```
</Sample>


So now, we know that this candidate for `memcmp` is **not** constant time.

### Get a detailled report

We can go further by asking **BINSEC** detailed models of the leaks found using the option `-checkct-stats-file`.

<Sample
    Model={Snippet1}
    height="10em"
    width='100%'
    value=''
    filename= 'constanttime_1'
    binary={image}
    noinfo
    checkct={{report:true}}
    >
    Pursue with the precedent script `constant_time.ini` or download it again here <a href={useBaseUrl('/snippet/constant_time.ini')} download><Icon icon="fa-solid fa-file-arrow-down" /></a>, then run the following commands.
   
    ```bash
    binsec -sse -checkct -sse-script constant_time.ini -checkct-stats-file candidate_1.toml constanttime_1 
    ```

    ```toml title="candidate_1.toml"
["Insecurity models".0x401933.public]
n = ["0x0000000000000009"]
rbp = ["0x00000000253bd717"]
rdi = ["0x0000000018b9dc41"]
rsi = ["0x000000000f221c28"]
s2 = ["0x0000000000000000000000003f17e152"]
["Insecurity models".0x401933.secret1]
s1 = ["0x0000000000000000000000000266bf66"]
["Insecurity models".0x401933.secret2]
s1 = ["0x8b0743af2001212034a2a4f39af06b9a"]
["Insecurity models".0x40195a.public]
n = ["0x0000000000000001"]
rbp = ["0x00000000253bd717"]
rdi = ["0x0000000018b9dc41"]
rsi = ["0x000000000f221c28"]
s2 = ["0x00000000000000000000000000000000"]
["Insecurity models".0x40195a.secret1]
s1 = ["0x00000000000000000000000000000000"]
["Insecurity models".0x40195a.secret2]
s1 = ["0x00000000000000000000000000000001"]
["Instructions status"]
insecure = ["0x401933", "0x40195a"]
unknown = []
  ```
</Sample>


The report contains entries for each detected leak. It also gives a possible valuation of the public and secret values declared in the script. Here **BINSEC** found solutions for the value `s1` resolving the paths explored.

We have here a translation from our report (*1st leak*) to a C initialization.
<Mapping>
  <From language="toml">
{`["CT report"."Insecurity models".0x401933.public]
  n = ["0x00000009"]
  rbp = ["0x000000001bdd779f"]
  rdi = ["0x00000000370cb0b9"]
  rsi = ["0x000000000e3ba79b"]
  s2 = ["0x0000000000000000000000003427bece"]
  ["Insecurity models".0x401933.secret1]
  s1 = ["0x0000000000000000000000001a802092"]
  ["Insecurity models".0x401933.secret2]
  s1 = ["0xffffffffffffffffffffffffffffffff"]`}
  </From>

  <To language="c">
{`size_t n = 0x00000009;
/* public 0x0000000000000000000000003427bece */
char s2[SIZE] = {
  0xce, 0xbe, 0x27, 0x34, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
};
/* secret 1 0x0000000000000000000000001a802092 */
char s1[SIZE] = {
  0x92, 0x20, 0x80, 0x1a, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
};
/* secret 2 0xffffffffffffffffffffffffffffffff */
char s1[SIZE] = {
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff
};`}
  </To>

  <Link name="n" />
  <Link name="s1" />
  <Link name="s2" />

  <Link name="0x0000000000000000000000003427bece" />
  <Link name="0x0000000000000000000000001a802092" />
  <Link name="0xffffffffffffffffffffffffffffffff" />
  <Link name="0x00000009" />
</Mapping>

:::note

In C, the content of the buffer is written in `little endian` whereas the bitvector given by the model is written in `big endian`. Bytes have to be swapped between the two representations. It is not the case for the variable `n` (integer) that is written in `big endian` both in C and in the model.

:::

:::info

Since we compiled the binary with debug information (`-g`), we can further try to link back the leak to the C code. For instance, the following command shows the mapping between lines in C and program addresses`.

<details>

<summary>Let us find out the bad addresses in our implementation</summary>

```console
$ objdump --dwarf=decodedline candidate_1
```
Here, we can find that the address of the leak at `0x401933` is between `0x401931` and `0x401935` and thus matches the line `7` in `candidate_1.c`.

```
File name                            Line number    Starting address    View    Stmt
...
candidate_1.c                                  7            0x401923               x
candidate_1.c                                  7            0x401931               x
candidate_1.c                                  7            0x401935               x
candidate_1.c                                  7            0x40193a
candidate_1.c                                  8            0x40193c               x
```

</details>

:::

---
## Second (constant-time) candidate

Here is another way to implement the function `memcmp`, designed for a *constant-time* compliance.

```c title="test_memcmp_2.c"
#include <stddef.h>

int memcmp(const void *s1, const void *s2, size_t n)
{
    const char *p1 = (const char *)s1, *p2 = (const char *)s2;
	int res = 0;
    for (size_t i = 0; i < n; i += 1) {
		res = res | (~(res >> 31) & ((res - 1) >> 31) & (p1[i] - p2[i]));
    }
    return res;
}
```

<Sample
    Model={Snippet1}
    height="10em"
    width='100%'
    value=''
    filename= 'constanttime_2'
    binary={image2}
    checkct
    noinfo
    >
    Download <a href={useBaseUrl('/snippet/constant_time.ini')} download><Icon icon="fa-solid fa-file-arrow-down" /></a> or copy the content of the script in the file `constant_time.ini`, then run the following commands.
    - Compile our new test (<a href={useBaseUrl('/bin/constanttime_2.ini')} download><Icon icon="fa-solid fa-file-arrow-down" /></a>):
    ```bash
    gcc -g -static test_harness.c test_memcmp_2.c -o constant_time_2 
    ```
    - Run BINSEC :

    ```bash
    binsec -sse -checkct -sse-script constant_time.ini constanttime_2
    ```

    ```plain title="Output"
[checkct:result] Program status is : secure (1.230)
[checkct:info] 9 visited paths covering 83 instructions
[checkct:info] 19 / 19 control flow checks pass
[checkct:info] 359 / 359 memory access checks pass
```
</Sample>


:::warning

Remember that **BINSEC** only performs bounded verification. The result is valid given the initial assumption, for instance that the size `n` is lower than 10.

:::

## Threat to completeness

**BINSEC** has 3 outputs possibles:
- the program is `insecure` as long as one leak has been detected along any visited path;
- the program is `secure` if no leak has been detected and that **all** paths have been explored;
- the program has an `unknown` status if no leak has been detected so far but at least one check or the whole exploration has been interrupted prematurely.

<figure className="small-figure">
  <img src={require('./img/ct_flow.png').default} alt="Flow grapher" />
  <figcaption>Flow graph of BINSEC analysis</figcaption>
</figure>

:::tip

As an *under-approximated technique*, it is thus easier to prove a program violates the *constant-time* coding discipline than to prove that it is compliant.

:::