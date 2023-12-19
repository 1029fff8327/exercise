import {
  Column,
  CreateDateColumn,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn 
} from "typeorm";

export class User {
@PrimaryGeneratedColumn('uuid')
id: string;

@Column({type: 'varchar', length: 255, unique: true })
@Index({ unique: true })
email: string;

@Column({ type: 'varchar', length: 255 })
password: string;

@Column({ type: 'boolean', default: false }) 
isActivated: boolean;

@Column({  type: 'varchar', length: 255, nullable: true })
resetToken: string;

@Column({ type: 'varchar', length: 255, nullable: true }) 
  refreshToken: string;

  @Column({ type: 'varchar', length: 255, nullable: true }) 
  accessToken: string;

@CreateDateColumn()
createdAt: Date;

@UpdateDateColumn()
updatedAt: Date;
}