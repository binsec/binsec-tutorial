import { TarReader } from '@gera2ld/tarjs';

import coreTarball from 'binary-loader!@site/static/bin/core.snapshot.tar.gz';
import sysrootTarball from 'binary-loader!@site/static/bin/sysroot.tar.gz';
import text from '!!raw-loader!./headers.txt';
import token from './token.json';
import disasm from './disassembly.json';

const initCore = async () => {
    const view = new Uint8Array(coreTarball.length);
    for (let i = 0; i < coreTarball.length; i += 1)
        view[i] = coreTarball.charCodeAt(i);
    const blob = await new Response(new Blob([view.buffer]).stream()
        .pipeThrough(new DecompressionStream("gzip"))).blob();
    const tarball = await TarReader.load(blob);
    return await tarball.getFileBlob('core.snapshot', 'application/octet-stream').arrayBuffer();
}

export const core = new Promise((resolve) => resolve(initCore()));

const initSysroot = async () => {
    const view = new Uint8Array(sysrootTarball.length);
    for (let i = 0; i < sysrootTarball.length; i += 1)
        view[i] = sysrootTarball.charCodeAt(i);
    const blob = await new Response(new Blob([view.buffer]).stream()
        .pipeThrough(new DecompressionStream("gzip"))).blob();
    const tarball = await TarReader.load(blob);
    const files = []
    for (const file of tarball.fileInfos) {
        const buffer = await tarball.getFileBlob(file.name, 'application/octet-stream').arrayBuffer();
        files.push({ filename: `/${file.name}`, buffer: buffer })
    }
    return files;
}

export const sysroot = new Promise((resolve) => resolve(initSysroot()));

export const headers = text;

export const hexdump = token;

export const objdump = disasm