var listRows = [];
var listProducts = [];
var listPlatforms = [];
var listArchitectures = [];
var masterList;
var resultsTable;
const repoRootURL = "https://repository.eset.com/v1/";

const _clearSearch = document.getElementById('clearSearch');
const _clearAll = document.getElementById('clearAll');
const _selects = document.querySelectorAll('.selects');
const _checkboxes = document.querySelectorAll('.checkboxes');
const _textSearch = document.getElementById('textSearch');
const _product = document.getElementById("product");
const _platform = document.getElementById("platform");
const _architecture = document.getElementById("architecture");
const _results = document.getElementById("results");
//const _limitResults = document.getElementById("limitResults");
const _englishResults = document.getElementById("englishResults");
const _fullPackage = document.getElementById("fullPackage");
const _legacy = document.getElementById("legacy");
const _latest = document.getElementById("latest");
const maxResults = 50;

_clearSearch.addEventListener('click', event => {
    clearSearch();
});

_clearAll.addEventListener('click', event => {
    clearAll();
});

_selects.forEach(el => el.addEventListener('change', event => {
    createTable();
    if (el.id == "product") clearAll();
}));

_checkboxes.forEach(el => el.addEventListener('change', event => { 
    createTable();
}));

_textSearch.addEventListener('keyup', event => {
    createTable();
});

main();

function main() {
    masterList = readTextFile("https://esetuk.github.io/repodownloader/res/products.csv");
    parseList();
    createTable();
}

