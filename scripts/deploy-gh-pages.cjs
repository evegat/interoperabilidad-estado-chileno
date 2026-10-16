const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const tempDir = path.join(os.tmpdir(), `p029_gh_pages_${Date.now()}`);

console.log('1. Clonando rama gh-pages a temp dir:', tempDir);
execSync(`git clone --branch gh-pages --depth 1 https://github.com/evegat/interoperabilidad-estado-chileno.git "${tempDir}"`, { stdio: 'inherit' });

console.log('2. Limpiando archivos antiguos de gh-pages...');
const files = fs.readdirSync(tempDir);
for (const file of files) {
  if (file !== '.git') {
    fs.rmSync(path.join(tempDir, file), { recursive: true, force: true });
  }
}

console.log('3. Copiando dist/ hacia temp dir...');
fs.cpSync(distDir, tempDir, { recursive: true });

console.log('4. Configurando CNAME y .nojekyll...');
fs.writeFileSync(path.join(tempDir, 'CNAME'), 'interoperabilidadpublica.evegat.cl\n');
fs.writeFileSync(path.join(tempDir, '.nojekyll'), '');

console.log('5. Haciendo commit y push...');
execSync(`git -C "${tempDir}" add -A`, { stdio: 'inherit' });
execSync(`git -C "${tempDir}" commit -m "deploy(v3.1): ergonomia visual y descanso ocular - paleta mate de bajo contraste"`, { stdio: 'inherit' });
execSync(`git -C "${tempDir}" push origin gh-pages`, { stdio: 'inherit' });

console.log('6. Limpiando temp dir...');
fs.rmSync(tempDir, { recursive: true, force: true });

console.log('✅ Despliegue en gh-pages exitoso.');
