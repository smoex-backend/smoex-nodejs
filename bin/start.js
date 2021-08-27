const { spawnSync } = require('child_process')

const proj = process.argv[2]
spawnSync(`cd ./projects/${proj} && npm start`, [
], { stdio: 'inherit', shell: true })
