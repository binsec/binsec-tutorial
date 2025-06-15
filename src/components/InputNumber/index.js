import clsx from "clsx";
import { useState, useRef } from "react";

import Icon from "@site/src/components/Icon";

import styles from './styles.module.css';

export function InputNumber(props) {

  const [value, setValue] = useState(props.value === undefined ? 0 : props.value);
  const step = props.step == undefined ? 1 : props.step

  const handlePlus = props.max === undefined || props.max === 'infinite' ?
    () => setValue(value + step) : () => setValue(Math.min(value + step, props.max));

  const handleMinus = props.min === undefined || props.min === 'infinite' ?
    () => setValue(value - step) : () => setValue(Math.max(value - step, props.min));

  return (
    <div className={clsx(styles['w-[250px]'], styles['max-w-sm'], styles['relative'], styles['mt-4'])}>
      <label className="block mb-1 text-sm text-slate-600">Select Amount</label>
      <div className={styles['relative']}>
        <button
          className={clsx('button', 'button--primary', 'shadow--lw')}
          type="button"
          onClick={handleMinus}
        ><Icon icon="fa-solid fa-minus" /></button>
        <input
          type="number"
          value={value}
          className={clsx('button', 'button--primary', 'shadow--lw')}
        />
        <button
          className={clsx('button', 'button--primary', 'shadow--lw')}
          type="button"
          onClick={handlePlus}
        ><Icon icon="fa-solid fa-plus" /></button>
      </div>
      <p className="flex items-center mt-2 text-xs text-slate-400">
        Adjust the number using the + and - controls.
      </p>
    </div>)
}