
(function(){
// **************************************************
// ******* Begin global variables declaration *******
// **************************************************

// Reference to the sequence objects array
var data;
// Reference to the drawing canvas
var canvas;
// Reference to the drawing canvas context
var ctx;
// Reference to the current sequence object
var current = {};
// Reference to the sequence array
var seq = [];
// Index of the current sequence object in the data array
var index;
// Boolean variable to indicate if a sequence has been started
var seqInProgress;
// Reference to the interval object return by the setInterval function
var interval;
// Id of the sequence table
var seqTableId;
// Id of the start button
var startBtnId;

// **************************************************
// ******* End global variables declaration *********
// **************************************************

// **************************************************
// ******* Begin drawing functions definition *******
// **************************************************

function drawText(text, context, canvas)
{
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = "bold 20px Arial";
    context.fillStyle = "black";
    context.fillText(text, canvas.width - canvas.width / 2 , canvas.height - canvas.height / 2);
}

function drawSeq()
{
    var text = seq[index];
    drawText(text, ctx, canvas);
    if (index == seq.length - 1)
    {
        resumeSeq();
        return;
    }   
    
    index ++;
}

// **************************************************
// ******* End drawing functions definition *********
// **************************************************

// ******************************************************
// ******* Begin sequence management functions definition
// ******************************************************

function createSeq()
{
    seq = ["", "Ready", ""];
    for (var i = 0, j = 0; i < (current.seq.length * current.repetition); i++, j = (j + 1) % current.seq.length)
    {
        seq.push(current.seq[j], "");
    }
    seq.push("Done");
    console.log(seq);
}

function resumeSeq()
{
    seqInProgress = false;
    clearInterval(interval);
    index = 0;
    drawText(seq[seq.length - 1], ctx, canvas);
    seq = [];
    
    var btn = document.getElementById(startBtnId);
    if (btn)
    {
        btn.value = "start";
    }
}

function startSeq()
{
    var seq = getSelectedSequence();
    if (seq)
    {
        seqInProgress = true;
        current = data.find(s => s.name == seq);
        createSeq();
        interval = setInterval(drawSeq, current.period / 2);
    }
    
    var btn = document.getElementById(startBtnId);
    if (btn)
    {
        btn.value = "stop";
    }
}

function start()
{
    var button = this;
    if (button.value == "start")
    {
        startSeq();
    }
    else if (button.value == "stop")
    {
        resumeSeq();
    }
}

function getSelectedSequence()
{
    let row = document.querySelector("tr[data-row-state]");
    if (row)
    {
        if (row.firstChild)
        {
            return row.firstChild.innerHTML;
        }
    }
    
    return "";
}

// ***********************************************************
// ******* Begin initialization functions definition *********
// ***********************************************************

function initVar()
{

    canvas = document.getElementById("seqCanvas");
    ctx = canvas.getContext("2d");
    clear = false;
    data = [{name: "Seq 1", seq: ["Right", "Cross", "Hook", "Hook"], period: 1000, repetition: 2},
            {name: "Seq 2", seq: ["Cross", "Cross", "Hook", "Hook"], period: 2000, repetition: 4}];
    index = 0;
    current = data[0];
    seqInProgress = false;
    seqTableId = "seqTable";
    startBtnId = "startBtn";
}

function addEventListenerOnCells(cells, action, eventName)
{
    if (!cells)
        return;
    cells.forEach(c => {/*c.onclick = action;*/ c.addEventListener(eventName, action);});
}

function initTable(tableId)
{
    let table = document.getElementById(tableId);
    generateHeader(table, Object.keys(data[0] || {}));
    generateTable(table, data);
    
    let cells = document.querySelectorAll("table[id=" + tableId + "] td");
    addEventListenerOnCells(cells, editTableCell, 'dblclick');
    addEventListenerOnCells(cells, selectTableRow, 'click');

    let rows = document.querySelectorAll("table[id=seqTable] tr");
    if (!rows)
        return;
    if (rows.length > 1)
    {
        rows[1].setAttribute("data-row-state", "selected");
    }
}

function initButton()
{
    var startBtn = document.getElementById(startBtnId);
    startBtn.addEventListener('click', start);
    var testBtn = document.getElementById("test");
    testBtn.addEventListener('click', addTableRow);
    var delBtn = document.getElementById("delete");
    delBtn.addEventListener('click', deleteSelectedTableRow);

}
    
function initPage()
{
    initVar();
    initTable(seqTableId);
    initButton();
}  
    
window.onload = initPage();
    

function editTableCell()
{
    console.log("edit");
    if (seqInProgress)
        return;
        
    if (this.getAttribute("data-cell-state"))
        return;
    
    let text = this.innerHTML;
    let input = document.createElement("input");
    input.value = text;
    input.type = "text";
    this.innerHTML = "";
    this.appendChild(input);
    this.setAttribute("data-cell-state", "edit");
    input.focus();
    input.onblur = function()
    {
        this.parentNode.removeAttribute("data-cell-state");
        this.parentNode.innerHTML = this.value;
    }
    input.onkeypress = function(e)
    {
        if (e.keyCode === 13)
        {
            this.parentNode.removeAttribute("data-cell-state");
            this.parentNode.innerHTML = this.value;
        }
    }
}

function selectTableRow()
{
    console.log("select");
    if (seqInProgress)
        return;


    
    var curRow = this.parentNode;
    
   
    var prevRow = document.querySelector("tr[data-row-state]");
    if (prevRow === curRow)
    {
        return;
    }
    
    if (prevRow)
    {
        prevRow.removeAttribute("data-row-state");
    }
    curRow.setAttribute("data-row-state", "selected");
}
    
function generateHeader(table, header)
{
    if (!table)
        return;
    var row = table.insertRow();
    
    for (let key of header)
    {
        let th = document.createElement("th");
        let text = document.createTextNode(key);
        th.appendChild(text);
        row.appendChild(th);
    
    }
}

function addTableRow()
{
    let table = document.getElementById(seqTableId);

    let header = table.querySelectorAll('th');
 
    let newRow = table.insertRow();
    
   
    for (var i = 0, nbCell = header.length; i < nbCell; i++) 
    {
        let newCell = newRow.insertCell(i);
        newCell.innerHTML = "Click to edit";
        newCell.addEventListener('dblclick', editTableCell);
        newCell.addEventListener('click', selectTableRow);

        if (i == nbCell - 1)
        {
            newCell.click();
        }
    }
}

function deleteSelectedTableRow()
{
    let table = document.getElementById(seqTableId);
    if (table)
    {
        let nbRows = table.rows.length;
        if (nbRows == 1)
        {
            return;
        }

        let selectedRow = table.querySelector("tr[data-row-state]");
        if (selectedRow)
        {
            let prevRow = selectedRow.previousSibling;
            table.deleteRow(selectedRow.rowIndex);

            if (prevRow !== null && nbRows > 2)
            {
              prevRow.firstChild.click();
            }
           
        }
    }
}

function generateTable(table, data)
{
    if (!table)
        return;
    for (let element of data)
    {
        row = table.insertRow();
        for (let key in element)
        {
            let cell = row.insertCell();
            let text = document.createTextNode(element[key]);
            cell.appendChild(text);
        }
    }
}
})()
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    