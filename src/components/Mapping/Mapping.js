import React from 'react';
import { MappingProvider } from './MappingContext.js';
import styles from './Mapping.module.css';
import PrismCode from './PrismCode';

export function From({ language, children }) {
  return <PrismCode language={language} code={children.trim()} />;
}

export function To({ language, children }) {
  return <PrismCode language={language} code={children.trim()} />;
}

export function Mapping({ children }) {
  const links = React.Children.toArray(children).filter(
    c => c.type?.name === 'Link'
  );

  const symbols = links.map(l => l.props.name);

  const from = React.Children.toArray(children).find(
    c => c.type?.name === 'From'
  );
  const to = React.Children.toArray(children).find(
    c => c.type?.name === 'To'
  );

  return (
    <MappingProvider symbols={symbols}>
      <div className={styles.mapping}>
        <div className={styles.column}>{from}</div>
        <div className={styles.column}>{to}</div>
      </div>
    </MappingProvider>
  );
}

export function Link() {
  return null; // stub pour l’instant
}
