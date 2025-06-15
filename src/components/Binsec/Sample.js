import { useState, useEffect, useRef } from "react";
import toml from "toml";

import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

import CodeBlock from '@theme/CodeBlock';
import Admonition from '@theme/Admonition';
import TabItem from "@theme/TabItem";
import Tabs from "@theme/Tabs";

import Icon from "@site/src/components/Icon";
import Toggle from "@site/src/components/Toggle";

import { Chrome, Edge, Firefox, Safari } from '@site/src/components/Browser';

import styles from "./styles.module.css"

function displayTime(time) {
    const h = Math.floor(time / 3600)
    const m = Math.floor(time / 60) - 60 * h
    const s = Math.floor(time - 3600 * h - 60 * m)
    if (h > 0)
        return `${h}h${m.toString().padStart(2, '0')}m${s.toString().padStart(2, '0')}s`
    else if (m > 0)
        return `${m}m${s.toString().padStart(2, '0')}s`
    else {
        const ms = Math.floor(time * 1000) - 1000 * s
        if (s > 0) return `${s}.${Math.floor(ms / 100).toString()}s`
        else return `${ms}ms`
    }
}

function displayIps(ips) {
    if (Number.isNaN(ips)) return String(ips);
    if (ips >= 1e9) {
        const g = Math.floor(ips / 1e9)
        const m = Math.floor(ips / 1e8) - 10 * g
        return `${g}.${m}GIPS`
    } else if (ips >= 1e6) {
        const m = Math.floor(ips / 1e6)
        const k = Math.floor(ips / 1e5) - 10 * m
        return `${m}.${k}MIPS`
    } else if (ips >= 1e3) {
        const k = Math.floor(ips / 1e3)
        const z = Math.floor(ips / 1e2) - 10 * k
        return `${k}.${z}kIPS`
    } else return `${Math.floor(ips)}IPS`
}

function displayPercent(percent) {
    if (Number.isNaN(percent)) return String(percent);
    return `${(percent * 100).toFixed(2)}%`
}

