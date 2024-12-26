import { WebContainer } from '@webcontainer/api';

let webcontainerInstance: WebContainer;

interface ServerProcess {
  url: string;
  process: any;
}

export async function initWebContainer() {
  try {
    if (!webcontainerInstance) {
      webcontainerInstance = await WebContainer.boot();
    }
    return webcontainerInstance;
  } catch (error) {
    console.error('WebContainer initialization failed:', error);
    throw new Error('WebContainer initialization failed. Please ensure your browser supports the required features.');
  }
}

export async function writeFiles(files: Record<string, any>) {
  const instance = await initWebContainer();
  await instance.mount(files);
}

export async function installDependencies(terminal: any) {
  const instance = await initWebContainer();
  const installProcess = await instance.spawn('npm', ['install']);
  
  installProcess.output.pipeTo(
    new WritableStream<Uint8Array>({
      write(data) {
        terminal.write(new TextDecoder().decode(data));
      },
    })
  ).catch(console.error);
  
  return installProcess.exit;
}

export async function startDevServer(terminal: any): Promise<ServerProcess> {
  const instance = await initWebContainer();
  const serverProcess = await instance.spawn('npm', ['run', 'dev']);
  
  let resolver: (value: ServerProcess) => void;
  const promise = new Promise<ServerProcess>((resolve) => {
    resolver = resolve;
  });

  const textDecoder = new TextDecoder();
  let url = '';

  serverProcess.output.pipeTo(
    new WritableStream<Uint8Array>({
      write(data) {
        const text = textDecoder.decode(data);
        terminal.write(text);
        
        if (!url) {
          // Look for both localhost and 0.0.0.0
          const match = text.match(/(?:Local|Network):\s*(http:\/\/(?:localhost|0\.0\.0\.0):\d+)/);
          if (match) {
            url = match[1].replace('0.0.0.0', 'localhost');
            resolver({ url, process: serverProcess });
          }
        }
      },
    })
  ).catch(console.error);

  return promise;
}

export async function executeCommand(command: string, args: string[], terminal: any) {
  const instance = await initWebContainer();
  const process = await instance.spawn(command, args);
  
  process.output.pipeTo(
    new WritableStream<Uint8Array>({
      write(data) {
        terminal.write(new TextDecoder().decode(data));
      },
    })
  ).catch(console.error);
  
  return process.exit;
}

export function createFileTree(generatedCode: any) {
  const files: Record<string, any> = {
    'package.json': {
      file: {
        contents: JSON.stringify({
          name: 'web-app',
          type: 'module',
          scripts: {
            dev: 'vite --port 5173 --host',
            build: 'vite build',
            preview: 'vite preview'
          },
          dependencies: {
            'react': '^18.2.0',
            'react-dom': '^18.2.0'
          },
          devDependencies: {
            '@vitejs/plugin-react': '^4.0.0',
            'vite': '^4.3.9'
          }
        }, null, 2)
      }
    },
    'vite.config.js': {
      file: {
        contents: `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    strictPort: true,
    port: 5173
  }
});`
      }
    },
    'index.html': {
      file: {
        contents: `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Web App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
      }
    },
    'src': {
      directory: {
        'main.tsx': {
          file: {
            contents: generatedCode.code
          }
        }
      }
    }
  };

  if (generatedCode.files) {
    for (const [path, content] of Object.entries(generatedCode.files)) {
      const parts = path.split('/');
      let current = files;
      
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part]) {
          current[part] = { directory: {} };
        }
        current = current[part].directory;
      }
      
      const fileName = parts[parts.length - 1];
      current[fileName] = {
        file: {
          contents: content as string
        }
      };
    }
  }

  return files;
}