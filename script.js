function readFileAsync(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.readAsText(file)
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.onerror = reject;
    })
}
  
function download(filename, text) {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

document.getElementById('submitBtn').onclick = async () => {
    const form = document.querySelector('form')
    if (!form.reportValidity()) {
        return;
    }

    document.getElementById('submitBtnFill').classList.toggle('d-none');
    document.getElementById('submitBtnSpinner').classList.toggle('d-none');

    const fileToFill = document.getElementById('fileToFill').files[0];
    const fileToFillWith = document.getElementById('fileToFillWith').files[0];
    const columnToIdentifyBy = document.getElementById('columnToIdentifyBy').value;

    const reader = new FileReader();

    const parsedFileToFill = await readFileAsync(fileToFill);
    const parsedFileToFillWith = await readFileAsync(fileToFillWith);
    
    let fileToFillTable = $.csv.toArrays(parsedFileToFill);
    const fileToFillWithTable = $.csv.toArrays(parsedFileToFillWith);

    const headersToFind = fileToFillTable[0];
    const headersInFillWith = fileToFillWithTable[0];

    const indexOfIdColIn_Fill = headersToFind.indexOf(columnToIdentifyBy);
    const indexOfIdColIn_FillWith = headersInFillWith.indexOf(columnToIdentifyBy);
    
    const errorMsgBox = document.getElementById('errorMsg')
    if (indexOfIdColIn_Fill == -1 || indexOfIdColIn_FillWith == -1) {
        errorMsgBox.innerHTML = `*Column "<code>${columnToIdentifyBy}</code>" must be present in both files' headers`;
        errorMsgBox.classList.remove('d-none');
        document.getElementById('submitBtnFill').classList.toggle('d-none');
        document.getElementById('submitBtnSpinner').classList.toggle('d-none');
        return;
    }
    errorMsgBox.classList.add('d-none');

    for (rowToFill of fileToFillTable.slice(1)) {
        for (rowOfData of fileToFillWithTable.slice(1)) {
            if (rowToFill[indexOfIdColIn_Fill] == rowOfData[indexOfIdColIn_FillWith]) {
                for (let i = 0; i < rowToFill.length; i++) {
                    if (rowToFill[i] == '') {
                        const valueToFillWith = rowOfData[headersInFillWith.indexOf(headersToFind[i])];
                        if (valueToFillWith) {
                            rowToFill[i] = valueToFillWith;
                        }
                        else {
                            rowToFill[i] = '';
                        }
                    }
                }
            }
        }
    }
    const csvStringToWrite = $.csv.fromArrays(fileToFillTable);
    download(`Filled - ${fileToFill.name}`, csvStringToWrite);

    document.getElementById('submitBtnFill').classList.toggle('d-none');
    document.getElementById('submitBtnSpinner').classList.toggle('d-none');

    window.focus();
}
