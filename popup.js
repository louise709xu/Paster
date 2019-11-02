/* Begin utility functions */

function formatInput(input){
  // Prevent html injection
  input = input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return input;
}

function addTextToTable(pastedText, tableName){
  var table = document.getElementById(tableName);
  var row = table.insertRow(0);
  var pasteCell = row.insertCell(0);
  var funcButtonCell = row.insertCell(1);
  var copyButtonCell = row.insertCell(2);
  pasteCell.classList.add("textCell");
  funcButtonCell.classList.add("buttonCell");
  copyButtonCell.classList.add("buttonCell");
  
  pasteCell.innerHTML = pastedText
  if(tableName === "recentTable"){
    funcButtonCell.innerHTML = "<button class='rowButton fav'></button>";
  }
  else if(tableName === "favoritesTable"){
    funcButtonCell.innerHTML = "<button class='rowButton del'></button>";
  }
  copyButtonCell.innerHTML = "<button class='rowButton copy'></button>";
}

/* End utility functions */



/* Begin save functions */

function saveToRecent() {
  var pastedText = formatInput(document.getElementById("textbox").value);
  
  if(pastedText != ""){
    addTextToTable(pastedText, 'recentTable');
    
    chrome.storage.sync.get("recent", function(data) {
      data.recent.push(pastedText);
      chrome.storage.sync.set({"recent": data.recent}, function() {});
      
    });  
    
  }
  
  document.getElementById("textbox").value = "";
}

function saveToFavorites(event){
  var cell = event.target.parentNode.previousSibling;
  
  if(cell.innerHTML != ""){
    
    chrome.storage.sync.get("favorites", function(data) {
      if(!data.favorites.includes(cell.innerHTML)){
        data.favorites.push(cell.innerHTML);
        chrome.storage.sync.set({"favorites": data.favorites}, function() {});
        
        addTextToTable(cell.innerHTML, 'favoritesTable');
      }
    });  
  }
  
}

function copyToClipboard(event){
  var cell = event.target.parentNode.previousSibling.previousSibling;
  var copyText = cell.innerHTML;
  
  // Create a "hidden" input
  var temp = document.createElement("input");
  temp.setAttribute("value", copyText);
  document.body.appendChild(temp);

  temp.select();
  document.execCommand("copy");

  document.body.removeChild(temp);
}

function deleteFromFavorites(event){
  var cell = event.target.parentNode.previousSibling;
  var row = cell.parentNode;
  row.parentNode.removeChild(row);
   
  chrome.storage.sync.get("favorites", function(data) {
    index = data.favorites.indexOf(cell.innerHTML);
    console.log(data);
    console.log(cell.innerHTML);
    console.log(index);
    if(index != -1){
      data.favorites.splice(index, 1);
      chrome.storage.sync.set({"favorites": data.favorites}, function() {});
    }
  });  
}

document.querySelector('.submit').addEventListener('click', function (evt) {
  evt.preventDefault();
  saveToRecent();
})

document.getElementById("clearRecentButton").addEventListener('click', function (evt) {
  evt.preventDefault();
  chrome.storage.sync.remove("recent");
  var table = document.getElementById("recentTable");
  table.innerHTML = "";
})

document.getElementById("recentTable").addEventListener('click', function (evt) {
  // if favorite button clicked
  if(evt.target.matches(".fav")){
    saveToFavorites(evt);
  }
  // if copy button clicked
  else if(evt.target.matches(".copy")){
    copyToClipboard(evt);
  }
})

document.getElementById("favoritesTable").addEventListener('click', function (evt) {
  // if favorite button clicked
  if(evt.target.matches(".del")){
    deleteFromFavorites(evt);
  }
  // if copy button clicked
  else if(evt.target.matches(".copy")){
    copyToClipboard(evt);
  }
})

/* End save functions */



/* Begin tab functions */

function openTab(evt, tabName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

document.getElementById("recentButton").addEventListener('click', function (evt) {
  openTab(evt, "recentTab");
})

document.getElementById("favoritesButton").addEventListener('click', function (evt) {
  openTab(evt, "favoritesTab");
})

document.getElementsByClassName('tablinks')[0].click()

/* End tab functions */



window.addEventListener('load', function (evt) {
  
  chrome.storage.sync.get("recent", function(data) {
    if (data.recent === null || data.recent === undefined) {
      let empty = new Array();
      chrome.storage.sync.set({recent: empty}, function() {})
    } else {
      for (index in data.recent) {
        addTextToTable(data.recent[index], 'recentTable');
      }
    }
  });
  
  chrome.storage.sync.get("favorites", function(data) {
    if (data.favorites === null || data.favorites === undefined) {
      let empty = new Array();
      chrome.storage.sync.set({favorites: empty}, function() {})
    } else {
      for (index in data.favorites) {
        addTextToTable(data.favorites[index], 'favoritesTable');
      }
    }
  });
  
})