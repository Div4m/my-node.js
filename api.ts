import http, {IncomingMessage, ServerResponse} from 'http';
import {parse} from 'url';

class User {
    constructor(
        public id: number,
        public name : string,
        public email : string
    ) {}
}

class UserManager{
    private users: User[] = [];
    private nextId : number = 1;

    getAllUsers(): User[]{
        return this.users;
    }

    addUser(name:string, email:string): User {
        const user = new User(this.nextId++, name, email)
        this.users.push(user);
        return user;
    }
    upadteUser(id:number, name?:string, email?:string ): User | null {
        const user = this.users.find(u => u.id === id);
        if(!user) return null;
        if (name) user.name = name;
        if(email) user.email = email;
        return user;
    }
    deleteUser(id:number): boolean{
        const index = this.users.findIndex(u => u.id === id );
        if (index === -1) return false;
        this.users.splice(index, 1);
        return true; 
    }
}

const userManager = new UserManager();

function sendJSON(res: ServerResponse, statusCode: number, data: any){
    res.writeHead(statusCode, {'Content-type': 'application/json'});
    res.end(JSON.stringify(data));
}

function getRequestBody(req: IncomingMessage):Promise<any>{
     return new Promise((resolve, reject)=>{
        let body = '';
        req.on('data',chunk => {
            body += chunk.toString();
        })
        req.on('end',()=>{
            try {
                resolve(JSON.parse(body));
            }
            catch (err){
                reject(err);
            }
        });
    });
}
//  Create server
const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {

    const parsedUrl = parse(req.url  || '',true);
    const method = req.method || 'GET';



     // GET /users → list all users

    if(parsedUrl.pathname === '/users' && method === 'GET'){
        return sendJSON(res,200, userManager.getAllUsers());
    }
     // POST /users → add new user
    else if (parsedUrl.pathname === '/users' && method === 'POST'){
        try{
            const body = await getRequestBody(req);
            if(!body.name || !body.email){
                return sendJSON(res,400,{error: 'Name and email are required'});
            }
            const newUser = userManager.addUser(body.name, body.email);
            return sendJSON(res,201,newUser);
        }
        catch (err){
            return sendJSON(res,500,{error: 'Internal Server Error'});
        }
    }


     // PUT /users/:id → update user

    if(parsedUrl.pathname?.startsWith('/users/') && method === 'PUT'){
        const id = parseInt(parsedUrl.pathname.split('/')[2]);
        if(isNaN(id)) 
            return sendJSON(res,400,{error: 'Invalid user ID'});
        const body = await getRequestBody(req);
        const updatedUser = userManager.upadteUser(id, body.name, body.email);
        return updatedUser ? sendJSON(res,200,updatedUser) : sendJSON(res,404,{error : 'User not found'});

    }

    
    // DELETE /users/:id → delete user

    if(parsedUrl.pathname?.startsWith('/users/')&& method === 'DELETE'){
        const id = parseInt(parsedUrl.pathname.split('/') [2]);
        if (isNaN(id)) return sendJSON(res,400,{error: 'Invalid user ID'});
        const success = userManager.deleteUser(id);
        return success ? sendJSON(res,200,{message: 'User delted'}) : sendJSON(res,404,{error: 'User not found'})
    }
    sendJSON(res,404,{error: 'User not found'});
});

const PORT = 5000;
server.listen(PORT, ()=>{
    console.log(`Server is running at http://localhost:${PORT}`);
});