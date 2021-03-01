import { Usdz } from "Usdz";

//const zipFile = FileFromDataUrl(zipFileDataUrl,'test.zip'); 
window.addEventListener("load",()=>{
    console.log('loaded!')
    const uploadFileElement = GetUploadFileElement();
    uploadFileElement.addEventListener("change",FileChangeEventHandler(uploadFileElement));
})

function GetUploadFileElement() {
    return document.getElementById('usdz_file') as HTMLInputElement;
}

function FileChangeEventHandler(fileElement: HTMLInputElement): (this: HTMLInputElement, ev: Event) => void {
    return () => {
        RunUsdzParser(fileElement);
    };
}

function RunUsdzParser(fileElement: HTMLInputElement) {
    console.log('select changed!');
    if (fileElement.files != null) {
        if (fileElement.files.length > 0) {
            Usdz.ParseUSDZ(fileElement.files[0]);
        }
    }
}

