import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Disassemlby from '@site/src/components/Disassembly';

export default function Objdump({ headers, disassembly }) {
    return (<Tabs>
        <TabItem value="headers" label="Headers" default>
            <pre>
                {headers}
            </pre>
        </TabItem>
        <TabItem value="disassembly" label="Disassembly">
            <Disassemlby source={disassembly} />
        </TabItem>
    </Tabs>)
}