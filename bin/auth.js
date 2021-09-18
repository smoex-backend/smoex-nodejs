const path = require('path')
const fs = require('fs')
const { deleteFolderRecursive, createFolders } = require('@jsk-std/io')
const projectDir = path.join(__dirname, '../projects')
const authDir = path.join(__dirname, '../auth')
const files = fs.readdirSync(projectDir)
const compressing = require('compressing') 
deleteFolderRecursive(authDir)
createFolders(authDir)

for (const file of files) {
    const sourcePath = path.join(projectDir, `./${file}`, './conf/auth.toml')
    if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(
            sourcePath,  
            path.join(authDir, file + '.toml')
        )
    }
}

compressing.zip.compressDir(authDir, authDir + '.zip').then(() => {
    deleteFolderRecursive(authDir)
})

