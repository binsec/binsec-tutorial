import { useState } from "react";

import CodeBlock from "@theme/CodeBlock";
import Admonition from "@theme/Admonition";
import useBaseUrl from '@docusaurus/useBaseUrl';

import Icon from '@site/src/components/Icon'
import { Sample } from "@site/src/components/Binsec/Sample";

import Hexdump from "@site/src/components/Hexdump";

import {
    manticore_x86_32, hexdump_x86_32, objdump_x86_32, headers_x86_32,
    manticore_x86_64, hexdump_x86_64, objdump_x86_64, headers_x86_64,
    manticore_arm, hexdump_arm, objdump_arm, headers_arm,
    manticore_aarch64, hexdump_aarch64, objdump_aarch64, headers_aarch64,
    manticore_riscv64, hexdump_riscv64, objdump_riscv64, headers_riscv64,
} from "@site/src/components/Samples/Manticore"

import Tabs from '@site/src/theme/Tabs';
import TabItem from '@theme/TabItem';

const images = {
    x86_32: manticore_x86_32,
    x86_64: manticore_x86_64,
    arm: manticore_arm,
    aarch64: manticore_aarch64,
    riscv64: manticore_riscv64,
}

const script = `load sections .text, .rodata from file
starting from <main>
with concrete stack pointer

replace <fgets> (s, size, _) by
  size := size - 1  
  @[s + size] := 0
  while size > 0 do
    size := size - 1
    @[s + size] := stdin[size]
  end
  return s
end

replace <puts> (s) by
  print c string @[s]
  reach such that @[s, 10] = 'Success!\\n'z then print c string stdin  
  return
end

halt at <exit>`

function Block() {
    return <CodeBlock language="dba">
        {script}
    </CodeBlock>
}

export function Portfolio() {
    const [arch, setArch] = useState("x86_32")

    const handleTabChange = (value) => {
        setArch(value);
    }

    return (
        <div>
            <Tabs onChange={handleTabChange} lazy>
                <TabItem value="x86_32" label="x86-32" default>
                    <h3>Manticore <a href={useBaseUrl('/bin/manticore-x86_32')} download><Icon icon="fa-solid fa-file-arrow-down" /></a></h3>
                    <Hexdump source={hexdump_x86_32} headers={headers_x86_32} disassembly={objdump_x86_32} />
                </TabItem>
                <TabItem value="x86_64" label="x86-64">
                    <h3>Manticore <a href={useBaseUrl('/bin/manticore-x86_64')} download><Icon icon="fa-solid fa-file-arrow-down" /></a></h3>
                    <Hexdump source={hexdump_x86_64} headers={headers_x86_64} disassembly={objdump_x86_64} />
                </TabItem>
                <TabItem value="arm" label="ARMv7">
                    <h3>Manticore <a href={useBaseUrl('/bin/manticore-arm')} download><Icon icon="fa-solid fa-file-arrow-down" /></a></h3>
                    <Hexdump source={hexdump_arm} headers={headers_arm} disassembly={objdump_arm} />
                </TabItem>
                <TabItem value="aarch64" label="ARMv8">
                    <h3>Manticore <a href={useBaseUrl('/bin/manticore-aarch64')} download><Icon icon="fa-solid fa-file-arrow-down" /></a></h3>
                    <Hexdump source={hexdump_aarch64} headers={headers_aarch64} disassembly={objdump_aarch64} />
                </TabItem>
                <TabItem value="riscv64" label="RISCV">
                    <h3>Manticore <a href={useBaseUrl('/bin/manticore-riscv64')} download><Icon icon="fa-solid fa-file-arrow-down" /></a></h3>
                    <Hexdump source={hexdump_riscv64} headers={headers_riscv64} disassembly={objdump_riscv64} />
                </TabItem>
            </Tabs>
            <Admonition type="tip">
                <b>BINSEC</b> is able to solves them all with a unique script.
            </Admonition>
            <Sample
                Model={Block}
                height="10em"
                width='100%'
                value={script}
                filename={'manticore-' + arch}
                binary={images[arch]}
                noinfo />
        </div>)
}

