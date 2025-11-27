import { TestBed } from '@angular/core/testing';
import { QueryBuilderModule } from './querybuilder.module';

describe('QueryBuilderModule', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QueryBuilderModule]
    }).compileComponents();
  });

  it('should create', () => {
    expect(QueryBuilderModule).toBeDefined();
  });
});