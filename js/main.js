var productRows = [];
var productNames = [];
var productPlatforms = [];
var productArchitectures = [];
var productList;
var resultsTable;
const repoRootURL = "https://repository.eset.com/v1/";

const _clearSearch = document.getElementById('clearSearch');
const _selects = document.querySelectorAll('.selects');
const _checkboxes = document.querySelectorAll('.checkboxes');
const _textSearch = document.getElementById('textSearch');
const _product = document.getElementById("product");
const _platform = document.getElementById("platform");
const _architecture = document.getElementById("architecture");
const _results = document.getElementById("results");
const _limitResults = document.getElementById("limitresults");
const _englishResults = document.getElementById("englishresults");

_clearSearch.addEventListener('click', event => {
    clearSearch();
});

_selects.forEach(el => el.addEventListener('change', event => {
    clearSearch();
    createTable();
}));

_checkboxes.forEach(el => el.addEventListener('change', event => { 
    createTable();
}));

_textSearch.addEventListener('keyup', event => {
    createTable();
});

main();

function main() {
    productList = readTextFile("https://esetuk.github.io/repodownloader/res/products.csv");
    parseList();
    createTable();
}

function parseList() {
    temp = productList.split(/[\r\n]+/);
    temp.shift();
    for (let i = 0; i < temp.length; i++) {
        temp[i] = temp[i].split(",").slice(0, -1);
        for (let j = 0; j < temp[i].length; j++) {
            temp[i][j] = temp[i][j].trim();
        }
        let includedExtensions = [".msi", ".exe", ".dmg", ".sh", ".bin", ".pkg", ".zip", ".apk", ".linux"];
        if (temp[i].length != 0) {
        includedExtensions.every(e => {
            if (temp[i][7].toLowerCase().includes(e)) {
                productRows.push(temp[i]);
                return false;
            }
            return true;
            });
        }
        if (!productNames.includes(temp[i][1]) && temp[i][1] != undefined && temp[i][1] != "") productNames.push(temp[i][1]);
        if (!productPlatforms.includes(temp[i][4]) && temp[i][4] != undefined && temp[i][4] != "") productPlatforms.push(temp[i][4]);
        if (!productArchitectures.includes(temp[i][5]) && temp[i][5] != undefined && temp[i][5] != "" && !temp[i][5].includes(";")) productArchitectures.push(temp[i][5]);
    }
    productNames.sort();
    productPlatforms.unshift("All");
    productArchitectures.unshift("All");
    for (let i = 0; i < productNames.length; i++){
        var select = _product;
        var opt = productNames[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        select.appendChild(el);
    }
    for (let i = 0; i < productPlatforms.length; i++){
        var select = _platform;
        var opt = productPlatforms[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        select.appendChild(el);
    }
    for (let i = 0; i < productArchitectures.length; i++){
        var select = _architecture;
        var opt = productArchitectures[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        select.appendChild(el);
    }
}

function clearSearch(){
    if (_textSearch.value != "") {
        _textSearch.value = "";
        createTable();
    }
}

function clearAll(){
    clearSearch();
    _platform.selectedIndex = 0;
    _architecture.selectedIndex = 0;
    _product.selectedIndex = 0;
    createTable();
}

function createTable() {
    const headers = ["Product", "Language", "Version", "Platform", "Architecture", "Path", "", ""];
    const textSearchText = _textSearch.value.toLowerCase();
    const limitResults = _limitResults.checked;
    const englishResults = _englishResults.checked;
    const selectedProduct = _product.options[_product.selectedIndex].value;
    const selectedPlatform = _platform.options[_platform.selectedIndex].value;
    const selectedArchitecture = _architecture.options[_architecture.selectedIndex].value;
    const maxResults = 20;
    let currentRow = 0;
    let match = false;
    _results.innerHTML = "";
    resultsTable = document.createElement("table");
    resultsTable.classList.add("center");
    for (let index = 0; index < productRows.length; index++) {
        if ((productRows[index][1] == selectedProduct) && (productRows[index][4] == selectedPlatform || selectedPlatform == "All") && (productRows[index][5].includes(selectedArchitecture) || selectedArchitecture == "All")) {
                for (let j = 0; j < productRows[index].length; j++) {
                    match = false;
                    if ((productRows[index][j].toLowerCase().includes(textSearchText)|| textSearchText == "")
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
            _results.innerHTML = resultsString;
            _results.append(resultsTable);
                var header = resultsTable.createTHead();
                var headerRow = header.insertRow(0);
                headerRow.classList.add('th');
                for(var i = 0; i < headers.length; i++) {
                    headerRow.insertCell(i).innerHTML = headers[i];
                }
        } else {
            resultsString = `No results :(  <a class="links" id="clearAll" href="javascript:void(0)">clear filters</a>`;
            _results.innerHTML = resultsString;
            document.getElementById('clearAll').addEventListener('click', event => {
                clearAll();
            });
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