import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const REGISTRY = 'https://npm.pkg.github.com';
const token = process.env.GITHUB_TOKEN ?? process.env.NODE_AUTH_TOKEN;

if (!token) {
  console.error('GITHUB_TOKEN (or NODE_AUTH_TOKEN) is required to publish to GitHub Packages.');
  process.exit(1);
}

const rootPkg = JSON.parse(readFileSync('package.json', 'utf8'));
const workspaceDirs = rootPkg.workspaces ?? [];

const npmrcContents = [
  `@graph-render:registry=${REGISTRY}`,
  `//npm.pkg.github.com/:_authToken=${token}`,
  'always-auth=true',
].join('\n');

let published = 0;
let skipped = 0;

for (const dir of workspaceDirs) {
  const packageJsonPath = join(dir, 'package.json');
  const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

  if (pkg.private === true) {
    continue;
  }

  const npmrcPath = join(dir, '.npmrc.publish');
  writeFileSync(npmrcPath, `${npmrcContents}\n`);

  console.log(`\n→ ${pkg.name}@${pkg.version}`);

  try {
    execSync('npm publish --access public', {
      cwd: dir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        npm_config_userconfig: npmrcPath,
      },
    });
    published += 1;
  } catch (error) {
    const output = `${error.stdout ?? ''}${error.stderr ?? ''}${error.message ?? ''}`;
    console.log(output.trim());
    if (/E409|409|already exists|cannot publish.*version/i.test(output)) {
      console.log(`  skipped (version already on GitHub Packages)`);
      skipped += 1;
    } else {
      unlinkSync(npmrcPath);
      throw error;
    }
  } finally {
    try {
      unlinkSync(npmrcPath);
    } catch {
      // ignore
    }
  }
}

console.log(`\nGitHub Packages: ${published} published, ${skipped} skipped.`);
