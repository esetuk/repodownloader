var items = [];
var products = [];
var list;
var table;
const repoRoot = "https://repository.eset.com/v1/";

main();

document.querySelectorAll('.selects').forEach(el => el.addEventListener('change', event => { 
      createTable();
    }));

function main() {
    list = readTextFile("https://esetuk.github.io/repo-downloader/res/products.csv");
    parseList(list);
    createTable();
}

function parseList(list) {
    temp = list.split(/[\r\n]+/);
    for (let i = 0; i < temp.length; i++) {
        temp[i] = temp[i].split(",").slice(0, -1);
        for (let j = 0; j < temp[i].length; j++) {
            temp[i][j] = temp[i][j].trim();
        }
        let include = ["msi", "exe", "dmg", "sh", "bin", "pkg"];
        if (temp[i].length != 0) {
        include.every(e => {
            if (temp[i][7].toLowerCase().includes(e)) {
                items.push(temp[i]);
                return false;
            }
            return true;
            });
        }
        if (!products.includes(temp[i][1]) && temp[i][1] != undefined) products.push(temp[i][1]);
    }
    var select = document.getElementById("product");
    products.shift();
    items.shift();
    for (let i = 0; i < products.length; i++){
        var opt = products[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        select.appendChild(el);
    }
}

function createTable() {
    document.getElementById("results").innerHTML = "";
    let headers = ["Product", "Language", "Version", "Architecture", "Platform", "Path"];
    table = document.createElement("table");
    table.classList.add('center');
    let e = document.getElementById("product");
    let selected = e.options[e.selectedIndex].value;
    let currentRow = 0;
        for (let index = 0; index < items.length; index++) {
            if (items[index][1] == selected) {
                let row = table.insertRow(currentRow);
                row.insertCell(0).innerHTML = items[index][1]; // Product
                row.insertCell(1).innerHTML = items[index][3]; // Language
                row.insertCell(2).innerHTML = items[index][2]; // Version
                row.insertCell(3).innerHTML = items[index][4]; // Architecture
                row.insertCell(4).innerHTML = items[index][5]; // Platform
                row.insertCell(5).innerHTML = items[index][7]; // Path
                row.insertCell(6).innerHTML = `<a href="javascript:void(0)">Download</a>`;
                table.rows[currentRow].cells[6].id = "download";
                row.insertCell(7).innerHTML = `<a href="javascript:void(0)">Copy URL</a>`;
                table.rows[currentRow].cells[7].id = "copy";
                currentRow++;
            }
        }
        let resultsString;
        if (currentRow > 0) {
            resultsString = `${currentRow} results<br><br>`;
            document.getElementById("results").innerHTML = resultsString;
            document.getElementById("results").append(table);
                var header = table.createTHead();
                var headerRow = header.insertRow(0);
                headerRow.classList.add('th');
                for(var i = 0; i < headers.length; i++) {
                    headerRow.insertCell(i).innerHTML = headers[i];
                }
        } else {
            resultsString = "No results :(";
            document.getElementById("results").innerHTML = resultsString;
        }
    table.addEventListener("click", function (e) { action(e); });
}

function toast(msg) {
    let el = document.createElement("div");
    el.setAttribute("style", `font-weight:bold;font-size:small;position:absolute;top:10px;left:20px;width:auto;text-height:20px;padding:5px;text-align:left;vertical-align:middle;background-color:green;color:white`);
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
            downloadURL(table.rows[cell.parentElement.rowIndex].cells[5].innerHTML);
            break;
        case "copy":
            copyURL(table.rows[cell.parentElement.rowIndex].cells[5].innerHTML);
            break;
        default:
    }
}

function downloadURL(url) {
    url = repoRoot + url;
    window.location.href = url;
    toast("Downloading package");
}

function copyURL(url) {
    url = repoRoot + url;
    navigator.clipboard.writeText(url);
    toast("Copied URL to clipboard");
}