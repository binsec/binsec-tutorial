import { Highlight } from 'prism-react-renderer';
import { usePrismTheme } from '@docusaurus/theme-common';
import { useMapping } from './MappingContext';
import styles from './Mapping.module.css';


export default function PrismCode({ code, language }) {
  const { symbols, active, setActive } = useMapping();
  const prismTheme = usePrismTheme();

function extractHexValues(content) {
  const hexRegex = /\b0x[0-9a-fA-F]+\b/g;
  const matches = content.match(hexRegex);
  return matches ? matches : [];
}

return (
    <Highlight code={code} language={language} theme={prismTheme}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={className} style={style} onMouseLeave={() => setActive(null)} >
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              {line.map((token, key) => {

                // const hexValues = extractHexValues(token.content);
                // const normalized = token.content
                // .replace(/^"(.*)"$/, '$1')
                // .replace(/\/\*|\*\//g, '')
                // .trim();
                // const isSymbol = symbols.includes(normalized) || hexValues.some(hex => symbols.includes(hex));
                // const isActive = active === normalized || hexValues.some(hex => active === hex);

                const content = token.content;
                const hexValues = extractHexValues(content);
                const isSymbol = symbols.includes(content.trim());
                const hasHexSymbol = hexValues.some(hex => symbols.includes(hex));
                const shouldHighlight = isSymbol || hasHexSymbol;
                const isActive = active === content.trim() || hexValues.some(hex => active === hex);

                return (
                  <span
                    key={key}
                    {...getTokenProps({ token })}
                    className={[
                      isSymbol && styles.symbol,
                      isActive && styles.active,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    // onMouseEnter= {isSymbol ? () => setActive(normalized) : undefined}
                    onMouseEnter = {shouldHighlight ? () => {
                        const valueToSet = symbols.includes(content.trim())
                          ? content.trim()
                          : hexValues.find(hex => symbols.includes(hex));
                        setActive(valueToSet);
                      }
                    : undefined
                }
                    onMouseLeave={
                      isSymbol ? () => {setActive(null) ;
                    //console.log("Mouse left, resetting active to null");
                    } : undefined
                  }

                  />
                );
              })}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
}
