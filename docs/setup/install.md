---
sidebar_position: 2
sidebar_label: Install BINSEC
pagination_prev: setup/setup
title: Install BINSEC
description: "Install BINSEC from sources to get the full power of the platform."
---

import { Check } from '@site/src/components/Icon';

# Install BINSEC from sources

**BINSEC** is open source, it can be downloaded on [GitHub](https://github.com/binsec/binsec).

It can be easily installed with the help of the `Opam` package manager.

```bash
git clone https://github.com/binsec/binsec.git
cd binsec
opam switch create . -n
opam install curses bitwuzla unisim_archisec binsec
```

More details can be found [here](https://github.com/binsec/binsec/blob/master/INSTALL.md).