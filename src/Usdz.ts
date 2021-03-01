import { Usdc as Usdc } from "Usdc/Parser";
import { Utils } from "Utils";
import { Zip } from "zip";

export namespace Usdz{
    export async function  ParseUSDZ(usdzFile:File){          
        const archive= new Zip.Archive(usdzFile);
        await archive.Load(); 
        const filesList =  archive.QueryFilesRecords();   
        for(let i=0;i<filesList.length;i++){
            const file = filesList[i];
            const isUsdcFile = CheckIfUsdcFile(file);
            if(isUsdcFile){
                const usdcFileData = archive.ExtractFileData(file);        
                Usdc.Parse(usdcFileData);
            }            
        }    
    }    

    function CheckIfUsdcFile(file: Zip.SimplifiedFileRecord) {
        const ext = Utils.GetFileExtension(file.filename);
        const isUsdcFile = (ext === '.usdc');
        return isUsdcFile;
    }
}

