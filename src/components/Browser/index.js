import Icon from '@site/src/components/Icon'
import { isChrome, isFirefox, isSafari, isEdge, isChromium } from 'react-device-detect';

export function Chrome() {
    return <Icon icon='fa-brands fa-chrome' />;
}

export function Edge() {
    return <Icon icon='fa-brands fa-edge' />;
}

export function Firefox() {
    return <Icon icon="fa-brands fa-firefox-browser" />;
}

export function Safari() {
    return <Icon icon="fa-brands fa-safari" />;
}

export function Logo() {
    if (isChrome || isChromium)
        return <Chrome />;
    else if (isEdge)
        return <Edge />;
    else if (isFirefox)
        return <Firefox />;
    else if (isSafari)
        return <Safari />
    else return (<Icon icon="fa-solid fa-globe" />)
}

export function InFirefox({ children }) {
    if (isFirefox)
        return children;
    else return (null);
}

export function InKnown({ children }) {
    if (isChrome || isChromium || isEdge || isFirefox | isSafari)
        return children;
    else return (null);
}

export function InUnknown({ children }) {
    if (!(isChrome || isChromium || isEdge || isFirefox || isSafari))
        return children;
    else return (null);
}