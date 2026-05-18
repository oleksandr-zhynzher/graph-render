import { execSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const REGISTRY = 'https://npm.pkg.github.com';
const token = process.env.GITHUB_TOKEN ?? process.env.NODE_AUTH_TOKEN;

if (!token) {
  console.error('GITHUB_TOKEN (or NODE_AUTH_TOKEN) is required to publish to GitHub Packages.');
  process.exit(1);
}

const repository = process.env.GITHUB_REPOSITORY ?? '';
const repositoryOwner = repository.split('/')[0] ?? process.env.GITHUB_REPOSITORY_OWNER ?? '';

if (!repositoryOwner) {
  console.error('GITHUB_REPOSITORY or GITHUB_REPOSITORY_OWNER is required.');
  process.exit(1);
}

const rootPkg = JSON.parse(readFileSync('package.json', 'utf8'));
const workspaceDirs = rootPkg.workspaces ?? [];

const npmrcContents = [
  `@graph-render:registry=${REGISTRY}`,
  `@${repositoryOwner}:registry=${REGISTRY}`,
  `//npm.pkg.github.com/:_authToken=${token}`,
  'always-auth=true',
].join('\n');

const scopedNamePattern = /^@([^/]+)\/(.+)$/;

const resolveGithubPackageName = (packageName) => {
  const match = scopedNamePattern.exec(packageName);
  if (!match) {
    return packageName;
  }

  const [, scope, shortName] = match;
  if (scope.toLowerCase() === repositoryOwner.toLowerCase()) {
    return packageName;
  }

  const githubName = `@${repositoryOwner}/${shortName}`;
  console.log(
    `  scope @${scope} does not match GitHub owner ${repositoryOwner}; publishing as ${githubName}`
  );
  return githubName;
};

let published = 0;
let skipped = 0;
let failed = 0;

for (const dir of workspaceDirs) {
  const packageJsonPath = join(dir, 'package.json');
  const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

  if (pkg.private === true) {
    continue;
  }

  const distEntry = pkg.main ?? pkg.module;
  if (distEntry) {
    const distPath = join(dir, distEntry);
    if (!existsSync(distPath)) {
      console.error(`\n→ ${pkg.name}@${pkg.version}`);
      console.error(`  missing build output: ${distPath}`);
      failed += 1;
      continue;
    }
  }

  const publishName = resolveGithubPackageName(pkg.name);
  const npmrcPath = join(dir, '.npmrc.publish');
  const backupPath = `${packageJsonPath}.gpr-backup`;
  const needsNamePatch = publishName !== pkg.name;

  writeFileSync(npmrcPath, `${npmrcContents}\n`);

  if (needsNamePatch) {
    writeFileSync(backupPath, readFileSync(packageJsonPath, 'utf8'));
    writeFileSync(packageJsonPath, `${JSON.stringify({ ...pkg, name: publishName }, null, 2)}\n`);
  }

  console.log(`\n→ ${publishName}@${pkg.version}`);

  try {
    execSync(`npm publish --registry ${REGISTRY} --access public`, {
      cwd: dir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        npm_config_registry: REGISTRY,
        npm_config_userconfig: npmrcPath,
      },
    });
    published += 1;
  } catch (error) {
    const output = `${error.stdout ?? ''}${error.stderr ?? ''}${error.message ?? ''}`;
    if (output.trim()) {
      console.log(output.trim());
    }

    if (/E409|409|already exists|cannot publish.*version/i.test(output)) {
      console.log('  skipped (version already on GitHub Packages)');
      skipped += 1;
    } else {
      failed += 1;
    }
  } finally {
    if (needsNamePatch && existsSync(backupPath)) {
      writeFileSync(packageJsonPath, readFileSync(backupPath, 'utf8'));
      unlinkSync(backupPath);
    }

    try {
      unlinkSync(npmrcPath);
    } catch {
      // ignore
    }
  }
}

console.log(`\nGitHub Packages: ${published} published, ${skipped} skipped, ${failed} failed.`);

if (failed > 0) {
  process.exit(1);
}

if (published === 0 && skipped === 0) {
  console.error('No packages were published. Check workspace configuration and build outputs.');
  process.exit(1);
}
