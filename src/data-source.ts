import { DataSource } from "typeorm";
import { User, Group, GroupMember, Message } from "./entities";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "database.sqlite",
  synchronize: true,
  logging: true,
  entities: [User, Group, GroupMember, Message],
});
