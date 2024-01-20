var productRows = [];
var productNames = [];
var productList;
var resultsTable;
const repoRootURL = "https://repository.eset.com/v1/";

main();

document.querySelectorAll('.selects').forEach(el => el.addEventListener('change', event => { 
      createTable();
    }));

document.querySelectorAll('.checkboxes').forEach(el => el.addEventListener('change', event => { 
    createTable();
  }));

document.getElementById('textfilter').addEventListener('keyup', event => {
    createTable();
});

function main() {
    productList = readTextFile("https://esetuk.github.io/repo-downloader/res/products.csv");
    parseList(productList);
    createTable();
}

function parseList(productList) {
    temp = productList.split(/[\r\n]+/);
    for (let i = 0; i < temp.length; i++) {
        temp[i] = temp[i].split(",").slice(0, -1);
        for (let j = 0; j < temp[i].length; j++) {
            temp[i][j] = temp[i][j].trim();
        }
        let include = [".msi", ".exe", ".dmg", ".sh", ".bin", ".pkg", ".zip", ".apk", ".linux"];
        if (temp[i].length != 0) {
        include.every(e => {
            if (temp[i][7].toLowerCase().includes(e)) {
                productRows.push(temp[i]);
                return false;
            }
            return true;
            });
        }
        if (!productNames.includes(temp[i][1]) && temp[i][1] != undefined) productNames.push(temp[i][1]);
    }
    var select = document.getElementById("product");
    productNames.shift();
    productNames.sort();
    productRows.shift();
    for (let i = 0; i < productNames.length; i++){
        var opt = productNames[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        select.appendChild(el);
    }
}

function createTable() {
    const headers = ["Product", "Language", "Version", "Platform", "Architecture", "Path", "", ""];
    const textFilterText = document.getElementById("textfilter").value.toLowerCase();
    const limitResults = document.getElementById("limitresults").checked;
    const englishResults = document.getElementById("englishresults").checked;
    const e = document.getElementById("product");
    const selected = e.options[e.selectedIndex].value;
    const maxResults = 20;
    let currentRow = 0;
    let match = false;
    document.getElementById("results").innerHTML = "";
    resultsTable = document.createElement("table");
    resultsTable.classList.add("center");
    for (let index = 0; index < productRows.length; index++) {
        if (productRows[index][1] == selected) {
                for (let j = 0; j < productRows[index].length; j++) {
                    match = false;
                    if ((productRows[index][j].toLowerCase().includes(textFilterText)|| textFilterText == "")
                    && (englishResults && (productRows[index][3].toLowerCase() == "en_us" || productRows[index][3].toLowerCase() == "multilang") || !englishResults))
                    {
                        match = true;
                        let row = resultsTable.insertRow(currentRow);
                        row.insertCell(0).innerHTML = productRows[index][1]; // Product
                        row.insertCell(1).innerHTML = productRows[index][3]; // Language
                        row.insertCell(2).innerHTML = productRows[index][2]; // Version
                        row.insertCell(3).innerHTML = productRows[index][4]; // Architecture
                        row.insertCell(4).innerHTML = productRows[index][5]; // Platform
                        row.insertCell(5).innerHTML = productRows[index][7]; // Path
                        row.insertCell(6).innerHTML = `<a href="javascript:void(0)" class="links">Download</a>`;
                        resultsTable.rows[currentRow].cells[6].id = "download";
                        row.insertCell(7).innerHTML = `<a href="javascript:void(0)" class="links">Copy URL</a>`;
                        resultsTable.rows[currentRow].cells[7].id = "copy";
                        currentRow++;
                    }
                if (match) break;
                }
            }
            if (limitResults && currentRow == maxResults) break;
        }
        let resultsString;
        if (currentRow > 0) {
            resultsString = `${currentRow} results`;
            if (limitResults && currentRow >= maxResults) resultsString += " [LIMITED]";
            resultsString += "<br><br>";
            document.getElementById("results").innerHTML = resultsString;
            document.getElementById("results").append(resultsTable);
                var header = resultsTable.createTHead();
                var headerRow = header.insertRow(0);
                headerRow.classList.add('th');
                for(var i = 0; i < headers.length; i++) {
                    headerRow.insertCell(i).innerHTML = headers[i];
                }
        } else {
            resultsString = "No results :(";
            document.getElementById("results").innerHTML = resultsString;
        }
    resultsTable.addEventListener("click", function (e) { action(e); });
}

function toast(msg) {
    let el = document.createElement("div");
    el.classList.add('toast');
    el.innerHTML = msg;
    setTimeout(function () {
        el.parentNode.removeChild(el);
    }, 3000);
    document.body.appendChild(el);
}

function readTextFile(file) {
    let rawFile = new XMLHttpRequest();
    let allText = "";
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                allText = rawFile.responseText;
            }
        }
    }
    rawFile.send(null);
    return (allText);
}

function action(e) {
    let cell = e.target.closest('td');
    switch (cell.id) {
        case "download":
            downloadURL(resultsTable.rows[cell.parentElement.rowIndex].cells[5].innerHTML);
            break;
        case "copy":
            copyURL(resultsTable.rows[cell.parentElement.rowIndex].cells[5].innerHTML);
            break;
        default:
    }
}

function downloadURL(path) {
    url = repoRootURL + path;
    window.location.href = url;
    toast(`Downloading package from ${url}`);
}

function copyURL(path) {
    url = repoRootURL + path;
    navigator.clipboard.writeText(url);
    toast(`Copied URL ${url} to clipboard`);
}