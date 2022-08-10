import {
    Entity,
    PrimaryColumn,
    Column,
    BeforeInsert,
    CreateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';


@Entity()
export class Space {
    @BeforeInsert()
    generateId() {
        if (!this.id) {
            this.id = uuidv4();
        }
    }
    @PrimaryColumn()
    id?: string;

    @Column()
    title?: string;

    @Column()
    identity?: string;

    @Column()
    content?: string;

    @Column()
    cordSpace?: string;

    @Column()
    cordBlock?: string;

    @Column()
    schema?: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt?: Date;
}
