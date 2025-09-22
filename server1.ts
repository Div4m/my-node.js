import http, { IncomingMessage, ServerResponse } from "http";
import { parse } from "url";

// ✅ OOP User Class
class User {
  constructor(
    public id: number,
    public name: string,
    public email: string
  ) {}
}

// ✅ OOP User Manager
class UserManager {
  private users: User[] = [];
  private nextId = 1;

  getAllUsers() {
    return this.users;
  }

  addUser(name: string, email: string) {
    const user = new User(this.nextId++, name, email);
    this.users.push(user);
    return user;
  }

  updateUser(id: number, name: string, email: string) {
    const user = this.users.find(u => u.id === id);
    if (!user) return null;
    user.name = name;
    user.email = email;
    return user;
  }

  deleteUser(id: number) {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    this.users.splice(index, 1);
    return true;
  }
}

const userManager = new UserManager();

// ✅ Helper to parse request body
async function getRequestBody(req: IncomingMessage) {
  return new Promise<any>((resolve, reject) => {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
  });
}

// ✅ Helper to send JSON
function sendJSON(res: ServerResponse, status: number, data: any) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

// ✅ Server
const server = http.createServer(async (req, res) => {
  const parsedUrl = parse(req.url || "", true);
  const method = req.method || "GET";

  // CORS (so frontend can talk to backend)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  // GET all users
  if (parsedUrl.pathname === "/users" && method === "GET") {
    return sendJSON(res, 200, userManager.getAllUsers());
  }

  // POST new user
  if (parsedUrl.pathname === "/users" && method === "POST") {
    try {
      const body = await getRequestBody(req);
      const user = userManager.addUser(body.name, body.email);
      return sendJSON(res, 201, user);
    } catch {
      return sendJSON(res, 400, { error: "Invalid JSON" });
    }
  }

  // PUT update user
  if (parsedUrl.pathname?.startsWith("/users/") && method === "PUT") {
    const id = parseInt(parsedUrl.pathname.split("/")[2]);
    try {
      const body = await getRequestBody(req);
      const user = userManager.updateUser(id, body.name, body.email);
      return user
        ? sendJSON(res, 200, user)
        : sendJSON(res, 404, { error: "User not found" });
    } catch {
      return sendJSON(res, 400, { error: "Invalid JSON" });
    }
  }

  // DELETE user
  if (parsedUrl.pathname?.startsWith("/users/") && method === "DELETE") {
    const id = parseInt(parsedUrl.pathname.split("/")[2]);
    const success = userManager.deleteUser(id);
    return success
      ? sendJSON(res, 200, { message: "User deleted" })
      : sendJSON(res, 404, { error: "User not found" });
  }

  // Not found
  sendJSON(res, 404, { error: "Not Found" });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
