export function createTimePath() {
    const now = (new Date()).toISOString()
        .replace(/-/g, '')
        .replace(/\//g, '')
        .replace(/:/g, '')
        .replace(/\./g, '_')
    return `/${now.split('T')[0]}/${now.replace('T', '_')}`
}