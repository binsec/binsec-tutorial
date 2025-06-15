import raw from 'binary-loader!@site/static/bin/constanttime_1';
import raw2 from 'binary-loader!@site/static/bin/constanttime_2';

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
export const image2 = new Promise((resolve) => resolve(init2()));
