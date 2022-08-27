export interface User {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  username: string;
}

export interface Credential {
  id: number;
  username: string;
  user_username: string;
  password: string;
  url: string;
  name: string;
}
