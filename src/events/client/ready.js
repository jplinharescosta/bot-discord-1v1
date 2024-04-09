export const name = "ready";
export const once = true;
export const execute = async (client) => {
  console.log(`Ready!!! ${client.user.tag} is logged in and online`);
};
