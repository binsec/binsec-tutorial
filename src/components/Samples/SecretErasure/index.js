import raw from 'binary-loader!@site/static/bin/secret-erasure_MEMORY_BARRIER_MFENCE_O3_gcc_8.3.0';
import raw2 from 'binary-loader!@site/static/bin/secret-erasure.snapshot';


const init = () => {
    const view = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i += 1)
        view[i] = raw.charCodeAt(i);
    return view.buffer;
}

const init2 = () => {
    const view = new Uint8Array(raw2.length);
    for (let i = 0; i < raw2.length; i += 1)
        view[i] = raw2.charCodeAt(i);
    return view.buffer;
}

export const image = new Promise((resolve) => resolve(init()));
export const snapshot = new Promise((resolve) => resolve(init2()));



