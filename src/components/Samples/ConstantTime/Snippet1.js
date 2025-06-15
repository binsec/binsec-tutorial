import { useEffect } from "react";
import code from '!!raw-loader!@site/static/snippet/constant_time.ini';

export default ({ onChange }) => {
    useEffect(() => onChange(code), []);

}