import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  JoinColumn,
} from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @OneToMany(() => GroupMember, (groupMember) => groupMember.user)
  groupMemberships!: GroupMember[];

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages!: Message[];
}

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @OneToMany(() => GroupMember, (groupMember) => groupMember.group)
  members!: GroupMember[];

  @OneToMany(() => Message, (message) => message.group)
  messages!: Message[];
}

@Entity()
export class GroupMember {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.groupMemberships)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Group, (group) => group.members)
  @JoinColumn({ name: "group_id" })
  group!: Group;

  @CreateDateColumn({ name: "joined_at", type: "datetime" })
  joinedAt!: Date;

  @Column({ name: "left_at", type: "datetime", nullable: true })
  leftAt!: Date | null;
}

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  content!: string;

  @Column()
  type!: "text" | "video" | "audio";

  @CreateDateColumn()
  timestamp!: Date;

  @ManyToOne(() => User, (user) => user.sentMessages)
  sender!: User;

  @ManyToOne(() => Group, (group) => group.messages, { nullable: true })
  group!: Group | null;
}
