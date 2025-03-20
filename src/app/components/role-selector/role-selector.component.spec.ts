import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoleSelectorComponent } from './role-selector.component';

describe('RoleSelectorComponent', () => {
  let component: RoleSelectorComponent;
  let fixture: ComponentFixture<RoleSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleSelectorComponent]
    }).compileComponents();
    
    fixture = TestBed.createComponent(RoleSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty selected role', () => {
    expect(component.selectedRole).toBe('');
  });

  it('should emit role change when a role is selected', () => {
    // Create a spy to watch the roleChange event emitter
    const roleChangeSpy = jest.spyOn(component.roleChange, 'emit');
    
    // Simulate selecting a role
    component.onRoleChange('admin');
    
    // Check if the roleChange event was emitted with the correct value
    expect(roleChangeSpy).toHaveBeenCalledWith('admin');
  });

  it('should have correct roles array', () => {
    expect(component.roles).toEqual([
      { value: 'admin', label: 'Administrador' },
      { value: 'user', label: 'Usuario' }
    ]);
  });
}); 