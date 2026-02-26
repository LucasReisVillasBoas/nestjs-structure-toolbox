import { Entity, BaseEntity as MikroEntity, Property } from '@mikro-orm/core';

@Entity({ abstract: true })
export abstract class DefaultEntity extends MikroEntity {
  @Property({ onCreate: () => new Date() })
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();
}