function parseList() {
    temp = masterList.split(/[\r\n]+/);
    temp.shift();
    console.log(temp);
    for (let i = 0; i < temp.length; i++) {
        temp[i] = temp[i].split(",").slice(0, -1);
        for (let j = 0; j < temp[i].length; j++) {
            temp[i][j] = temp[i][j].trim();
        }
        let includedExtensions = [".msi", ".exe", ".dmg", ".sh", ".bin", ".pkg", ".zip", ".apk", ".linux", ".war"];
        if (temp[i].length != 0) {
        includedExtensions.every(e => {
            if (temp[i][7].toLowerCase().includes(e)) {
                if (!temp[i][7].toLowerCase().includes("com/eset") && !temp[i][7].toLowerCase().includes("third_party/apps")) {
                    temp[i][7] = temp[i][0].replaceAll(".", "/") + "/" + temp[i][7];
                }
                listRows.push(temp[i]);
                return false;
            }
            return true;
            });
        }
        if (!listProducts.includes(temp[i][1]) && temp[i][1] != undefined && temp[i][1] != "") listProducts.push(temp[i][1]);
        if (!listPlatforms.includes(temp[i][4]) && temp[i][4] != undefined && temp[i][4] != "") listPlatforms.push(temp[i][4]);
        if (!listArchitectures.includes(temp[i][5]) && temp[i][5] != undefined && temp[i][5] != "" && !temp[i][5].includes(";")) listArchitectures.push(temp[i][5]);
    }
    listProducts.sort();
    listPlatforms.unshift("All");
    listArchitectures.unshift("All");
    for (let i = 0; i < listProducts.length; i++){
        var select = _product;
        var opt = listProducts[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        select.appendChild(el);
    }
    for (let i = 0; i < listPlatforms.length; i++){
        var select = _platform;
        var opt = listPlatforms[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        select.appendChild(el);
    }
    for (let i = 0; i < listArchitectures.length; i++){
        var select = _architecture;
        var opt = listArchitectures[i];
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
    createTable();
}

function createTable() {
    const headers = ["Product", "Language", "Version", "Platform", "Architecture", "Path", "Legacy", "", ""];
    const textSearchText = _textSearch.value.toLowerCase();
    const selectedProduct = _product.options[_product.selectedIndex].value;
    const selectedPlatform = _platform.options[_platform.selectedIndex].value;
    const selectedArchitecture = _architecture.options[_architecture.selectedIndex].value;
    let currentRow = 0;
    let match = false;
    _results.innerHTML = "";
    resultsTable = document.createElement("table");
    resultsTable.classList.add("center");
    let versions = [];
    for (let index = 0; index < listRows.length; index++) {
        // Platform filter
        if ((listRows[index][1] == selectedProduct) && (listRows[index][4] == selectedPlatform || selectedPlatform == "All") &&
        // Architecture filter
        (listRows[index][5].includes(selectedArchitecture) || selectedArchitecture == "All") && 
        // Legacy filter
        (!_legacy.checked && listRows[index][6] == 0 || _legacy.checked) &&
        // Full filter
        (!_fullPackage.checked || (_fullPackage.checked && (listRows[index][7].includes("full") && (listRows[index][1] == "ESET Endpoint Antivirus" || listRows[index][1] == "ESET Endpoint Security")) || (listRows[index][1] != "ESET Endpoint Antivirus" && listRows[index][1] != "ESET Endpoint Security"))) && 
        // English filter
        (_englishResults.checked && (listRows[index][3].toLowerCase() == "en_us" || listRows[index][3].toLowerCase() == "multilang") || !_englishResults.checked))
        {
                for (let j = 0; j < listRows[index].length; j++) {
                    match = false;
                    if (listRows[index][j].toLowerCase().includes(textSearchText) || textSearchText == "") {
                        match = true;
                        let row = resultsTable.insertRow(currentRow);
                        row.insertCell(0).innerHTML = listRows[index][1]; // Product
                        row.insertCell(1).innerHTML = listRows[index][3]; // Language
                        row.insertCell(2).innerHTML = `<div>${listRows[index][2]}</div>`; // Version
                        row.insertCell(3).innerHTML = listRows[index][4]; // Architecture
                        row.insertCell(4).innerHTML = listRows[index][5]; // Platform
                        row.insertCell(5).innerHTML = listRows[index][7]; // Path
                        row.insertCell(6).innerHTML = listRows[index][6]; // Legacy
                        row.insertCell(7).innerHTML = `<a href="javascript:void(0)" class="links"><img src="res/downloadbutton.png" alt="Download"></img></a>`;
                        resultsTable.rows[currentRow].cells[7].id = "download";
                        row.insertCell(8).innerHTML = `<a href="javascript:void(0)" class="links"><img src="res/copybutton.png" alt="Copy"></img></a>`;
                        resultsTable.rows[currentRow].cells[8].id = "copy";
                        row.insertCell(9).innerHTML = `<a href="javascript:void(0)" class="links"><img src="res/changelogbutton.png" alt="Copy"></img></a>`;
                        resultsTable.rows[currentRow].cells[9].id = "changelog";
                        currentRow++;
                        versions.push(listRows[index][2]);
                    }
                if (match) break;
                }
            }
            if (currentRow == maxResults) break;
        }
        if (currentRow > 0) {
            _results.append(resultsTable);
            var header = resultsTable.createTHead();
            var headerRow = header.insertRow(0);
            headerRow.classList.add('th');
            for(var i = 0; i < headers.length; i++) {
                headerRow.insertCell(i).innerHTML = headers[i];
            }
        }
        versions = versions.sort( (a, b) => a.localeCompare(b, undefined, { numeric:true }) );
        let latestVersion = versions[versions.length - 1];
        for (var i = 1; i < resultsTable.rows.length; i++) {
            if (resultsTable.rows[i].cells[2].innerText == latestVersion) resultsTable.rows[i].cells[2].firstChild.classList.add("highlightLatest");
            if (resultsTable.rows[i].cells[6].innerText == 1) resultsTable.rows[i].cells[2].firstChild.classList.add("highlightLegacy");
            if (_latest.checked && resultsTable.rows[i].cells[2].innerText != latestVersion) {
                resultsTable.deleteRow(i);
                i--;
            }
        }
        resultCount();
    resultsTable.addEventListener("click", function (e) { action(e); });
}

function resultCount() {
    let numberOfRows = resultsTable.rows.length - 1;
    if (numberOfRows > 0) {
        resultsString = `${numberOfRows} results`;
        if (numberOfRows >= maxResults) resultsString += " [LIMITED]";
        resultsString += "<br><br>";
    } else {
        resultsString = `<img id="sadFace" class="rotate" src="res/sadface.png" draggable="false" alt=":("></img><br><br>No results`;
    }
    _results.insertAdjacentHTML("afterbegin", resultsString);
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
        case "changelog":
            changelogURL(resultsTable.rows[cell.parentElement.rowIndex].cells[5].innerHTML);
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

function changelogURL(path) {
    url = repoRootURL + path + ".changelog.html";
    window.open(url, "_blank");
}