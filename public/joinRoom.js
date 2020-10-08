function joinRoom(roomName) {
    //Send this roomName to the server
    nsSocket.emit('joinRoom',roomName)
    nsSocket.on('history',(history) => {
        const messagesUl = document.querySelector('#messages')
        messagesUl.innerHTML = ""
        history.forEach((msg) => {
            const newMsg = buildHTML(msg)
            const currentMessages = messagesUl.innerHTML
            messagesUl.innerHTML = currentMessages + newMsg
        })
        messagesUl.scrollTo(0,messagesUl.scrollHeight)
    })
    nsSocket.on('updateMembers',(numberofMembers) => {
        document.querySelector('.curr-room-num-users').innerHTML = `${numberofMembers} <span class="glyphicon glyphicon-user"></span>`
        document.querySelector('.curr-room-text').innerText = `${roomName}`

    })

    let searchBox = document.querySelector('#search-box')
    searchBox.addEventListener('input',(e) => {
        console.log(e.target.value)
        let messages = Array.from(document.getElementsByClassName('message-text'))
        console.log(messages)
        messages.forEach((msg) => {
            if(msg.innerText.toLowerCase().indexOf(e.target.value.toLowerCase()) === -1)    {
                msg.style.display = "none"
            }
            else    {
                msg.style.display = "block"
            }
        })
    })
}