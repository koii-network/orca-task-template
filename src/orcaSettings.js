/** EXAMPLE PODSPEC
 *
 * NOTE: The spacing is critical in YAML files
 * use template literal (``) to preserve whitespace

Do not change containers > name. You must specify your container image here.

*/

import { TASK_ID, namespaceWrapper } from '@_koii/namespace-wrapper';
const basePath = await namespaceWrapper.getBasePath();
const podId = TASK_ID;

export const podSpec = `apiVersion: v1
kind: Pod
metadata:
  name: hello-world
spec:
  containers:
    - name: user-${podId}
      image: docker.io/labrocadabro/private:orca-hello-world
      volumeMounts:
        - name: my-volume
          mountPath: /data
  volumes:
    - name: my-volume
      hostPath:
        path: ${basePath}/orca/my-volume
        type: DirectoryOrCreate`;

// const podSpec = null;

export const config = {
  // location of your docker image
  imageURL: 'docker.io/labrocadabro/private:orca-hello-world',
  // if you are using a podSpec, edit it in podSpec.js
  customPodSpec: podSpec,
  // SSL
  rootCA: null,
};
