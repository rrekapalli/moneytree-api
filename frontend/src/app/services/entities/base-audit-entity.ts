/**
 * Base audit entity interface that extends BaseEntity and provides auditing fields.
 * This interface includes fields for tracking who created and modified the entity and when.
 */
import { BaseEntity } from './base-entity';

export interface BaseAuditEntity extends BaseEntity {
    createdBy: string;
    modifiedBy: string;
    createdOn: string; // ISO date string representation of Timestamp
    modifiedOn: string; // ISO date string representation of Timestamp
}