
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { ChangePasswordService } from './services/change-paassword.service';
 
type FieldKey = 'current' | 'new' | 'confirm';
type ControlName = 'currentPassword' | 'newPassword' | 'confirmPassword';
 
// قواعد على الفورم كله: الباسورد الجديد لازم يختلف عن القديم ويطابق التأكيد
function passwordRules(group: AbstractControl): ValidationErrors | null {
  const current = group.get('currentPassword')?.value;
  const next = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
 
  const errors: ValidationErrors = {};
  if (current && next && current === next) errors['sameAsCurrent'] = true;
  if (next && confirm && next !== confirm) errors['mismatch'] = true;
 
  return Object.keys(errors).length ? errors : null;
}
@Component({
  selector: 'app-changepassword',
  imports: [ReactiveFormsModule],
  templateUrl: './changepassword.component.html',
  styleUrl: './changepassword.component.css',
})
export class ChangepasswordComponent {
  private readonly changePasswordService = inject(ChangePasswordService);
 
  form = new FormGroup(
    {
      currentPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      newPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)],
      }),
      confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    },
    { validators: passwordRules },
  );
 
  // الحقول بتتعرض بلوب واحد في الـ HTML
  readonly fields = [
    { key: 'current', control: 'currentPassword', label: 'Current password', autocomplete: 'current-password' },
    { key: 'new', control: 'newPassword', label: 'New password', autocomplete: 'new-password' },
    { key: 'confirm', control: 'confirmPassword', label: 'Confirm new password', autocomplete: 'new-password' },
  ] as const;
 
  loading = signal(false);
  serverError = signal('');
  show = signal<Record<FieldKey, boolean>>({ current: false, new: false, confirm: false });
 
  // ===== قوة الباسورد الجديد =====
  private readonly newPassword = toSignal(this.form.controls.newPassword.valueChanges, {
    initialValue: '',
  });
 
  strength = computed(() => {
    const value = this.newPassword();
    let score = 0;
    if (value.length >= 8) score++;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
    if (/\d/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    if (!value) score = 0;
 
    const levels = [
      { label: '', color: '' },
      { label: 'Weak', color: 'bg-red-500' },
      { label: 'Fair', color: 'bg-orange-400' },
      { label: 'Good', color: 'bg-lime-500' },
      { label: 'Strong', color: 'bg-green-600' },
    ];
    return { score, ...levels[score] };
  });
 
  toggle(field: FieldKey): void {
    this.show.update((s) => ({ ...s, [field]: !s[field] }));
  }
 
  // رسالة الخطأ تحت كل حقل (بتظهر بعد ما اليوزر يلمس الحقل)
  errorFor(name: ControlName): string {
    const control = this.form.controls[name];
    if (!(control.touched || control.dirty)) return '';
 
    if (control.hasError('required')) return 'This field is required.';
 
    if (name === 'newPassword') {
      if (control.hasError('minlength')) return 'Use at least 8 characters.';
      if (this.form.hasError('sameAsCurrent')) return 'New password must be different from the current one.';
    }
    if (name === 'confirmPassword' && this.form.hasError('mismatch')) {
      return 'Passwords do not match.';
    }
    return '';
  }
 
  submit(): void {
    this.serverError.set('');
 
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
 
    const { currentPassword, newPassword } = this.form.getRawValue();
    this.loading.set(true);
 
    this.changePasswordService
      .ChangePassword({ password: currentPassword, newPassword })
      .subscribe({
        next: (res) => {
          console.log(res);
 
          // بعض الـ APIs بترجّع token جديد بعد تغيير الباسورد
          const newToken = res?.data?.token ?? res?.token;
          if (newToken) localStorage.setItem('token', newToken);
 
          this.loading.set(false);
          this.form.reset();
          this.show.set({ current: false, new: false, confirm: false });
 
          Swal.fire({
            icon: 'success',
            title: 'Password updated',
            text: 'Your password has been changed successfully.',
            confirmButtonColor: '#E75F0F',
            background: '#FFF8F1',
            color: '#44403C',
          });
        },
        error: (err) => {
          console.log(err);
          this.loading.set(false);
          this.serverError.set(
            err?.error?.message ?? 'Could not change the password. Please try again.',
          );
        },
      });
  }
}
 
