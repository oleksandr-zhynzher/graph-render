import { spawn } from 'node:child_process';

const audit = spawn('yarn', ['audit', '--json'], {
  shell: process.platform === 'win32',
  stdio: ['ignore', 'pipe', 'pipe'],
});

let output = '';
audit.stdout.on('data', (chunk) => {
  output += chunk;
});
audit.stderr.pipe(process.stderr);

const summary = await new Promise((resolve, reject) => {
  audit.on('error', reject);
  audit.on('close', () => {
    let parsedSummary = null;
    for (const line of output.split(/\n+/)) {
      if (!line.trim()) {
        continue;
      }
      try {
        const message = JSON.parse(line);
        if (message.type === 'auditSummary') {
          parsedSummary = message.data;
        }
      } catch {
        // Yarn audit can print non-JSON progress lines; ignore them.
      }
    }
    resolve(parsedSummary);
  });
});

if (!summary) {
  throw new Error('Unable to read yarn audit summary.');
}

const vulnerabilities = summary.vulnerabilities ?? {};
const critical = vulnerabilities.critical ?? 0;
const high = vulnerabilities.high ?? 0;

console.log(
  `Dependency audit: ${critical} critical, ${high} high, ${vulnerabilities.moderate ?? 0} moderate.`
);

if (critical > 0 || high > 0) {
  process.exitCode = 1;
}
