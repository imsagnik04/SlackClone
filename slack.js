const express = require('express')
const app = express()
const socketio = require('socket.io')
let namespaces = require('./data/namespaces');

app.use(express.static(__dirname + '/public'))
const expressServer = app.listen(9000)
const io = socketio(expressServer)

io.on('connection',(socket) => {
    //build an array to send back with the img and endpoint of each namespace
   let nsData = namespaces.map((ns) => {
       return{
           img: ns.img,
           endpoint: ns.endpoint
       }
   })
   //send the nsData back to the client. We need to use socket NOT io, because we want it to go to just this client.
   socket.emit('nsList',nsData)

})

//loop through each namespace and listen for a connection
namespaces.forEach((namespace) => {
    // console.log(namespace)
    io.of(namespace.endpoint).on('connection',(nsSocket) => {
        const username = nsSocket.handshake.query.username
        // console.log(`${nsSocket.id} has joined ${namespace.endpoint}`)

        //a socket has connected to one of our chatgroup namespaces.
        //send that ns group info back

        nsSocket.emit('nsRoomLoad',namespace.rooms)

        nsSocket.on('joinRoom',(roomToJoin) => {
            //deal with history...once we have it
            const roomToLeave = Object.keys(nsSocket.rooms)[1]
            nsSocket.leave(roomToLeave)
            updateUsersInRoom(namespace, roomToLeave)
            console.log(nsSocket.rooms)
            nsSocket.join(roomToJoin)
            const nsRoom = namespace.rooms.find((room) => {
                return room.roomTitle === roomToJoin
            })
            nsSocket.emit('history', nsRoom.history)
            updateUsersInRoom(namespace, roomToJoin)
            
        })
        nsSocket.on('newMessageToServer',(msg) => {
            const fullMsg = {
                text: msg.text,
                time: Date.now(),
                username: username,
                avatar: 'https://via.placeholder.com/30'
            }
            //send this message to ALL the sockets that are in the eoom that THIS socket is in
            //how can we find out what room THIS socket is in?
            //the user will be in the 2nd room in the object list
            //this is because the socket ALWAYS joins its own roomon connection
            // get the keys
            const roomTitle = Object.keys(nsSocket.rooms)[1]
            //we need to find the Room object for this room
            const nsRoom = namespace.rooms.find((room) => {
                return room.roomTitle === roomTitle
            })
            nsRoom.addMessage(fullMsg)
            io.of(namespace.endpoint).to(roomTitle).emit('messageToClient',fullMsg)
        })
    })
})

function updateUsersInRoom(namespace, roomToJoin)    {
    //send back number of users in this room to ALL sockets connected to this room
    io.of(namespace.endpoint).in(roomToJoin).clients((error, clients) => {
        io.of(namespace.endpoint).in(roomToJoin).emit('updateMembers',clients.length)
    })
}