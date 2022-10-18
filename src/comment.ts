import { Event } from './event';
import { createReportURL } from './report';
import { log } from './logger';
import { Run } from './run';
import { CompareOutput } from './compare';

export type CreateCommentWithTargetInput = {
  event: Event;
  runId: number;
  sha: string;
  targetRun: Run;
  result: CompareOutput & { reportUrl: string };
};

export type CreateCommentWithoutTargetInput = {
  event: Event;
  runId: number;
  result: CompareOutput & { reportUrl: string };
};

const isSuccess = (result: CompareOutput) => {
  return result.failedItems.length === 0 && result.newItems.length === 0 && result.deletedItems.length === 0;
};

const badge = (result: CompareOutput) => {
  return '';
};

export const createCommentWithTarget = ({
  event,
  runId,
  sha: currentHash,
  targetRun,
  result,
}: CreateCommentWithTargetInput): string => {
  const [owner, reponame] = event.repository.full_name.split('/');
  const url = createReportURL(owner, reponame, runId);
  log.info(`This report URL is ${url}`);

  const targetHash = targetRun.head_sha;
  const currentHashShort = currentHash.slice(0, 7);
  const targetHashShort = targetHash.slice(0, 7);

  const successOrFailMessage = isSuccess(result)
    ? `${badge(result)}
  
✨✨ That's perfect, there is no visual difference! ✨✨
Check out the report [here](${url}).
    `
    : `${badge(result)}
  
Check out the report [here](${url}).
    `;

  const body = `This report was generated by comparing [${currentHashShort}](https://github.com/${owner}/${reponame}/commit/${currentHash}) with [${targetHashShort}](https://github.com/${owner}/${reponame}/commit/${targetHash}).
If you would like to check difference, please check [here](https://github.com/${owner}/${reponame}/compare/${targetHashShort}..${currentHashShort}).
  
${successOrFailMessage}
  
| item    | count                         |
|:--------|:-----------------------------:|
| pass    | ${result.passedItems.length}  |
| change  | ${result.failedItems.length}  |
| new     | ${result.newItems.length}     |
| delete  | ${result.deletedItems.length} |`;

  return body;
};

export const createCommentWithoutTarget = ({ event, runId, result }: CreateCommentWithoutTargetInput): string => {
  const [owner, reponame] = event.repository.full_name.split('/');
  const url = result.reportUrl;
  log.info(`This report URL is ${url}`);

  const body = `Failed to find a target artifact.
All items will be treated as new items and will be used as expected data for the next time.

[FULL REPORT](${url}).

| item    | count                         |
|:--------|:-----------------------------:|
| new     | ${result.newItems.length}     |
  `;

  return body;
};
