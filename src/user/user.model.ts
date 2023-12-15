import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn 
} from "typeorm";

export class User {
@PrimaryGeneratedColumn()
id: number;

@Column()
email: string;

@Column()
password: string;

@Column({ default: false }) 
isActivated: boolean;

@Column({ nullable: true })
resetToken: string;

@CreateDateColumn()
createdAt: Date;

@UpdateDateColumn()
updatedAt: Date;
}