import { invoke } from "@tauri-apps/api/tauri";
import Database from "tauri-plugin-sql-api";
import { User, Credential } from "./models";

let db: Database;
export const load = () =>
  Database.load("sqlite:manager.db")
    .then((instance) => {
      db = instance;
      return db;
    })
    .catch((err) => {
      console.error(err);
    });

export const checkDb = () => {
  if (db === undefined) {
    throw new Error("Base de datos no ha sido cargada");
  }
};

export async function registerUser({
  username,
  password,
  email,
  first_name = "",
  last_name = "",
}: User) {
  checkDb();
  const user = await getUser(username);
  if (typeof user !== "string") throw new Error("Nombre de usuario ya existe");

  let hash = (await invoke("hash", { password })) as string;
  const { lastInsertId } = await db.execute(
    "INSERT INTO users (first_name, last_name, email, password, username) VALUES ($1, $2, $3, $4, $5)",
    [first_name, last_name, email, hash, username]
  );
  return { username, id: lastInsertId, email, first_name, last_name };
}

export async function getUser(username: string) {
  checkDb();
  const users = await db.select<User[]>(
    "SELECT * from users WHERE username = $1",
    [username]
  );
  if (users.length === 0) {
    return "Nombre de usuario no encontrado";
  }
  return users[0];
}

export async function userLogin(username: string, password: string) {
  checkDb();
  const user = await getUser(username);
  if (typeof user === "string") throw new Error(user);
  const hashedPassword = user.password;
  let isPasswordCorrect = (await invoke("verify", {
    hashedPassword,
    password,
  })) as boolean;

  if (!isPasswordCorrect) throw new Error("Usuario o contraseña incorrecta");

  return { ...user, password: undefined };
}

export async function getCredentials(username: string) {
  checkDb();
  const credentials = await db.select<Credential[]>(
    "SELECT * FROM credentials WHERE user_username = ?",
    [username]
  );
  return credentials;
}

export async function createCredential({
  username,
  password,
  url,
  name,
  user_username,
}: Omit<Credential, "id">): Promise<Credential> {
  checkDb();

  let encrypted = (await invoke("encrypt", { password })) as string;
  const { lastInsertId } = await db.execute(
    "INSERT INTO credentials (username, name, password, url, user_username) VALUES ($1, $2, $3, $4, $5)",
    [username, name, encrypted, url, user_username]
  );
  return {
    id: lastInsertId,
    username,
    name,
    password: encrypted,
    url,
    user_username,
  };
}

export async function deleteCredential(id: number) {
  checkDb();
  const { rowsAffected } = await db.execute(
    "DELETE FROM credentials WHERE id = ?",
    [id]
  );
  if (rowsAffected === 0) throw new Error("Credencial no encontrada");
}

export async function editCredential({
  id,
  username,
  password,
  url,
  name,
  user_username,
}: Credential): Promise<Credential> {
  checkDb();
  let encrypted = (await invoke("encrypt", { password })) as string;
  const { rowsAffected } = await db.execute(
    "UPDATE credentials SET username = $1, name = $2, password = $3, url = $4 WHERE id = $5",
    [username, name, encrypted, url, id]
  );
  if (rowsAffected === 0) throw new Error("Credencial no encontrada");
  return { id, username, name, password: encrypted, url, user_username };
}
