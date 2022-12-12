const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const {Server} = require("socket.io");
const {Users} = require('./users');
const {RoundSettings} = require('./roundSettings');
const {Data} =require('./data');
require("dotenv").config();

app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        methods: ["GET","POST"],
    },
});

let users= new Users();
let array=[];
let round = new RoundSettings();
let movieData = new Data();


io.on("connection",(socket) => {
    console.log("Connected at",socket.id);

    {/*Join Loby*/}
    socket.on("join_room", (data) => {
        socket.join(data.room_id);
        console.log(`User With ID:  ${socket.id} and name: ${data.name} joined room: ${data.room_id} `);
        users.addUser(socket.id, data.name, data.room_id, data.color,0);
        array=users.getUserList(data.room_id);
        if(!round.getRoom(data.room_id)){
            round.addRoundSettings(socket.id, 1,1,data.room_id);
        }
        {/*Updating the Leader*/}
        io.to(data.room_id).emit("updateLeader",round.getRoomLeader(data.room_id));
        console.log("Server leader: ",round.getRoomLeader(data.room_id))
        {/*Updating all users about other users on Join*/}
        io.to(data.room_id).emit("updateUserList", array);
        {/*Updating Rounds on Join*/}
        io.to(data.room_id).emit("updatedRoundNumber", round.getRound(data.room_id));
        {/*Updating Round Time on Join*/}
        io.to(data.room_id).emit("updateRoundTime",round.getTime(data.room_id));
        io.to(data.room_id).emit("playSound",true);
       // console.log("User Score: ",users.getPlayerScore(socket.id));
       // console.log("User Color: ",users.getUserColor(socket.id));
    });

    

  socket.on("incrementRound", (data)=>{
    round.addRounds(data);
    io.to(data).emit("updatedRoundNumber", round.getRound(data));
  })

  socket.on("decreaseRound",(data)=>{
    round.removeRounds(data);
        io.to(data).emit("updatedRoundNumber", round.getRound(data));
   
  })

  socket.on("increaseTime", (data)=>{
   round.addTime(data);
    io.to(data).emit("updateRoundTime",round.getTime(data));
  })

  socket.on("decreaseTime",(data)=>{
    round.removeTime(data);
        io.to(data).emit("updateRoundTime",round.getTime(data));
  })

  {/*Joining the main game room*/}
  socket.on("GameRoomData", (data)=>{
    socket.join(data.room);
    io.to(data.room).emit("UpdateGameRoomData",users.getUserList(data.room));
    io.to(data.room).emit("nextRoom",true);
    //console.log("Count inside user class: ",users.getPlayerCount(data.room));
   
    })

  socket.on("getMovieData",(data)=>{
    let randomNumber = movieData.getRandomNumber();
    let list=movieData.getMovie(randomNumber);
    let leader = round.getRoomLeader(data.room);
    console.log("Leader: ",leader);
    if(socket.id === leader && data.count === 1){  
      io.to(data.room).emit("receiveMovieData",list);
      console.log("Inside emit list");
      console.log("Movie:", list);
      }
  })

  socket.on("updateCurrentRoundGuess",()=>{
    round.resetCurrentRoundGuess(socket.id);
  })

socket.on("setCurrentRoundGuess",(data)=>{
  round.currentRoundGuess(socket.id,data,0);
  //console.log("users in the room: ",users.getUserList(data));
  //console.log("guess: ",round.getCurrentRoundGuess(socket.id)); 
})

socket.on("checkForAllPlayersHasGuessed",(data)=>{
  let playerCount = 0;
  let guessCount = 0;
  let playerData = users.getUserList(data.room);
  playerData.filter((item)=>{
    if(item.id !==""){
      playerCount+=1;
      if(round.getCurrentRoundGuess(item.id) === 1){
        guessCount+=1;
      }
    }
  })
  if(playerCount === guessCount){
    socket.emit("AllPlayersHasGuessed",true);
  }
})

socket.on("checkForRounds",(data)=>{
  let gameRound= round.getRound(data.room);
  if(data.rounds > gameRound){
    socket.emit("GameOver",true);
  }
})


  {/*Generating random number by calling random number function from the round settings class*/}
  socket.on("getRandomNumber",(data)=>{
   let number =  round.getRandomNumber(data.length);
    io.to(data.room).emit("receiveRandomNumber",number);
  })

  {/*Receiving and sending messages*/}
  socket.on("send_message", (data) => {
    let color1 = users.getUserColor(socket.id);
    let {color} = color1;
    //console.log("color: ",color);
    let messageGuessed, guessedColor;
    //console.log("guessed: ",data.guessed);
    if(data.guessed){
      messageGuessed=`${data.author} has guessed!!!`;
      guessedColor = "green";
      round.addCurrentRoundGuess(socket.id);
    }
    else{
      messageGuessed = data.message;
      guessedColor="white";
    }
    let score = users.getPlayerScore(socket.id);
    let totalRoundTime= round.getTime(data.room)[0];
    totalRoundTime*=60;
    //console.log("Number of rounds: ",totalRoundTime);
    //console.log("Current time: ",data.time);
    //console.log("Getting player score",users.getPlayerScore(socket.id));
    //console.log("Has guessed: ",data.guessed);
    //console.log("Guess Count: ",data.guessCount);
    //console.log("92%",Math.floor((totalRoundTime*92)/100));
    //console.log("75%",Math.floor((totalRoundTime*75)/100));
    //console.log("50%",Math.floor((totalRoundTime*50)/100));
    //console.log("25%", Math.floor((totalRoundTime*25)/100));
    //console.log("Getting current round guess: ",round.getCurrentRoundGuess(socket.id));
    if(round.getCurrentRoundGuess(socket.id) === 1 && data.guessed){
      //console.log("Inside guess if");
      if(data.time >= Math.floor((totalRoundTime*92)/100) ){
        let basePoints = 150;
        //console.log("in 150");
        if(data.word.leader <5 ){
          score+=basePoints;
        }
        if(data.word.length >= 5 && data.word.length <=10){
          score+=basePoints + 50;
        }
        if(data.word.length >= 11 && data.word.length <=15){
          score+=basePoints + 75;
        }
        if(data.word.length >= 16 && data.word.length <=20){
          score+=basePoints + 100;
        }
        if(data.word.length >= 21 && data.word.length <=25){
          score+=basePoints + 125;
        }
        if(data.word.length >= 26){
          score+=basePoints + 150;
        }
        
      }
      else if(data.time >= Math.floor((totalRoundTime*75)/100) && data.time <= Math.floor((totalRoundTime*92)/100) ){
        //console.log("in 100");
        let basePoints = 100;
        if(data.word.leader <5 ){
          score+=basePoints;
        }
        if(data.word.length >= 5 && data.word.length <=12){
          score+=basePoints + 25;
        }
        if(data.word.length >= 13 && data.word.length <=20){
          score+=basePoints + 50;
        }
        if(data.word.length >= 21 && data.word.length <=28){
          score+=basePoints + 75;
        }
        if(data.word.length >= 29){
          score+=basePoints + 100;
        }
      }
      else if(data.time >= Math.floor((totalRoundTime*50)/100) && data.time <= Math.floor((totalRoundTime*75)/100) ){
        //console.log("in 75");
        let basePoints =75;
        if(data.word.leader <5 ){
          score+=basePoints;
        }
        if(data.word.length >= 5 && data.word.length <=15){
          score+=basePoints + 30;
        }
        if(data.word.length >= 16 && data.word.length <=25){
          score+=basePoints + 45;
        }
        if(data.word.length >= 26){
          score+=basePoints + 60;
        }
      }
      else if(data.time >= Math.floor((totalRoundTime*25)/100) && data.time <=   Math.floor((totalRoundTime*50)/100) ){
        //console.log("in 50");
        let basePoints =50;
        if(data.word.leader <5 ){
          score+=basePoints;
        }
        if(data.word.length >= 5 && data.word.length <=20){
          score+=basePoints + 20;
        }
        if(data.word.length >= 21){
          score+=basePoints + 40;
        }
      }
      else{
        //console.log("in 25");
        score+=35;
      }
      io.to(data.room).emit("playerHasGuessedSound", true);
    }
    users.addPlayerScore(socket.id, score);
    //console.log("User Score after calculating: ",users.getPlayerScore(socket.id));
    const messageData = {
      room: data.room,
      author: data.author,
      message: messageGuessed,
      color:color,
      guessedColor:guessedColor
    };
    //console.log(messageData);
    //sending back the message to other users
    socket.to(data.room).emit("receive_message", messageData);
    //updating the room with the updated scores
    io.to(data.room).emit("UpdateGameRoomData", users.getUserList(data.room));
  });

  socket.on("getGameTime",(data)=>{
    let roundTime= round.getTime(data);
    //console.log("Round Time", roundTime);
    io.to(data).emit("gameTime",roundTime);
  })
  

    {/*Disconnecting players*/}
    socket.on("disconnect", () =>{
        let user = users.removeUser(socket.id);
        let rnd = round.removeUser(socket.id);
        {/*If the user left in the loby or during the match updating the users list*/}
        if(user || rnd){
            io.to(user.room).emit("updateUserList", users.getUserList(user.room));
            
            io.to(user.room).emit("UpdateGameRoomData", users.getUserList(user.room));
            io.to(user.room).emit("playLeaveSound", true);
            round.removeCurrentGameData(socket.id);
        }
        console.log("Disconnected from",socket.id);
       
    })
})

server.listen(process.env.PORT || 3001, () =>{
    console.log("Server Running");
});