var socket = io();

function toggle(divID){
    var element = document.getElementById(divID);
    if(element.style.display === "none"){
        element.style.display = "block";
    }else{
        element.style.display = "none";
    }
}