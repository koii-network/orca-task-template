import { getFile } from '../helpers.js';
import { getOrcaClient } from '@_koii/task-manager/extensions';
import { namespaceWrapper, TASK_ID } from '@_koii/namespace-wrapper';
import { createHash } from 'crypto';

export async function audit(cid, roundNumber, submitterKey) {
  /**
   * Audit a submission
   * This function should return true if the submission is correct, false otherwise
   * The default implementation retrieves the proofs from IPFS
   * and sends them to your container for auditing
   */
  console.log(`AUDIT SUBMISSION FOR ROUND ${roundNumber}`);

  // get the submission from IPFS
  const submissionString = await getFile(cid);
  const submission = JSON.parse(submissionString);
  console.log({ submission });

  // verify the signature of the submission
  const signaturePayload = await namespaceWrapper.verifySignature(
    submission.signature,
    submitterKey,
  );

  console.log({ signaturePayload });

  // verify the signature payload
  if (signaturePayload.error || !signaturePayload.data) {
    console.error('INVALID SIGNATURE');
    return false;
  }

  // retrieve the original message
  const data = JSON.parse(signaturePayload.data);

  // verify the message
  if (
    data.taskId !== TASK_ID ||
    data.roundNumber !== roundNumber ||
    data.stakingKey !== submitterKey
  ) {
    console.error('INVALID SIGNATURE DATA');
    return false;
  }

  // if you are writing a KPL task, use namespaceWrapper.getSubmitterAccount("KPL");
  const orca = await getOrcaClient();

  // Send the submission to the ORCA container for auditing
  const result = await orca.podCall(`audit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ submission: data }),
  });

  // return the result of the audit (true or false)
  return result.data;
}
