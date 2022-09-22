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
export class Record {
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

    /* active is the one, which is on the chain */
    @Column()
    active?: boolean;

    /* revoked is 'marked as revoked' on chain for given identifier */
    @Column()
    revoked?: boolean;

    @Column()
    title?: string;

    @Column({length: 64})
    identity?: string;

    @Column({type: 'text'})
    content?: string;

    @Column({type: 'text'})
    cordStreamContent?: string;

    @Column({type: 'text'})
    cordStream?: string;

    @Column({nullable: true})
    cordBlock?: string;

    @Column({nullable: true, type: 'text'})
    credential?: string;

    @Column({nullable: true, type: 'text'})
    vc?: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt?: Date;

    /* needed as there are 'updates', 'commit' and 'revoke' possible */
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt?: Date;
}
