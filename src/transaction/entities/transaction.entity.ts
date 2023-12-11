import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Transaction {
    @PrimaryColumn({ name: 'transaction_id'})
    id: number;

    @Column()
    title: string;

    @Column()
    type: string

    @Column()
    amount: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
