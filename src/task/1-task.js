import { getOrcaClient } from '@_koii/task-manager/extensions';

export async function task(roundNumber) {
  /**
   * Run your task and store the proofs to be submitted for auditing
   * It is expected you will store the proofs in your container
   * The submission of the proofs is done in the submission function
   */
  console.log(`EXECUTE TASK FOR ROUND ${roundNumber}`);
  try {
    const orcaClient = await getOrcaClient();
    await orcaClient.podCall(`task/${roundNumber}`, { method: 'POST' });
  } catch (error) {
    console.error('EXECUTE TASK ERROR:', error);
  }
}
