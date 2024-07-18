import "reflect-metadata";
import { MessagingSystem } from "./messaging-system";

(async () => {
  const system = new MessagingSystem();
  await system.initialize();

  // Criando usuários
  const user1 = await system.createUser("Alice");
  const user2 = await system.createUser("Bob");
  const user3 = await system.createUser("Charlie");

  // Criando um grupo e adicionando membros
  const group = await system.createGroup("Friends");
  await system.addUserToGroup(user1.id, group.id);
  await system.addUserToGroup(user2.id, group.id);
  await system.addUserToGroup(user3.id, group.id);

  // Enviando mensagens para o grupo
  await system.sendMessageToGroup(
    user1.id,
    group.id,
    "Hello, Bob and Charlie!",
    "text"
  );
  await system.sendMessageToGroup(
    user2.id,
    group.id,
    "Hi, Alice and Charlie!",
    "text"
  );
  await system.sendMessageToGroup(
    user3.id,
    group.id,
    "Hello, everyone!",
    "text"
  );

  // Bob sai do grupo
  await system.removeUserFromGroup(user2.id, group.id);

  // Alice envia mais uma mensagem
  await system.sendMessageToGroup(
    user1.id,
    group.id,
    "Bob left the group.",
    "text"
  );

  // Bob entra novamente
  await system.addUserToGroup(user2.id, group.id);

  // Enviando mais mensagens para o grupo
  await system.sendMessageToGroup(
    user1.id,
    group.id,
    "Welcome back, Bob!",
    "text"
  );
  await system.sendMessageToGroup(user2.id, group.id, "Thanks, Alice!", "text");

  // Obtendo mensagens para os usuários no grupo
  const messagesForUser1 = await system.getMessagesForUserInGroup(
    user1.id,
    group.id
  );
  console.log("Messages for Alice:", messagesForUser1);

  const messagesForUser2 = await system.getMessagesForUserInGroup(
    user2.id,
    group.id
  );
  console.log("Messages for Bob:", messagesForUser2);

  const messagesForUser3 = await system.getMessagesForUserInGroup(
    user3.id,
    group.id
  );
  console.log("Messages for Charlie:", messagesForUser3);
})();
