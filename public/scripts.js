const username = prompt("Enter Username:")
const socket = io('http://localhost:9000/',{
    query: {
        username
    }
})
let nsSocket = ""
//listen for nsList, which is a list of all the namespaces.

socket.on('nsList',(nsData) => {
    // console.log(nsData)
    let namespacesDiv = document.querySelector('.namespaces')
    namespacesDiv .innerHTML = ""
    nsData.forEach((ns) => {
        namespacesDiv.innerHTML += `<div class = "namespace" ns = ${ns.endpoint}><img src="${ns.img}"/></div>`
    })

    //add a click listener for each namespace

    Array.from(document.getElementsByClassName('namespace')).forEach((ele) => {
        // console.log(ele)
        ele.addEventListener('click',(e) => {
            const nsEndpoint = ele.getAttribute('ns');
            console.log(nsEndpoint)
            joinNS(nsEndpoint)
        })
    })

    
})