import { createContext, useContext, useState } from 'react';

const MappingContext = createContext(null);

export function MappingProvider({ children, symbols }) {
  const [active, setActive] = useState(null);

  return (
    <MappingContext.Provider
      value={{
        symbols,
        active,
        setActive,
      }}
    >
      {children}
    </MappingContext.Provider>
  );
}

export function useMapping() {
  const ctx = useContext(MappingContext);
  if (!ctx) {
    throw new Error('useMapping must be used inside <Mapping>');
  }
  return ctx;
}
