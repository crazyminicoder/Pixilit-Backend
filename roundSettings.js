class RoundSettings{
    constructor(){
        this.loby=[];
        this.currentRound=[];
        //console.log(this.loby);
    }

    currentRoundGuess(id,room,guess){
        let currentRound={id,room,guess};
        this.currentRound.push(currentRound);
        //console.log(currentRound);
        return currentRound;
    }

    getCurrentRoundGuess(id){
        let guess= this.currentRound.filter((item)=> item.id=== id);
        return guess.map((item)=> item.guess)[0];
    }

    addCurrentRoundGuess(id){
        this.currentRound.filter((item)=>{
            if(item.id === id){
                item.guess+=1;
            }
        });
        //console.log("Player id: ",id , this.currentRound);
    }

    resetCurrentRoundGuess(id){
        this.currentRound.filter((item)=>{
            if(item.id===id){
                item.guess=0;
            }
        });
    }
    
    addRoundSettings(id,round,time,room){
            let lobySettings={id,round,time,room};
        this.loby.push(lobySettings);
        console.log(this.loby);
        return lobySettings;
    }
    getRound(room){
        let loby=this.loby.filter((lobySettings)=> lobySettings.room === room);
        return loby.map((lobySettings)=> lobySettings.round)[0];
    }
    getRoomLeader(room){
        let leader = this.loby.filter((loby)=>loby.room === room);
        return leader.map((element)=>element.id)[0];
    }

    getTime(room){
        let loby=this.loby.filter((lobySettings)=> lobySettings.room === room);
        return loby.map((lobySettings)=> lobySettings.time);
    }
    
    addRounds(room){
        this.loby.filter((lobySettings)=> {
            if(lobySettings.room === room){
                lobySettings.round+=1;
            }
        });
        console.log(this.loby);
    }

    addTime(room){
        let loby=this.loby.filter((lobySettings)=> lobySettings.room === room);
        loby.map((lobySettings)=> {
            if(lobySettings.time === 5){
                lobySettings.time=5;
            }
            else{
                lobySettings.time+=1;
            }
        });
    }

    removeRounds(room){
        let loby=this.loby.filter((lobySettings)=> lobySettings.room === room);
        loby.map((lobySettings)=>{
            if(lobySettings.round === 1){
                lobySettings.round=1;
            }
            else{
                lobySettings.round-=1;
            }
        });    
    }

    removeTime(room){
        let loby=this.loby.filter((lobySettings)=> lobySettings.room === room);
        loby.map((lobySettings)=>{
            if(lobySettings.time === 1){
                lobySettings.time=1;
            }
            else{
                lobySettings.time-=1;
            }
        });    
    }

    getRoom(room){
        return this.loby.filter((lobySettings)=> lobySettings.room === room)[0];
    }

    getUser(id){
        return this.loby.filter((user)=> user.id === id)[0];
    }
   
    removeUser(id){
        let user=this.getUser(id);

        if(user){
            this.loby=this.loby.filter((user)=> user.id !== id);
        }
        return user;
    }

    removeCurrentGameData(id){
        let user = this.currentRound.filter((user)=> user.id === id)[0];
        if(user){
            this.currentRound=this.currentRound.filter((user)=> user.id !== id);
        }
        return user;
    }

    getRandomNumber(max){
        return Math.floor( Math.random() * (max - 0) + 1);
    }

    
}

module.exports = {RoundSettings};