// functions/provision-vm/index.ts
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { Compute } from '@google-cloud/compute';
import * as functions from '@google-cloud/functions-framework';

const PROJECT_ID = process.env.GCP_PROJECT_ID || 'unnati-cloud-labs';
const ZONE = process.env.GCP_ZONE || 'us-central1-a';
const NETWORK = process.env.GCP_NETWORK || 'default';

const secretClient = new SecretManagerServiceClient();
const compute = new Compute({ projectId: PROJECT_ID });

interface ProvisionRequest {
  sessionId: string;
  osType: 'Ubuntu' | 'Rocky Linux' | 'OpenSUSE';
  userId: string;
}

functions.http('provisionVM', async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { sessionId, osType, userId } = req.body as ProvisionRequest;
    
    if (!sessionId || !osType || !userId) {
      res.status(400).send('Missing required parameters');
      return;
    }
    
    // Get image based on OS type
    const imageProject = getImageProject(osType);
    const imageFamily = getImageFamily(osType);
    
    // Create a unique instance name
    const instanceName = `lab-${osType.toLowerCase().replace(' ', '-')}-${sessionId.substring(0, 8)}`;
    
    // Create VM instance using spot pricing
    const [operation] = await compute.zone(ZONE).createVM(instanceName, {
      os: imageProject,
      http: true,
      machineType: 'e2-standard-2',
      spot: true,
      diskSizeGb: 20,
      imageFamily,
      networkInterfaces: [
        {
          network: NETWORK,
          accessConfigs: [{ name: 'External NAT', type: 'ONE_TO_ONE_NAT' }]
        }
      ],
      tags: {
        items: ['unnati-lab', `os-${osType.toLowerCase().replace(' ', '-')}`, `user-${userId}`]
      },
      metadata: {
        items: [
          { key: 'sessionId', value: sessionId },
          { key: 'startup-script', value: getStartupScript(osType) }
        ]
      },
      scheduling: {
        preemptible: true
      }
    });
    
    // Wait for the VM creation operation to complete
    await operation.promise();
    
    // Get the VM details
    const [vm] = await compute.zone(ZONE).vm(instanceName).get();
    const externalIP = vm.metadata.networkInterfaces[0].accessConfigs[0].natIP;
    
    res.status(200).json({
      success: true,
      instanceId: instanceName,
      ipAddress: externalIP,
    });
  } catch (error) {
    console.error('Error provisioning VM:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

function getImageProject(osType: string): string {
  switch (osType) {
    case 'Ubuntu':
      return 'ubuntu-os-cloud';
    case 'Rocky Linux':
      return 'rocky-linux-cloud';
    case 'OpenSUSE':
      return 'opensuse-cloud';
    default:
      return 'ubuntu-os-cloud';
  }
}

function getImageFamily(osType: string): string {
  switch (osType) {
    case 'Ubuntu':
      return 'ubuntu-2204-lts';
    case 'Rocky Linux':
      return 'rocky-linux-9';
    case 'OpenSUSE':
      return 'opensuse-leap-15-4';
    default:
      return 'ubuntu-2204-lts';
  }
}

function getStartupScript(osType: string): string {
  // This would contain the script to install and configure Apache Guacamole
  // and other necessary software based on the OS type
  return `#!/bin/bash
    # Install Docker
    apt-get update
    apt-get install -y docker.io docker-compose
    
    # Pull and start Apache Guacamole
    mkdir -p /opt/guacamole
    cd /opt/guacamole
    
    # Create docker-compose.yml for Guacamole
    cat > docker-compose.yml << 'EOL'
    version: '3'
    services:
      guacd:
        image: guacamole/guacd
        restart: always
      guacamole:
        image: guacamole/guacamole
        restart: always
        ports:
          - "8080:8080"
        environment:
          GUACD_HOSTNAME: guacd
          GUACAMOLE_HOME: /guacamole_home
    EOL
    
    # Start Guacamole
    docker-compose up -d
    
    # Notify service is ready
    curl -X POST "https://us-central1-${PROJECT_ID}.cloudfunctions.net/notifyVMReady" -H "Content-Type: application/json" -d '{"sessionId": "$(curl -H "Metadata-Flavor: Google" http://metadata.google.internal/computeMetadata/v1/instance/attributes/sessionId)", "status": "ready"}'
  `;
}
