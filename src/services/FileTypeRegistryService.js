function FileTypeRegistryService(log, sqlserver) {
    const archiveSql = 'select nlf_filtype from nlf_lagrformat where lower(nlf_filtype) = lower(@extension)'
    return {
        isValid: async extension => {
            let request = sqlserver.request()
            let result = await request.input('extension', extension).query(archiveSql)

            return result.recordset.length == 1
        }
    }
}

module.exports = FileTypeRegistryService