import { TarReader } from '@gera2ld/tarjs';

import core0Tarball from 'binary-loader!@site/static/bin/secret-erasure_MEMSET_O0_gcc_10.2.0.snapshot.tar.gz';
import sysroot0Tarball from 'binary-loader!@site/static/bin/secret-erasure_MEMSET_O0_gcc_10.2.0.sysroot.tar.gz';

import core2Tarball from 'binary-loader!@site/static/bin/secret-erasure_MEMSET_O2_gcc_10.2.0.snapshot.tar.gz';
import sysroot2Tarball from 'binary-loader!@site/static/bin/secret-erasure_MEMSET_O2_gcc_10.2.0.sysroot.tar.gz';


const init0Core = async () => {
    const view = new Uint8Array(core0Tarball.length);
    for (let i = 0; i < core0Tarball.length; i += 1)
        view[i] = core0Tarball.charCodeAt(i);
    const blob = await new Response(new Blob([view.buffer]).stream()
        .pipeThrough(new DecompressionStream("gzip"))).blob();
    const tarball = await TarReader.load(blob);
    return await tarball.getFileBlob('secret-erasure_MEMSET_O0_gcc_10.2.0.snapshot', 'application/octet-stream').arrayBuffer();
}

export const core0 = new Promise((resolve) => resolve(init0Core()));

const init0Sysroot = async () => {
    const view = new Uint8Array(sysroot0Tarball.length);
    for (let i = 0; i < sysroot0Tarball.length; i += 1)
        view[i] = sysroot0Tarball.charCodeAt(i);
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

export const sysroot0 = new Promise((resolve) => resolve(init0Sysroot()));

const init2Core = async () => {
    const view = new Uint8Array(core2Tarball.length);
    for (let i = 0; i < core2Tarball.length; i += 1)
        view[i] = core2Tarball.charCodeAt(i);
    const blob = await new Response(new Blob([view.buffer]).stream()
        .pipeThrough(new DecompressionStream("gzip"))).blob();
    const tarball = await TarReader.load(blob);
    return await tarball.getFileBlob('secret-erasure_MEMSET_O2_gcc_10.2.0.snapshot', 'application/octet-stream').arrayBuffer();
}

export const core2 = new Promise((resolve) => resolve(init2Core()));

const init2Sysroot = async () => {
    const view = new Uint8Array(sysroot2Tarball.length);
    for (let i = 0; i < sysroot2Tarball.length; i += 1)
        view[i] = sysroot2Tarball.charCodeAt(i);
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

export const sysroot2 = new Promise((resolve) => resolve(init2Sysroot()));




