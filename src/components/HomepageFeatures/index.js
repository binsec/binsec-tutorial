import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import Icon from '@site/src/components/Icon';

const FeatureList = [
  {
    icon: 'fa-solid fa-route',
    title: 'Symbolic Execution',
    description: (
      <>
        Automatically explore the program behaviors and find the inputs leading to a given execution state.
      </>
    ),
  },
  {
    icon: 'fa-solid fa-bug',
    title: 'Safety and Security',
    description: (
      <>
        Instruments the execution with additional assertions and property checks to reveal bugs or security violations.
      </>
    ),
  },
  {
    icon: 'fa-solid fa-square-binary',
    title: 'Binary Code',
    description: (
      <>
        Analyse programs in executable format, as they are loaded by the operating system and run by the processor.
      </>
    ),
  },
  {
    icon: 'fa-solid fa-microchip',
    title: 'Instruction Set Architecture',
    description: (
      <>
        Decoder support for well established Instruction Set Architectures like the x86, ARM or RISCV.
      </>
    ),
  },
];

function Feature({ icon, title, description }) {
  return (
    <div className={clsx('col col--6')}>
      <div className="text--center padding-horiz--md">
        <Heading as="h3"><Icon icon={icon} /> {title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
