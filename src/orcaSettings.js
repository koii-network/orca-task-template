import { TASK_ID, namespaceWrapper } from '@_koii/namespace-wrapper';
const podId = TASK_ID;
import 'dotenv/config';

const imageURL = 'docker.io/labrocadabro/orca-hello-world:1.1';

async function createPodSpec() {
  const basePath = await namespaceWrapper.getBasePath();
  /** EXAMPLE PODSPEC
   *
   * NOTES:
   * The spacing is critical in YAML files
   * We recommend validating your podSpec with a tool like https://www.yamllint.com/
   * Use a template literal (``) to preserve whitespace
   * Do not change containers > name
   * You must specify your container image in the podSpec
   */
  const podSpec = `apiVersion: v1
kind: Pod
metadata:
  name: 247-builder-test
spec:
  containers:
    - name: user-${podId}
      image: ${imageURL}
      env:
      - name: YOUR ENV VARIABLE
        value: "${process.env.YOUR_ENV_VARIABLE}"
      volumeMounts:
        - name: data-volume
          mountPath: /data
  volumes:
    - name: data-volume
      hostPath:
        path: ${basePath}/orca/data
        type: DirectoryOrCreate
`;
  return podSpec;
}

export async function getConfig() {
  return {
    imageURL: imageURL,
    // if you don't need to use a podSpec, you can set customPodSpec to null
    customPodSpec: await createPodSpec(),
    rootCA: null,
  };
}
