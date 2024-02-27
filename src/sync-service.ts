import * as fs from 'fs'
import * as path from 'path'
const heap = []

const createInterface = (apiPath: string, _apiFiles: string[], baseLocalPath: string,) => {
    _apiFiles.forEach(_apiFile => {
        const newApiPath = path.join(apiPath, _apiFile)
        const newLocalPath = path.join(baseLocalPath, _apiFile)

        const isDirectory = fs.lstatSync(newApiPath).isDirectory()

        if (isDirectory) {
            const isLocalExist = fs.existsSync(newLocalPath)
            if (!isLocalExist) {
                console.error(_apiFile, 'isimli dosya oluşturulmalı')
                fs.mkdirSync(newLocalPath)
            }

            const apiFiles = fs.readdirSync(newApiPath)
            createInterface(newApiPath, apiFiles, newLocalPath)
        }
        else {
            const isLocalExist = fs.existsSync(newLocalPath.replace('.cs', '.interface.ts')) // TODO localde ki dir yoksa oluşturulacak
            if (!isLocalExist) {
                const csharpCode = fs.readFileSync(newApiPath, 'utf-8')
                const tsCode = convertCSharpToTypeScript(csharpCode);

                fs.writeFileSync(newLocalPath.replace(/.cs/gi, '.interface.ts'), tsCode, 'utf-8');

                console.log(_apiFile, 'isimli dosya oluşturuldu')
            }
        }
    })
}
function convertCSharpToTypeScript(csharpCode: string) {
    // Replace C# interface syntax with TypeScript syntax
    // const regex = /^(.*)public\s(\S+\s\S+)\s*\{[^}].*/gmi;
    let tsCode = csharpCode
    tsCode = tsCode.replace(/(.*)\/\/.*$/gm, '$1'); // remove description rows
    tsCode = tsCode.replace(/(.*)public\s(\S+\s\S+)\s*\{[^=]*\s+ \}/gmi, '$1$2 { get; set; }'); // remove contruc

    tsCode = tsCode.replace(/using.*;/g, '') // Remove 'using' keyword
    tsCode = tsCode.replace(/namespace.*;/g, '') // Remove 'namespace' keyword
    tsCode = tsCode.replace(/public|const/g, '') // Remove 'public' keyword
    tsCode = tsCode.replace(/class|struct/g, 'interface') // Replace 'class' with 'interface'
    tsCode = tsCode.replace(/:/g, ' extends ') // Replace ':' with 'extends'
    tsCode = tsCode.replace(/interface\s+(.*?)/g, 'interface I$1') // Replace 'interface name' with 'IInterfaceName'
    tsCode = tsCode.replace(/extends\s+(.*?)/g, ' extends I$1') // Replace 'extends name' with 'IExtendsInterface'
    tsCode = tsCode.replace(/\S+\(.*\)\s*\{[^}]*\}/gim, '') // remove construct

    tsCode = tsCode.replace(/Dictionary<([a-z1-9]+)[,\s+]+(\S+)>/gim, '{[key:$1]:$2;}') // Replace 'type order' with 'json'

    tsCode = tsCode.replace(/^(\s+|{\s+)(?!interface)(\S+)\s(\S)([a-z1-9_]+).*/gim, '$1lower($3)$4: I$2,') // Replace 'type order' with 'json'

    // tsCode = tsCode.replace(/^(\s+|{\s+)(?!interface)(\S+)\s(\S)(\S+).*/gim, '$1lower($3)$4: I$2,') // Replace 'type order' with 'json'

    tsCode = tsCode.replace(/lower\((.*)\)/gm, function (word, m1: string) {
        return m1.toLowerCase()
    })

    tsCode = tsCode.replace(/^(?:[\t ]*(?:\r?\n|\r))+/gim, '') // Replace 'interface' with 'interface'

    // Replace C# data types with TypeScript data types
    tsCode = tsCode.replace(/IList<(.*)>/g, 'I$1[]');
    tsCode = tsCode.replace(/(\S+):(.*)\?/gim, '$1?:$2');

    // tsCode = tsCode.replace(/\?/g, ' | null');
    tsCode = tsCode.replace(/(?!interface)(Iint)/g, 'number');
    tsCode = tsCode.replace(/IGuid/g, 'number');
    tsCode = tsCode.replace(/I{/g, '{');
    tsCode = tsCode.replace(/Ilong/g, 'number');
    tsCode = tsCode.replace(/Idouble/g, 'number');
    tsCode = tsCode.replace(/Ibool/g, 'boolean');
    tsCode = tsCode.replace(/Istring/g, 'string');
    tsCode = tsCode.replace(/IDateTime/g, 'string');
    tsCode = tsCode.replace(/Idecimal/g, 'number');
    tsCode = tsCode.replace(/IImages/g, 'IImage');
    tsCode = tsCode.replace(/IIFormFile/g, 'File');
    
    tsCode = tsCode.replace(/(^\s+{\s+([{()a-z:,=#\$"{}/\s.;]+)+})/igm, '');
    // Add more data type mappings as needed

    return tsCode;
}
const rmFiles = (modelBasePath: string) => {
    if (!fs.existsSync(modelBasePath)) {
        fs.mkdirSync(modelBasePath, { recursive: true })
    }
    const modelFiles = fs.readdirSync(modelBasePath)
    modelFiles.forEach(modelFile => {
        fs.rmSync(path.join(modelBasePath, modelFile), {
            force: true,
            recursive: true,
            maxRetries: 3,
            retryDelay: 1000
        })
    })
}

// const createService(requestPath){

// }

const models = [
    {
        localPath: 'C:\\Users\\Software-2\\Desktop\\elonky-shop-next\\src\\interfaces\\Requests',
        apiPath: 'C:\\Users\\Software-2\\Desktop\\Api\\Models\\Requests'
    },
    {
        localPath: 'C:\\Users\\Software-2\\Desktop\\elonky-shop-next\\src\\interfaces\\Responses',
        apiPath: 'C:\\Users\\Software-2\\Desktop\\Api\\Models\\Responses'
    },
    {
        localPath: 'C:\\Users\\Software-2\\Desktop\\elonky-shop-next\\src\\interfaces\\Dtos',
        apiPath: 'C:\\Users\\Software-2\\Desktop\\Api\\DataAccessLayer\\Models\\Dtos'
    },
    {
        localPath: 'C:\\Users\\Software-2\\Desktop\\elonky-shop-next\\src\\interfaces\\Common',
        apiPath: 'C:\\Users\\Software-2\\Desktop\\Api\\Common\\Models\\Common'
    },
    {
        localPath: 'C:\\Users\\Software-2\\Desktop\\elonky-shop-next\\src\\interfaces\\Entities',
        apiPath: 'C:\\Users\\Software-2\\Desktop\\Api\\DataAccessLayer\\Models\\Entities'
    },
]

models.forEach(model => {

    const files: string[] = fs.readdirSync(model.apiPath)

    rmFiles(model.localPath)
    createInterface(model.apiPath, files, model.localPath)
})




const localServicePath = `C:\\Users\\Software-2\\Desktop\\elonky-shop-next\\src\\interfaces\\_Service`



// const localResponses: string[] = fs.readdirSync(`C:\\\Users\\Software-2\\Desktop\\elonky-shop-next\\src\\interfaces\\Response`)

// const apiResponses: string[] = fs.readdirSync(`C:\\Users\\Software-2\\Desktop\\Api\\Models\\Responses`)


// const notResponse = apiResponses.filter(apiResponse => {
//     return !localResponses.some(localResponse => localResponse === apiResponse)
// })

// console.log('notResponse: ', notResponse);


export interface Card {
    name: string;
    last_digits: string;
    expiry: string;
    brand: string;
    available_networks: string[];
    type: string;
    bin_details: { [key: string]: object; };
}