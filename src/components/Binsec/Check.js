import { useRef, useState } from "react";

import Admonition from '@theme/Admonition';

import Icon from "@site/src/components/Icon";
import { Logo, Chrome, Edge, Firefox, Safari, InFirefox, InKnown, InUnknown } from '@site/src/components/Browser';

export function Check() {

    const [running, setRunning] = useState(false);
    const [output, setOutput] = useState(<></>);

    const sendRequest = () => {
        if (self['main-worker-ready']) {
            self['main-worker-ready'] = false;
            self['main-worker'].onmessage = (e) => {
                switch (e.data[0]) {
                    case 'version':
                        if (e.data[1] === '0.11.0-wasm') {
                            setOutput(<div>
                                <Admonition type="tip" title="You are all set" />
                                <Admonition type="note">
                                    <b>BINSEC</b> compilation to Web Assembly is still experimental. Only a subset of the platform features has been ported and the performance scales worst than native compilation.
                                </Admonition>
                            </div>);
                            break;
                        }
                    case 'status':
                        if (e.data[1] === 'undefined') {
                            setOutput(<Admonition type="warning" title="Not yet">
                            <b>BINSEC</b> modules are not yet ready. If you just reloaded the page, try again in a few seconds.<br/>Otherwise, something may have gone wrong. <b>BINSEC</b> compilation to Web Assembly is still experimental, consider using the native version or maybe try with  another browser (<Chrome/> Chrome, <Edge/> Edge, <Firefox/> Firefox or <Safari/> Safari). 
                        </Admonition>);
                            break;
                        }
                    default:
                        setOutput(<Admonition type="danger" title="An error occured">
                            <b>BINSEC</b> compilation to Web Assembly is still experimental and has never been tested on your browser. Prefer using one of the following: <Chrome/> Chrome, <Edge/> Edge, <Firefox/> Firefox or <Safari/> Safari.
                        </Admonition>)
                }
                self['main-worker-ready'] = true;
                setRunning(false);
            };
            setRunning(true);
            self['main-worker'].postMessage(['version']);
        } else {
            setOutput(<Admonition type="warning">
                It seems an instance of BINSEC has already been started.
                Please, refresh the page and try again.
            </Admonition>)
        }
    }

    return (
        <div>
            <button
                className="button button--primary button--block"
                onClick={sendRequest}
                disabled={running}
            >
                Click here to check if BINSEC is readily available on your browser.
            </button>
            {output}
        </div>
    )
}


