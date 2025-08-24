//Zde jsou uloženy konstany pro URL serverů a přihlašovací údaje

//Při zadání vlastního uživatele je nutné podchytit odeslaný hassh na requestu při autenitizaci
//Hash se nachází v payloadu requestu authentication


//.239
export const passwordOne:string = "1";
export const server:string = "239";
export const loginhash:string = "eyJvcGVyYXRvciI6Ik1OX1RFVFNUX0FVVE9NQVQiLCJwYXNzd29yZCI6IjEifQ==";
export const nameOne:string = "MN_TETST_AUTOMAT"; //Administrátor bez VOM na 239

/*
//.240
export const server:string = "240";
export const loginhash:string = "eyJvcGVyYXRvciI6Ik1OQSIsInBhc3N3b3JkIjoiMSJ9";  
export const nameOne:string =  "MN_WITHOUTOBCHOD"; //Uživatel se zakázaným VOM
export const password:string = "1";
*/
export const port:string = "8180";
export const baseURL = `http://192.168.130.${server}:${port}`;

