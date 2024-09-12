import { initializeTaskManager } from '@_koii/task-manager';
import {
  initializeOrcaClient,
  getOrcaClient,
} from '@_koii/task-manager/extensions';
import { config } from './orcaSettings.js';
import { storeFile, getFile } from './helpers.js';

async function setup() {
  // define any steps that must be executed before the task starts
  console.log('CUSTOM SETUP');
}

async function task(roundNumber) {
  /**
   * Run your task and store the proofs to be submitted for auditing
   * It is expected you will store the proofs in your container
   * The submission of the proofs is done in the submission function
   */
  console.log(`EXECUTE TASK FOR ROUND ${roundNumber}`);
  try {
    const orcaClient = await getOrcaClient();
    await orcaClient.podCall(`task/${roundNumber}`);
  } catch (error) {
    console.error('EXECUTE TASK ERROR:', error);
  }
}

async function submission(roundNumber) {
  /**
   * Retrieve the task proofs from your container and submit for auditing
   * Must return a string of max 512 bytes to be submitted on chain
   * The default implementation handles uploading the proofs to IPFS
   * and returning the CID
   */
  console.log(`FETCH SUBMISSION FOR ROUND ${roundNumber}`);
  try {
    const orcaClient = await getOrcaClient();
    const result = await orcaClient.podCall(`submission/${roundNumber}`);
    const cid = await storeFile(result.data, 'submission.json');
    console.log('SUBMISSION CID:', cid);
    return cid;
  } catch (error) {
    console.error('FETCH SUBMISSION ERROR:', error);
  }
}

async function audit(cid, roundNumber) {
  /**
   * Audit a submission
   * This function should return true if the submission is correct, false otherwise
   * The default implementation retrieves the proofs from IPFS
   * and sends them to your container for auditing
   */
  console.log(`AUDIT SUBMISSION FOR ROUND ${roundNumber}`);
  const submission = await getFile(cid);
  const orcaClient = await getOrcaClient();
  const orca = await orcaClient.get();
  const result = await orca.podCall(`audit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(submission),
  });
  return result;
}

function distribution(submitters, bounty, roundNumber) {
  /**
   * Generate the reward list for a given round
   * This function should return an object with the public keys of the submitters as keys
   * and the reward amount as values
   */
  const slashPercentage = 0.7;

  console.log(`MAKE REWARD LIST FOR ROUND ${roundNumber}`);
  const rewardList = {};
  const approvedSubmitters = [];
  // Slash the stake of submitters who submitted incorrect values
  // and make a list of submitters who submitted correct values
  for (const submitter of submitters) {
    rewardList[submitter.publicKey] = 0;
    if (submitter.votes < 0) {
      const slashedStake = submitter.stake * slashPercentage;
      rewardList[submitter.publicKey] = -slashedStake;
      console.log('CANDIDATE STAKE SLASHED', submitter.publicKey, slashedStake);
    } else {
      approvedSubmitters.push(submitter.publicKey);
    }
  }
  // Reward the submitters who submitted correct values
  const reward = Math.floor(bounty / approvedSubmitters.length);
  console.log('REWARD PER NODE', reward);
  approvedSubmitters.forEach(candidate => {
    rewardList[candidate] = reward;
  });
  return rewardList;
}

initializeTaskManager({ setup, task, submission, audit, distribution });
initializeOrcaClient(config);