export function Metrics({ value, instructions, totalTime, ...props }) {
    const reasoning_time = value.reasoning.preprocess.time + value.reasoning.solver.time;
    const exploration_time = value.exploration.time - reasoning_time;
    return <table className={styles['metrics-table']} style={{}}>
        <thead>
            <tr>
                <th colSpan={2} style={{ width: '50%', textAlign: "left" }}>Exploration</th>
                <th colSpan={2} style={{ width: '50%', textAlign: "left" }}>Reasoning</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td colSpan={2} style={{ width: '100%' }}>
                    <table className={styles['metrics-table']}>
                        <thead>
                            <tr>
                                <th colSpan={1}>Paths</th>
                                <td className={styles['metrics-data']}>{value.exploration.paths.total}</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>pending</td>
                                <td className={styles['metrics-data']}>{value.exploration.paths.pending}</td>

                            </tr>
                            <tr>
                                <td>completed/cut</td>
                                <td className={styles['metrics-data']}>{Object.values(value.exploration.paths.completed).reduce((a, b) => a + b, 0)}</td>

                            </tr>
                            <tr>
                                <td>discontinued</td>
                                <td className={styles['metrics-data']}>{Object.values(value.exploration.paths.discontinued).reduce((a, b) => a + b, 0)}</td>

                            </tr>
                        </tbody>
                    </table>
                    <table className={styles['metrics-table']}>
                        <thead>
                            <tr>
                                <th colSpan={2}>Topology</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>branching points</td>
                                <td className={styles['metrics-data']}>{value.exploration.topology.branches}</td>

                            </tr>
                            <tr>
                                <td>max reached depth</td>
                                <td className={styles['metrics-data']}>{value.exploration.max_depth}</td>

                            </tr>
                        </tbody>
                    </table>
                    <table className={styles['metrics-table']}>
                        <thead>
                            <tr>
                                <th colSpan={1}>ASM instructions</th>
                                <td className={styles['metrics-data']}>{value.exploration.unique_insts}</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>unrolled</td>
                                <td className={styles['metrics-data']}>{value.exploration.instructions}</td>
                            </tr>
                            <tr>
                                <td>emulation speed</td>
                                <td className={styles['metrics-data']}>{displayIps((value.exploration.instructions - instructions) / (value.exploration.time - totalTime))}</td>
                            </tr>
                        </tbody>
                    </table>
                </td>
                <td colSpan={2} style={{ width: '100%' }}>
                    <table className={styles['metrics-table']}>
                        <thead>
                            <tr>
                                <th colSpan={2}>Assertions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>failed</td>
                                <td className={styles['metrics-data']}>{value.exploration.paths.completed.assertion_failure}</td>
                            </tr>
                            <tr>
                                <td>total</td>
                                <td className={styles['metrics-data']}>{value.exploration.topology.assertions}</td>
                            </tr>
                        </tbody>
                    </table>
                    <table className={styles['metrics-table']}>
                        <thead>
                            <tr>
                                <th colSpan={3}>Simplifications</th>
                                <td className={styles['metrics-data']}>{value.reasoning.preprocess.sat + value.reasoning.preprocess.unsat}</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>sat</td>
                                <td className={styles['metrics-data']}>{value.reasoning.preprocess.sat}</td>
                                <td>unsat</td>
                                <td className={styles['metrics-data']}>{value.reasoning.preprocess.unsat}</td>
                            </tr>
                            <tr>
                                <td colSpan={3}>time</td>
                                <td className={styles['metrics-data']}>{displayTime(value.reasoning.preprocess.time)}</td>
                            </tr>
                        </tbody>
                    </table>
                    <table className={styles['metrics-table']}>
                        <thead>
                            <tr>
                                <th colSpan={3}>SMT queries</th>
                                <td className={styles['metrics-data']}>{value.reasoning.solver.sat + value.reasoning.solver.unsat + value.reasoning.solver.unknown}</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>sat</td>
                                <td className={styles['metrics-data']}>{value.reasoning.solver.sat}</td>
                                <td>unsat</td>
                                <td className={styles['metrics-data']}>{value.reasoning.solver.unsat}</td>
                            </tr>
                            <tr>
                                <td>unknown</td>
                                <td className={styles['metrics-data']}>{value.reasoning.solver.unknown}</td>
                                <td colSpan={1}>time</td>
                                <td className={styles['metrics-data']}>{displayTime(value.reasoning.solver.time)}</td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
            <tr>
                <th colSpan={3}>Execution time</th>
                <td style={{ width: '75%' }}>{displayTime(value.exploration.time)}</td>
            </tr>
            <tr>
                <td colSpan={2} style={{ width: '50%' }}>{displayTime(exploration_time)}</td>
                <td colSpan={2} style={{ width: '50%' }}>{displayTime(reasoning_time)}</td>
            </tr>
            <tr>
                <td style={{ width: '25%' }}>ratio</td>
                <td style={{ width: '25%' }}>{displayPercent(exploration_time / value.exploration.time)}</td>
                <td colSpan={2} style={{ width: '50%' }}>{displayPercent(reasoning_time / value.exploration.time)}</td>
            </tr>
        </tbody>
    </table >
}

