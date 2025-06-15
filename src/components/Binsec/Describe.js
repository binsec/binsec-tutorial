import { useState } from "react";

import Admonition from '@theme/Admonition';

import Icon from "@site/src/components/Icon";
import { Chrome, Edge, Firefox, Safari } from '@site/src/components/Browser';

export function Describe({ binary }) {

    const [running, setRunning] = useState(false);
    const [output, setOutput] = useState(<pre></pre>);

    const sendRequest = () => {
        if (self['main-worker-ready']) {
            self['main-worker-ready'] = false;
            self['main-worker'].onmessage = (e) => {
                switch (e.data[0]) {
                    case 'describe':
                        setOutput(<pre>
                            <code>{e.data[1]}</code>
                        </pre>)
                        break;
                    case 'status':
                        if (e.data[1] == 'undefined') {
                            setOutput(<Admonition type="warning" title="Not yet">
                                <b>BINSEC</b> modules are not yet ready. If you just reloaded the page, try again in a few seconds.<br />Otherwise, something may have gone wrong. <b>BINSEC</b> compilation to Web Assembly is still experimental, consider using the native version or maybe try with  another browser (<Chrome /> Chrome, <Edge /> Edge, <Firefox /> Firefox or <Safari /> Safari).
                            </Admonition>);
                            break;
                        }
                    default:
                        setOutput(<pre>
                            <span style={{ color: 'var(--ifm-color-danger)' }}>Unexpected message from worker.<br /></span>
                        </pre>)
                }
                self['main-worker-ready'] = true;
                setRunning(false);
            };
            setRunning(true);
            binary.then((buffer) => {
                self['main-worker'].postMessage(['describe', buffer]);
            })
        } else {
            setOutput(<pre>
                <span style={{ color: 'var(--ifm-color-danger)' }}>An instance of BINSEC is already running.<br /></span>
                <span style={{ color: 'var(--ifm-color-danger)' }}>Refresh the page if you do not want to wait for the result.</span>
            </pre>)
        }
    }

    return (
        <div>
            <button
                className="button button--primary"
                onClick={sendRequest}
                disabled={running}
            >
                {running ? <Icon icon="fa-spinner" spin pulse /> : <Icon icon="fa-solid fa-play" />} Run
            </button>
            {output}
        </div>
    )
}


