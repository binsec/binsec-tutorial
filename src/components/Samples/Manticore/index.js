import raw_x86_32 from 'binary-loader!@site/static/bin/manticore-x86_32';
import raw_x86_64 from 'binary-loader!@site/static/bin/manticore-x86_64';
import raw_arm from 'binary-loader!@site/static/bin/manticore-arm';
import raw_aarch64 from 'binary-loader!@site/static/bin/manticore-aarch64';
import raw_riscv64 from 'binary-loader!@site/static/bin/manticore-riscv64';

import token_x86_32 from './manticore-x86_32.json';
import token_x86_64 from './manticore-x86_64.json';
import token_arm from './manticore-arm.json';
import token_aarch64 from './manticore-aarch64.json';
import token_riscv64 from './manticore-riscv64.json';

import disassembly_x86_32 from './disassembly-x86_32.json';
import disassembly_x86_64 from './disassembly-x86_64.json';
import disassembly_arm from './disassembly-arm.json';
import disassembly_aarch64 from './disassembly-aarch64.json';
import disassembly_riscv64 from './disassembly-riscv64.json';

import text_x86_32 from '!!raw-loader!./headers_x86_32.txt';
import text_x86_64 from '!!raw-loader!./headers_x86_64.txt';
import text_arm from '!!raw-loader!./headers_arm.txt';
import text_aarch64 from '!!raw-loader!./headers_aarch64.txt';
import text_riscv64 from '!!raw-loader!./headers_riscv64.txt';

const init = (raw) => {
    const view = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i += 1)
        view[i] = raw.charCodeAt(i);
    return view.buffer;
}

export const manticore_x86_32 = new Promise((resolve) => resolve(init(raw_x86_32)));
export const manticore_x86_64 = new Promise((resolve) => resolve(init(raw_x86_64)));
export const manticore_arm = new Promise((resolve) => resolve(init(raw_arm)));
export const manticore_aarch64 = new Promise((resolve) => resolve(init(raw_aarch64)));
export const manticore_riscv64 = new Promise((resolve) => resolve(init(raw_riscv64)));



export const hexdump_x86_32 = token_x86_32;
export const hexdump_x86_64 = token_x86_64;
export const hexdump_arm = token_arm;
export const hexdump_aarch64 = token_aarch64;
export const hexdump_riscv64 = token_riscv64;

export const objdump_x86_32 = disassembly_x86_32;
export const objdump_x86_64 = disassembly_x86_64;
export const objdump_arm = disassembly_arm;
export const objdump_aarch64 = disassembly_aarch64;
export const objdump_riscv64 = disassembly_riscv64;

export const headers_x86_32 = text_x86_32;
export const headers_x86_64 = text_x86_64;
export const headers_arm = text_arm;
export const headers_aarch64 = text_aarch64;
export const headers_riscv64 = text_riscv64;