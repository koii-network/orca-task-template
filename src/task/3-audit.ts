import { getFile } from '../helpers.js';
import { getOrcaClient } from '@_koii/task-manager/extensions';

export async function audit(
  submission: string,
  roundNumber: number,
  submitterKey: string,
): Promise<boolean | void> {
  /**
   * Audit a submission
   * This function should return true if the submission is correct, false otherwise
   * The default implementation retrieves the proofs from IPFS
   * and sends them to your container for auditing
   */
  console.log(`AUDIT SUBMISSION FOR ROUND ${roundNumber}`);
  const submissionFile = await getFile(submission);
  const orcaClient = await getOrcaClient();
  const result = await orcaClient.podCall(`audit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(submissionFile),
  });
  return result;
}
