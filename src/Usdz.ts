import { Usdc as Usdc } from "Usdc/Parser";
import { Utils } from "Utils/Utils";
import { Zip } from "Utils/zip";

/**
 * A Usdz file is a simple Zip archive with a usdc file and 
 * its dependent image and files
 */
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
                const usdcParser = new Usdc(usdcFileData);
                usdcParser.Parse();
            }            
        }    
    }    

    function CheckIfUsdcFile(file: Zip.SimplifiedFileRecord) {
        const ext = Utils.GetFileExtension(file.filename);
        const isUsdcFile = (ext === '.usdc');
        return isUsdcFile;
    }
}

