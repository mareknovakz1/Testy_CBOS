//Zde jsou uloženy konstany pro URL serverů a přihlašovací údaje

//Při zadání vlastního uživatele je nutné podchytit odeslaný hassh na requestu při autenitizaci
//Hash se nachází v payloadu requestu authentication
export const loginhash:string = "eyJvcGVyYXRvciI6Ik1OQSIsInBhc3N3b3JkIjoiMSJ9"; 
export const server:string = "240";
export const port:string = "8180";
export const baseURL = `http://192.168.130.${server}:${port}`;
