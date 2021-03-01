
import { Zip } from "zip";
import 'dataview'
import {USDC} from 'UsdcParser'
import {calcUncompressedLen,uncompressBlock} from 'lz4'



//const zipFile = FileFromDataUrl(zipFileDataUrl,'test.zip'); 
window.addEventListener("load",(ev)=>{
    console.log('loaded!')
    const fileElement = document.getElementById('usdz_file') as HTMLInputElement;
    fileElement.addEventListener("change",(ev:Event)=>{
        console.log('select changed!')
        if(fileElement.files != null){
            if(fileElement.files.length>0){
                ParseUSDZ(fileElement.files[0])
            }    
        }
    });

})


function SendToDownload(filename:string,data:Uint8Array){
    const b = new Blob([data])
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(b)
    link.setAttribute('download', filename);

    console.log(link.href);
    link.click();
}

function ParseUSDZ(zipFile:File){          
    const archive= new Zip.Archive(zipFile);
    


    zipFile.arrayBuffer().then((buffer)=>{
        const data = new DataView(buffer);
        //const h = Zip.ReadFileHeader(data,0);
        const filesList = Zip.QueryFiles(data);
        for(let i=0;i<filesList.length;i++){
            const file = filesList[i];
            const fileData = Zip.ExtractFileData(buffer, file);
            //SendToDownload(filesList[i].filename,fileData)
            const ext = Zip.GetFileExtension(file.filename);
            console.log(ext)
            if(ext === '.usdc'){
                USDC.Parse(new Uint8Array(fileData));
            }
        }
    })
}


