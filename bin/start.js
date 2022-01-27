const { spawnSync } = require('child_process')
const { args } = require('@jsk-std/rc')
const fs = require('fs')
const path = require('path')

const cmds = []

if (fs.existsSync('packages') && fs.statSync('packages').isDirectory()) {
    const dirs = fs.readdirSync('packages')
    for (const dir of dirs) {
        cmds.push({ 
            name: `packages/${dir}` , 
            cmd: `cd ${path.join('packages', dir)} && npm start`, 
        })
    }
}

for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!fs.existsSync(path.join('projects', arg, 'package.json'))) {
        throw new Error('project is not exist: projects/' + arg)
    }
    const mport = 9000 + i
    const insPort = mport + 300
    cmds.push({
        name: `projects/${arg}`,
        cmd: `cd ${path.join('projects', arg)} && npm start`,
        local: i === 0 ? '' : `fc://${arg}:${mport}`,
        ports: i === 0 ? '' : `--inspect-port=${insPort} --port=${mport}`,
    })
}

// npm start --local=fc://acc:8090,fc://auth:9090 
const cmdNames = cmds.map(c => c.name).join(',')
const cmdLocals = cmds.map(c => c.local).filter(Boolean).join(',')
const cmdLocalStr = cmdLocals ? `--local=${cmdLocals}` : ''
const cmdExecs = cmds.map(c => `"${c.cmd}${
    !(cmdLocalStr || c.ports) ? ''
    : ` -- ${[cmdLocalStr, c.ports].filter(Boolean).join(' ')}`
}"`).join(' ')

spawnSync(`concurrently -n ${cmdNames} ${cmdExecs}`, [
], { stdio: 'inherit', shell: true })