export function Sample({ Model, value, width, height, filename, binary, noinfo, ...props }) {

    const [_, setTick] = useState(Date.now())
    const [running, setRunning] = useState(false);
    const [script, setScript] = useState(value);
    const [heuristic] = useState(props.heuristic === undefined ? "dfs" : props.heuristic)
    const [maxDepth] = useState(props.maxDepth === undefined ? 1000 : props.maxDepth);
    const [trace, setTrace] = useState(props.trace === 'on');
    const [info] = useState(noinfo === undefined ? true : !noinfo);
    const [checkct, setCheckct] = useState(props.checkct);
    const [monitor, setMonitor] = useState(props.monitor === 'on');
    const [output] = useState([]);
    const [sharedBuffer] = useState(new SharedArrayBuffer(512));
    const metricsIdRef = useRef(null);
    const metricsRef = useRef(null);
    const [instructions, setInstructions] = useState(0);
    const [totalTime, setTotalTime] = useState(0);

    useEffect(() => {
        if (ExecutionEnvironment.canUseDOM) {
            metricsIdRef.current = binsecClient.metrics(sharedBuffer);
            metricsRef.current = toml.parse(binsecClient.metricsToToml(metricsIdRef.current))
        }
        const interval = setInterval(() => {
            setTick(Date.now());
            setInstructions(metricsRef.current.exploration.instructions);
            setTotalTime(metricsRef.current.exploration.time);
            metricsRef.current = toml.parse(binsecClient.metricsToToml(metricsIdRef.current));
        }, 1000);
        return () => {
            clearInterval(interval);
        };
    }, []);

    const sendRequest = () => {
        setTick(Date.now());
        if (self['main-worker-ready']) {
            self['main-worker-ready'] = false;
            self['main-worker'].onmessage = (e) => {
                setTick(Date.now());
                switch (e.data[0]) {
                    case 'debug':
                        output.push(e.data[1]);
                        break;
                    case 'info':
                        if (info)
                            output.push(e.data[1]);
                        break;
                    case 'log':
                        output.push(e.data[1]);
                        break;
                    case 'warn':
                        output.push(<Admonition type="warning">
                            <span>{e.data[1]}</span>
                        </Admonition>)
                        break;
                    case 'error':
                        output.push(<Admonition type="danger" title="Error">
                            <span>{e.data[1]}</span>
                        </Admonition>);
                        break;
                    case 'finished':
                        setRunning(false);
                        self['main-worker-ready'] = true;
                        break;
                    case 'status':
                        if (e.data[1] == 'undefined') {
                            output.push(<Admonition type="warning" title="Not yet">
                                <b>BINSEC</b> modules are not yet ready. If you just reloaded the page, try again in a few seconds.<br />Otherwise, something may have gone wrong. <b>BINSEC</b> compilation to Web Assembly is still experimental, consider using the native version or maybe try with  another browser (<Chrome /> Chrome, <Edge /> Edge, <Firefox /> Firefox or <Safari /> Safari).
                            </Admonition>);
                            break;
                        }
                    default:
                        output.push(<span style={{ color: 'var(--ifm-color-danger)' }}>Unexpected message from worker.<br /></span>);
                }
            };
            output.length = 0;
            setRunning(true);
            binary.then((buffer) => {
                (props.sysroot === undefined ? Promise.resolve([]) : props.sysroot).then((sysroot) => {
                    self['main-worker'].postMessage(['run', filename, buffer, sysroot, script, heuristic, maxDepth, trace, checkct, sharedBuffer])
                });
            })
        } else {
            output.length = 0;
            output.push(<span style={{ color: 'var(--ifm-color-danger)' }}>An instance of BINSEC is already running.<br /></span>);
            output.push(<span style={{ color: 'var(--ifm-color-danger)' }}>Refresh the page if you do not want to wait for the result.</span>);
        }
    }

    const handleToggleCheckct = () => setCheckct(1 - checkct)

    const handleToggleTrace = () => setTrace(!trace)

    const handleToggleMonitor = () => setMonitor(!monitor)

    const buttons = <div style={{ position: 'flex' }}>
        <button
            className="button button--primary"
            onClick={sendRequest}
            disabled={running}
        >
            {running ? <Icon icon="fa-spinner" spin pulse /> : <Icon icon="fa-solid fa-play" />} Run
        </button>
        {props.trace === 'toggle' &&
            <Toggle title="Trace" value={false} onChange={handleToggleTrace} />}
        {props.monitor === 'toggle' &&
            <Toggle title="Monitor" value={false} onChange={handleToggleMonitor} />}
        {props.checkct === 'toggle' &&
            <Toggle title="Check CT" value={checkct === 0} onChange={handleToggleCheckct} />}
    </div>

    return (
        <div display='grid'>
            <Model value={value} width={width} height={height} onChange={setScript} />
            {props.children !== undefined &&
                <Tabs groupId="setup" queryString>
                    <TabItem value="browser" label="Browser" default>
                        {buttons}
                        {monitor && metricsRef.current && <Metrics value={metricsRef.current} instructions={instructions} totalTime={totalTime}></Metrics>}
                        <CodeBlock language='plain' title='Output'>{output}</CodeBlock>
                    </TabItem>
                    <TabItem value="command-line" label="Command-line">
                        {props.children}
                    </TabItem>
                </Tabs>
            }
            {props.children === undefined &&
                [
                    buttons,
                    monitor && metricsRef.current && <Metrics value={metricsRef.current} instructions={instructions} totalTime={totalTime}></Metrics>,
                    <CodeBlock language='plain' title='Output'>{output}</CodeBlock>]}
        </div>
    )
}