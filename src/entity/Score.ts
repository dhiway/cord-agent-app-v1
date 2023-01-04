import {
    Entity,
    PrimaryColumn,
    Column,
    BeforeInsert,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';


@Entity()
export class Score {
    @BeforeInsert()
    generateId() {
        if (!this.id) {
            this.id = uuidv4();
        }
    }
    @PrimaryColumn()
    id?: string;

    /* same identifier can be used for multiple records on update, always use latest to indicate the specific one */
    @Column()
    latest?: boolean;

    @Column({default: null, nullable: true})
    entity?: string;

    @Column({length: 64})
    uid?: string;

    @Column({length: 64})
    tid?: string;

    @Column({default: null, nullable: true})
    collector?: string;

    @Column({default: null, nullable: true})
    requestor?: string;

    @Column()
    type?: string;

    @Column()
    score?: number;
    
    @Column()
    identifier?: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt?: Date;

    /* needed as there are 'updates', 'commit' and 'revoke' possible */
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt?: Date;
}
