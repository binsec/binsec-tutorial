import raw from 'binary-loader!@site/static/bin/fibonacci';
import text from '!!raw-loader!./fibonacci.dba';
import token from './fibonacci.json';
import disasm from './disassembly.json';

const init = () => {
    const view = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i += 1)
        view[i] = raw.charCodeAt(i);
    return view.buffer;
}

export const fibonacci = new Promise((resolve) => resolve(init()));

export const disassembly = text;

export const hexdump = token;

export const objdump = disasm