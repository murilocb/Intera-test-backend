import { AppDataSource } from "./data-source";
import { User, Group, GroupMember, Message } from "./entities";
import { IsNull, LessThanOrEqual, MoreThanOrEqual } from "typeorm";

export class MessagingSystem {
  async initialize() {
    await AppDataSource.initialize();
  }

  async createUser(name: string): Promise<User> {
    const userRepository = AppDataSource.getRepository(User);
    const user = new User();
    user.name = name;
    return await userRepository.save(user);
  }

  async createGroup(name: string): Promise<Group> {
    const groupRepository = AppDataSource.getRepository(Group);
    const group = new Group();
    group.name = name;
    return await groupRepository.save(group);
  }

  async addUserToGroup(userId: number, groupId: number) {
    const userRepository = AppDataSource.getRepository(User);
    const groupRepository = AppDataSource.getRepository(Group);
    const groupMemberRepository = AppDataSource.getRepository(GroupMember);

    const user = await userRepository.findOneByOrFail({ id: userId });
    const group = await groupRepository.findOneByOrFail({ id: groupId });

    const groupMember = new GroupMember();
    groupMember.user = user;
    groupMember.group = group;
    await groupMemberRepository.save(groupMember);
  }

  async removeUserFromGroup(userId: number, groupId: number) {
    const groupMemberRepository = AppDataSource.getRepository(GroupMember);

    // Logs para depuração
    console.log(
      `Searching for GroupMember with userId: ${userId} and groupId: ${groupId}`
    );

    const groupMember = await groupMemberRepository.findOne({
      where: {
        user: { id: userId },
        group: { id: groupId },
        leftAt: IsNull(),
      },
      relations: ["user", "group"],
    });

    // Logs para depuração
    if (groupMember) {
      console.log(`Found GroupMember: ${JSON.stringify(groupMember)}`);
    } else {
      console.log(
        `No GroupMember found with userId: ${userId} and groupId: ${groupId}`
      );
    }

    if (!groupMember) {
      throw new Error(
        `GroupMember with userId ${userId} and groupId ${groupId} not found or already left.`
      );
    }

    groupMember.leftAt = new Date();
    await groupMemberRepository.save(groupMember);

    // Log para confirmar atualização
    console.log(`Updated GroupMember: ${JSON.stringify(groupMember)}`);
  }

  async sendMessageToGroup(
    senderId: number,
    groupId: number,
    content: string,
    type: "text" | "video" | "audio"
  ) {
    const messageRepository = AppDataSource.getRepository(Message);
    const userRepository = AppDataSource.getRepository(User);
    const groupRepository = AppDataSource.getRepository(Group);

    const sender = await userRepository.findOneByOrFail({ id: senderId });
    const group = await groupRepository.findOneByOrFail({ id: groupId });

    const message = new Message();
    message.content = content;
    message.type = type;
    message.sender = sender;
    message.group = group;

    await messageRepository.save(message);
  }

  async getMessagesForUserInGroup(
    userId: number,
    groupId: number
  ): Promise<Message[]> {
    const groupMemberRepository = AppDataSource.getRepository(GroupMember);
    const messageRepository = AppDataSource.getRepository(Message);

    const groupMemberships = await groupMemberRepository.find({
      where: { user: { id: userId }, group: { id: groupId } },
      relations: ["user", "group"],
    });

    let messages: Message[] = [];
    for (const membership of groupMemberships) {
      const membershipMessages = await messageRepository.find({
        where: [
          {
            group: { id: groupId },
            timestamp: MoreThanOrEqual(membership.joinedAt),
          },
          ...(membership.leftAt
            ? [
                {
                  group: { id: groupId },
                  timestamp: LessThanOrEqual(membership.leftAt),
                },
              ]
            : []),
        ],
        relations: ["sender"],
      });
      messages = messages.concat(membershipMessages);
    }

    return messages;
  }
}
