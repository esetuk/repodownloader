var items = [];
var products = [];
var list;

main();

const selects = document.querySelectorAll('.selects');

 selects.forEach(el => el.addEventListener('change', event => { 
      createTable();
     }));

function main() {
    list = readTextFile("https://esetuk.github.io/repo-downloader/res/products2.csv");
    parseList(list);
    updateResult();
}

function updateResult() {
    if (items.length > 0) {
        createTable();
    } else {
        document.getElementById("results").innerHTML = "No results :("
    }
}

function parseList(list) {
    temp = list.split(/[\r\n]+/);
    for (let i = 0; i < temp.length; i++) {
        temp[i] = temp[i].split(",").slice(0, -1)
        for (let j = 0; j < temp[i].length; j++) {
            temp[i][j] = temp[i][j].trim();
        }
        if ((temp[i].length != 0) && (temp[i][7].toLowerCase().includes("xxx") || temp[i][7].toLowerCase().includes("xxx") || temp[i][7].toLowerCase().includes("msi"))) items.push(temp[i]);
        //----HERE----
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
    console.log(items);
}


function createTable() {
    document.getElementById("results").innerHTML = "";
    let headers = ["Product", "Language", "Version", "Architecture", "Platform", ""];
    let table = document.createElement("table");
    table.classList.add('center');
    let downloadIcon = document.createElement('img');
    downloadIcon.src = "res/downloadButton.png";
    let index = 0;        
    let e = document.getElementById("product");
    let selected = e.options[e.selectedIndex].value;
    let currentRow = 0;
    console.log("Selected: " + selected);
    createRow();
    function createRow() {
        let maxResults = 100;
        if (items[index][1] == selected) {
            let row = table.insertRow(currentRow);
            row.insertCell(0).innerHTML = items[index][1]; // Product
            row.insertCell(1).innerHTML = items[index][3]; // Language
            row.insertCell(2).innerHTML = items[index][2]; // Version
            row.insertCell(3).innerHTML = items[index][4]; // Architecture
            row.insertCell(4).innerHTML = items[index][5]; // Platform
            row.insertCell(5).innerHTML = `<a href="">Download</a> | <a href="">Copy link</a>`;
            currentRow++;
        }
        if (index < items.length && index < maxResults) {
            document.getElementById("results").innerHTML = `Loading [${index} results]`;
            setTimeout(createRow, 0);
        } else {
            var header = table.createTHead();
            var headerRow = header.insertRow(0);
            headerRow.classList.add('th');
            for(var i = 0; i < headers.length; i++) {
                headerRow.insertCell(i).innerHTML = headers[i];
            }
            document.getElementById("results").append(table);
            }
        index++;
    }
}

function toast(msg) {
    let el = document.createElement("div");
    el.setAttribute("style", `font-size:medium;position:absolute;top:10px;left:20px;width:100px;text-height:20px;padding:5px;text-align:left;vertical-align:middle;background-color:black;`);
    el.innerHTML = msg;
    setTimeout(function () {
        el.parentNode.removeChild(el);
    }, 3000);
    document.body.appendChild(el);
}

function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    } else {
        pom.click();
    }
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