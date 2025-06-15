import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import siteConfig from '@generated/docusaurus.config';


if (ExecutionEnvironment.canUseDOM) {
  self['main-worker'] = new Worker(siteConfig.baseUrl + 'js/main-worker.js');
  self['main-worker-ready'] = true;
}
