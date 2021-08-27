const path = require('path')
const fs = require('fs')
const { deleteFolderRecursive, createFolders } = require('@jsk-std/io')
const projectDir = path.join(__dirname, '../projects')
const distDir = path.join(__dirname, '../dist')
const files = fs.readdirSync(projectDir)
deleteFolderRecursive(distDir)
createFolders(distDir)

for (const file of files) {
    const sourcePath = path.join(projectDir, `./${file}`, './dist/bundle.zip')
    if (fs.existsSync(sourcePath)) {
        console.log(sourcePath)
        fs.copyFileSync(
            sourcePath,  
            path.join(distDir, file + '-bundle.zip')
        )
    }
}
