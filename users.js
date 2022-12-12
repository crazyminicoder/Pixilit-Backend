class Users{
    constructor(){
        this.users=[];
    }

     

    addUser(id,name,room,color,score){
        let user={id,name,room,color,score};
        this.users.push(user);
        return user;
    }

    getPlayerScore(id){
        let score = this.users.filter((user)=> user.id === id);
        return score.map((item)=> item.score)[0];
    }

    addPlayerScore(id ,score){
        this.users.filter((user)=> {
            if(user.id === id){
                user.score = score;
            }
        });
      
    }

    getUserList(room){
        let users=this.users.filter((user) => user.room === room);
        return users;
    }

    getPlayerCount(room){
        let count = 0;
        let player = this.users.filter((item)=> item.room === room);
        player.filter((item)=>{
            if(item.id !== ""){
                count+=1;
            }
        })
        return count;
    }


    getUserColor(id){
        let user =  this.users.filter((user)=> user.id === id)[0];
        return user;
    }


    getUser(id){
        return this.users.filter((user)=> user.id === id)[0];
    }

    removeUser(id){
        let user=this.getUser(id);

        if(user){
            this.users=this.users.filter((user)=> user.id !== id);
        }
        return user;
    }
}

module.exports = {Users};