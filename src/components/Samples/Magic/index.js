import raw from 'binary-loader!@site/static/bin/magic';
import text from '!!raw-loader!./headers.txt';
import token from './token.json';
import disasm from './disassembly.json';

const init = () => {
    const view = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i += 1)
        view[i] = raw.charCodeAt(i);
    return view.buffer;
}

export const image = new Promise((resolve) => resolve(init()));

export const headers = text;

export const hexdump = token;

export const objdump = disasm