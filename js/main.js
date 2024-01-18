// Declare globals
var products = [];
var list;

main();

function main() {
    list = readTextFile("https://esetuk.github.io/repo-downloader/res/products.csv");
    parseList(list);
    updateResult();
}

function updateResult() {
    if (products.length > 0) {
        createTable();
    } else {
        document.getElementById("results").innerHTML = "No results :("
    }
}

function parseList(list) {
    // Split list by line
    temp = list.split(/[\r\n]+/);
    // Iterate through each line
    for (let i = 0; i < temp.length; i++) {
        // Split the line by comma and remove the last comma, move it into a var
        temp[i] = temp[i].split(",").slice(0, -1)
        // Iterate over the items
        for (let j = 0; j < temp[i].length; j++) {
            // Remove any whitespace from both ends of string
            temp[i][j] = temp[i][j].trim();
        }
        //Add to master array if line not empty / includes keywords
        if ((temp[i].length != 0) && (temp[i][7].toLowerCase().includes("msi") || temp[i][7].toLowerCase().includes("exe") || temp[i][7].toLowerCase().includes("dmg"))) products.push(temp[i]);
    }
    // Remove the header (first item of array)
    products.shift();
}


function createTable() {
    var headers = ["Product", "Language", "Version", "Architecture", "Platform", "Download"];
    var table = document.createElement("TABLE");  //makes a table element for the page
    var downloadIcon = document.createElement('img');
    downloadIcon.src = "res/downloadButton.png";
    var index = 0;        
    test();
    function test() {
        var row = table.insertRow(index);
        row.insertCell(0).innerHTML = products[index][1]; // Product
        row.insertCell(1).innerHTML = products[index][3]; // Language
        row.insertCell(2).innerHTML = products[index][2]; // Version
        row.insertCell(3).innerHTML = products[index][4]; // Architecture
        row.insertCell(4).innerHTML = products[index][5]; // Platform
        row.insertCell(5).innerHTML = `<button type="button" title="Download"><img
        src="res/downloadButton.png"></img></button>`
        index++;
        let maxResults = 100
        if (index < products.length && index < maxResults) {
            document.getElementById("results").innerHTML = `Loading [${index} results]`;
            // Allow UI to function by calling timeout every ~10ms
            setTimeout(test, 0);
        } else {
            var header = table.createTHead();
            var headerRow = header.insertRow(0);
            for(var i = 0; i < headers.length; i++) {
                headerRow.insertCell(i).innerHTML = headers[i];
            }
            document.getElementById("results").innerHTML = "";
            document.getElementById("results").append(table);
        }
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